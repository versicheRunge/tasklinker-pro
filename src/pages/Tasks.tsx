import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { toast } from '../hooks/use-toast';
import { Plus, CheckSquare, Square, Trash2, CalendarDays, ClipboardList, UserCheck, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { format, isPast, isToday } from 'date-fns';
import { de } from 'date-fns/locale';

interface Task {
  id: string;
  user_id: string;       // assignee
  created_by: string;    // creator
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

function TaskRow({
  task, myId, users, onToggle, onDelete, showAssignee = false, showCreator = false,
}: {
  task: Task; myId: string; users: any[]; onToggle: (t: Task) => void; onDelete: (id: string) => void;
  showAssignee?: boolean; showCreator?: boolean;
}) {
  const isOverdue = !task.completed && task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
  const isDueToday = !task.completed && task.due_date && isToday(new Date(task.due_date));
  const canToggle = task.user_id === myId;
  const canDelete = task.created_by === myId || task.user_id === myId;
  const assignee = users.find(u => u.id === task.user_id);
  const creator = users.find(u => u.id === task.created_by);

  return (
    <div className={`bg-card border rounded-xl px-4 py-3 flex items-start gap-3 transition-colors ${
      isOverdue ? 'border-red-200 dark:border-red-900' : isDueToday ? 'border-amber-200 dark:border-amber-900' : 'border-border'
    }`}>
      <button
        onClick={() => canToggle && onToggle(task)}
        className={`mt-0.5 shrink-0 transition-colors ${canToggle ? 'hover:text-primary cursor-pointer' : 'cursor-default opacity-50'} text-muted-foreground`}
        title={canToggle ? '' : 'Nur der Empfänger kann diese Aufgabe abhaken'}
      >
        {task.completed ? <CheckSquare className="w-5 h-5 text-green-500" /> : <Square className="w-5 h-5" />}
      </button>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
        {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {task.due_date && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : isDueToday ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
              <CalendarDays className="w-3 h-3" />
              {isOverdue && 'Überfällig · '}
              {isDueToday && 'Heute · '}
              {format(new Date(task.due_date), 'dd.MM.yyyy', { locale: de })}
            </span>
          )}
          {showAssignee && assignee && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <UserCheck className="w-3 h-3" /> {assignee.name}
            </span>
          )}
          {showCreator && creator && creator.id !== myId && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> von {creator.name}
            </span>
          )}
          {task.completed && (
            <span className="text-xs text-green-600 font-medium">✓ Erledigt</span>
          )}
        </div>
      </div>

      {canDelete && (
        <button onClick={() => onDelete(task.id)}
          className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors shrink-0 mt-0.5">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function Tasks() {
  const { profile } = useAuth();
  const { users } = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');

  const load = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('user_tasks')
      .select('*')
      .order('completed')
      .order('due_date', { ascending: true, nullsFirst: false });
    if (data) setTasks(data);
    setIsLoading(false);
  };

  useEffect(() => { if (profile) load(); }, [profile]);

  const create = async () => {
    if (!title.trim()) { toast({ title: 'Titel erforderlich', variant: 'destructive' }); return; }
    const targetId = assigneeId || profile!.id;
    const { error } = await supabase.from('user_tasks').insert({
      user_id: targetId,
      created_by: profile!.id,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
    });
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }

    if (targetId !== profile!.id) {
      const assigneeName = users.find(u => u.id === targetId)?.name ?? 'Mitarbeiter';
      await supabase.from('notifications').insert({
        user_id: targetId, type: 'assignment',
        title: 'Neue Aufgabe erhalten',
        body: `${profile!.full_name ?? 'Jemand'}: ${title.trim()}`,
        read: false,
      });
      toast({ title: `Aufgabe an ${assigneeName} vergeben` });
    } else {
      toast({ title: 'Aufgabe erstellt' });
    }

    setTitle(''); setDescription(''); setDueDate(''); setAssigneeId(''); setShowForm(false);
    load();
  };

  const toggle = async (task: Task) => {
    const nowDone = !task.completed;
    await supabase.from('user_tasks').update({ completed: nowDone, updated_at: new Date().toISOString() }).eq('id', task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: nowDone } : t));

    // Notify creator when task is marked done (if different from assignee)
    if (nowDone && task.created_by && task.created_by !== profile!.id) {
      await supabase.from('notifications').insert({
        user_id: task.created_by, type: 'system',
        title: 'Aufgabe erledigt',
        body: task.title,
        read: false,
      });
    }
  };

  const remove = async (id: string) => {
    await supabase.from('user_tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
    toast({ title: 'Aufgabe gelöscht' });
  };

  // Split: mine vs. assigned-by-me-to-others
  const myTasks = tasks.filter(t => t.user_id === profile?.id);
  const assignedByMe = tasks.filter(t => t.created_by === profile?.id && t.user_id !== profile?.id);

  const myOpen = myTasks.filter(t => !t.completed);
  const myDone = myTasks.filter(t => t.completed);
  const overdueCount = myOpen.filter(t => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))).length;
  const assignedOpen = assignedByMe.filter(t => !t.completed);
  const assignedDone = assignedByMe.filter(t => t.completed);

  const otherUsers = users.filter(u => u.id !== profile?.id);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Aufgaben</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {myOpen.length} offen
              {overdueCount > 0 && <span className="text-red-500 ml-1">· {overdueCount} überfällig</span>}
              {assignedOpen.length > 0 && <span className="text-amber-600 ml-1">· {assignedOpen.length} vergeben (offen)</span>}
            </p>
          </div>
          <Button onClick={() => setShowForm(s => !s)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Neue Aufgabe
          </Button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-3">
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !assigneeId && create()}
              placeholder="Aufgabe eingeben…"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Beschreibung (optional)"
                className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {otherUsers.length > 0 && (
              <select
                value={assigneeId}
                onChange={e => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Für mich selbst</option>
                {otherUsers.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            )}
            <div className="flex gap-2">
              <Button onClick={create}>
                {assigneeId ? `Vergeben an ${users.find(u => u.id === assigneeId)?.name}` : 'Erstellen'}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Abbrechen</Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-muted rounded-xl" />)}
          </div>
        ) : (
          <>
            {/* My tasks */}
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Meine Aufgaben</h2>
              {myOpen.length === 0 && myDone.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Keine Aufgaben</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {myOpen.map(t => (
                    <TaskRow key={t.id} task={t} myId={profile!.id} users={users}
                      onToggle={toggle} onDelete={remove} showCreator />
                  ))}
                  {myDone.length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground select-none">
                        {myDone.length} erledigte Aufgaben anzeigen
                      </summary>
                      <div className="space-y-2 mt-2">
                        {myDone.map(t => (
                          <TaskRow key={t.id} task={t} myId={profile!.id} users={users}
                            onToggle={toggle} onDelete={remove} showCreator />
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </section>

            {/* Assigned by me */}
            {(assignedByMe.length > 0 || true) && (
              <section>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                  Von mir vergeben
                  {assignedOpen.length > 0 && (
                    <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                      {assignedOpen.length} offen
                    </span>
                  )}
                </h2>
                {assignedByMe.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Noch keine Aufgaben vergeben · beim Erstellen "Für wen?" auswählen
                  </p>
                ) : (
                  <div className="space-y-2">
                    {assignedOpen.map(t => (
                      <TaskRow key={t.id} task={t} myId={profile!.id} users={users}
                        onToggle={toggle} onDelete={remove} showAssignee />
                    ))}
                    {assignedDone.length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground select-none">
                          {assignedDone.length} erledigte anzeigen
                        </summary>
                        <div className="space-y-2 mt-2">
                          {assignedDone.map(t => (
                            <TaskRow key={t.id} task={t} myId={profile!.id} users={users}
                              onToggle={toggle} onDelete={remove} showAssignee />
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
