import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { toast } from '../hooks/use-toast';
import {
  Plus, CheckSquare, Square, Trash2, CalendarDays, ClipboardList,
  UserCheck, Clock, Undo2, UserRoundCog, ChevronDown, RotateCcw, ArrowRight,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { format, isPast, isToday } from 'date-fns';
import { de } from 'date-fns/locale';

interface Task {
  id: string;
  user_id: string;                      // current assignee
  created_by: string;                   // original creator
  original_assignee_id: string | null;  // first intended assignee (never changes)
  reassigned_from_id: string | null;    // who last passed this task
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

// ── Reassign popover ────────────────────────────────────────────────────────
function ReassignMenu({ task, myId, users, onReassign }: {
  task: Task; myId: string; users: any[];
  onReassign: (taskId: string, newUserId: string, prevUserId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const candidates = users.filter(u => u.id !== task.user_id);
  const creator    = users.find(u => u.id === task.created_by);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors"
        title="Weiterleiten / Zurückziehen"
      >
        <UserRoundCog className="w-3.5 h-3.5" />
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden py-1">
          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground">Übergeben an…</div>

          {/* Return to creator (if current assignee is not the creator) */}
          {task.created_by !== task.user_id && (
            <button
              onClick={() => { onReassign(task.id, task.created_by, task.user_id); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
            >
              <Undo2 className="w-3.5 h-3.5 text-primary shrink-0" />
              <span className="truncate">
                {task.created_by === myId
                  ? 'Mir selbst (zurückziehen)'
                  : `Zurück an ${creator?.name ?? 'Ersteller'}`}
              </span>
            </button>
          )}

          {/* Other MAs */}
          {candidates.filter(u => u.id !== task.created_by).length > 0 && (
            <div className="border-t border-border mt-1 pt-1">
              <div className="px-3 py-1 text-xs text-muted-foreground">An anderen MA</div>
              {candidates.filter(u => u.id !== task.created_by).map(u => (
                <button
                  key={u.id}
                  onClick={() => { onReassign(task.id, u.id, task.user_id); setOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                >
                  <UserCheck className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="truncate">{u.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Chain badge ─────────────────────────────────────────────────────────────
function ChainBadge({ task, users, myId }: { task: Task; users: any[]; myId: string }) {
  if (!task.original_assignee_id || task.original_assignee_id === task.user_id) return null;
  const original = users.find(u => u.id === task.original_assignee_id);
  const current  = users.find(u => u.id === task.user_id);
  if (!original || !current) return null;

  return (
    <span className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400"
      title="Diese Aufgabe wurde weitergeleitet — nicht bei der ursprünglich zugewiesenen Person">
      <ArrowRight className="w-2.5 h-2.5 shrink-0" />
      {original.id === myId ? 'du' : original.name}
      {' → '}
      {current.id === myId ? 'du' : current.name}
    </span>
  );
}

// ── Task row ────────────────────────────────────────────────────────────────
function TaskRow({
  task, myId, isAdmin, users, onToggle, onDelete, onReassign, onReopen, onSave,
  showAssignee, showCreator, showChain,
}: {
  task: Task; myId: string; isAdmin: boolean; users: any[];
  onToggle: (t: Task) => void; onDelete: (id: string) => void;
  onReassign: (taskId: string, newUserId: string, prevUserId: string) => void;
  onReopen: (t: Task) => void;
  onSave: (taskId: string, fields: { title: string; description: string; due_date: string }) => void;
  showAssignee?: boolean; showCreator?: boolean; showChain?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDesc, setEditDesc] = useState(task.description ?? '');
  const [editDate, setEditDate] = useState(task.due_date ?? '');

  const isOverdue  = !task.completed && task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
  const isDueToday = !task.completed && task.due_date && isToday(new Date(task.due_date));
  const canToggle  = task.user_id === myId && !task.completed;
  const canReopen  = task.completed && (task.created_by === myId || isAdmin);
  const canEdit    = task.user_id === myId || task.created_by === myId || isAdmin;
  const canDelete  = task.created_by === myId || task.user_id === myId || isAdmin;
  const canReassign = !task.completed && (task.user_id === myId || task.created_by === myId || isAdmin);
  const creator  = users.find(u => u.id === task.created_by);
  const from     = task.reassigned_from_id ? users.find(u => u.id === task.reassigned_from_id) : null;
  const assignee = users.find(u => u.id === task.user_id);

  const startEdit = () => {
    if (!canEdit || task.completed) return;
    setEditTitle(task.title);
    setEditDesc(task.description ?? '');
    setEditDate(task.due_date ?? '');
    setEditing(true);
  };
  const cancelEdit = () => setEditing(false);
  const commitEdit = () => {
    if (!editTitle.trim()) return;
    onSave(task.id, { title: editTitle.trim(), description: editDesc.trim(), due_date: editDate });
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="bg-card border-2 border-primary/30 rounded-xl px-4 py-3 space-y-2">
        <input
          autoFocus
          value={editTitle}
          onChange={e => setEditTitle(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') cancelEdit(); }}
          className="w-full px-2 py-1 border border-border rounded-lg bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <div className="flex gap-2">
          <input
            value={editDesc}
            onChange={e => setEditDesc(e.target.value)}
            placeholder="Beschreibung (optional)"
            className="flex-1 px-2 py-1 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <input
            type="date"
            value={editDate}
            onChange={e => setEditDate(e.target.value)}
            className="px-2 py-1 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={commitEdit} className="px-3 py-1 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90">
            Speichern
          </button>
          <button onClick={cancelEdit} className="px-3 py-1 border border-border rounded-lg text-xs hover:bg-muted">
            Abbrechen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-card border rounded-xl px-4 py-3 flex items-start gap-3 group transition-colors ${
      isOverdue ? 'border-red-200 dark:border-red-900' : isDueToday ? 'border-amber-200 dark:border-amber-900' : 'border-border'
    }`}>
      <button
        onClick={() => canToggle ? onToggle(task) : canReopen ? onReopen(task) : undefined}
        className={`mt-0.5 shrink-0 transition-colors ${
          canToggle  ? 'hover:text-primary cursor-pointer text-muted-foreground'
          : canReopen ? 'hover:text-amber-600 cursor-pointer text-muted-foreground'
          : 'cursor-default opacity-40 text-muted-foreground'
        }`}
        title={canToggle ? 'Als erledigt markieren' : canReopen ? 'Wieder öffnen' : 'Nur der Empfänger kann abhaken'}
      >
        {task.completed
          ? <CheckSquare className="w-5 h-5 text-green-500" />
          : <Square className="w-5 h-5" />}
      </button>

      <div className="flex-1 min-w-0 cursor-pointer" onClick={canEdit && !task.completed ? startEdit : undefined}
        title={canEdit && !task.completed ? 'Klicken zum Bearbeiten' : undefined}>
        <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
          {task.title}
        </p>
        {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {task.due_date && (
            <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : isDueToday ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
              <CalendarDays className="w-3 h-3" />
              {isOverdue && 'Überfällig · '}{isDueToday && 'Heute · '}
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
          {task.user_id === myId && from && from.id !== myId && (
            <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <ArrowRight className="w-3 h-3" /> von {from.name} weitergeleitet
            </span>
          )}
          {showChain && <ChainBadge task={task} users={users} myId={myId} />}
          {task.completed && canReopen && (
            <button onClick={e => { e.stopPropagation(); onReopen(task); }}
              className="text-xs text-amber-600 hover:underline flex items-center gap-1 ml-1">
              <RotateCcw className="w-3 h-3" /> Wieder öffnen
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {canReassign && (
          <ReassignMenu task={task} myId={myId} users={users} onReassign={onReassign} />
        )}
        {canDelete && (
          <button onClick={() => onDelete(task.id)}
            className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
            title="Löschen">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function Tasks() {
  const { profile } = useAuth();
  const { users, isAdmin } = useUser();
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
      .from('user_tasks').select('*')
      .order('completed').order('due_date', { ascending: true, nullsFirst: false });
    if (data) setTasks(data);
    setIsLoading(false);
  };

  useEffect(() => { if (profile) load(); }, [profile]);

  const create = async () => {
    if (!title.trim()) { toast({ title: 'Titel erforderlich', variant: 'destructive' }); return; }
    const targetId = assigneeId || profile!.id;
    const isSelf = targetId === profile!.id;
    const { error } = await supabase.from('user_tasks').insert({
      user_id: targetId,
      created_by: profile!.id,
      original_assignee_id: isSelf ? null : targetId,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
    });
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    if (!isSelf) {
      await supabase.from('notifications').insert({
        user_id: targetId, type: 'assignment',
        title: 'Neue Aufgabe erhalten',
        body: `${profile!.full_name ?? 'Jemand'}: ${title.trim()}`, read: false,
      });
      toast({ title: `Aufgabe an ${users.find(u => u.id === targetId)?.name} vergeben` });
    } else {
      toast({ title: 'Aufgabe erstellt' });
    }
    setTitle(''); setDescription(''); setDueDate(''); setAssigneeId(''); setShowForm(false);
    load();
  };

  const toggle = async (task: Task) => {
    await supabase.from('user_tasks')
      .update({ completed: true, updated_at: new Date().toISOString() }).eq('id', task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t));
    if (task.created_by && task.created_by !== profile!.id) {
      await supabase.from('notifications').insert({
        user_id: task.created_by, type: 'system',
        title: 'Aufgabe erledigt ✓', body: task.title, read: false,
      });
    }
  };

  const reopen = async (task: Task) => {
    await supabase.from('user_tasks')
      .update({ completed: false, updated_at: new Date().toISOString() }).eq('id', task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: false } : t));
    toast({ title: 'Aufgabe wieder geöffnet' });
    if (task.user_id !== profile!.id) {
      await supabase.from('notifications').insert({
        user_id: task.user_id, type: 'system',
        title: 'Aufgabe wieder geöffnet', body: task.title, read: false,
      });
    }
  };

  const reassign = async (taskId: string, newUserId: string, prevUserId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const { error } = await supabase.from('user_tasks').update({
      user_id: newUserId,
      reassigned_from_id: prevUserId,
      completed: false,
      updated_at: new Date().toISOString(),
    }).eq('id', taskId);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    if (newUserId === profile!.id) {
      toast({ title: 'Aufgabe zurückgezogen' });
    } else {
      const name = users.find(u => u.id === newUserId)?.name ?? 'Mitarbeiter';
      await supabase.from('notifications').insert({
        user_id: newUserId, type: 'assignment',
        title: 'Aufgabe weitergeleitet',
        body: `${profile!.full_name ?? 'Jemand'}: ${task.title}`, read: false,
      });
      toast({ title: `An ${name} weitergeleitet` });
    }
    load();
  };

  const remove = async (id: string) => {
    await supabase.from('user_tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
    toast({ title: 'Aufgabe gelöscht' });
  };

  const myId = profile?.id ?? '';
  const myTasks      = tasks.filter(t => t.user_id === myId);
  const assignedByMe = tasks.filter(t => t.created_by === myId && t.user_id !== myId);
  const teamTasks    = isAdmin ? tasks.filter(t => t.user_id !== myId && t.created_by !== myId) : [];
  const myOpen       = myTasks.filter(t => !t.completed);
  const myDone       = myTasks.filter(t => t.completed);
  const assignedOpen = assignedByMe.filter(t => !t.completed);
  const assignedDone = assignedByMe.filter(t => t.completed);
  const overdueCount = myOpen.filter(t => t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))).length;
  const bouncedCount = assignedByMe.filter(t =>
    !t.completed && t.original_assignee_id && t.original_assignee_id !== t.user_id
  ).length;
  const otherUsers = users.filter(u => u.id !== myId);

  const saveEdit = async (taskId: string, fields: { title: string; description: string; due_date: string }) => {
    const { error } = await supabase.from('user_tasks').update({
      title: fields.title,
      description: fields.description || null,
      due_date: fields.due_date || null,
      updated_at: new Date().toISOString(),
    }).eq('id', taskId);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    setTasks(prev => prev.map(t => t.id === taskId ? {
      ...t, title: fields.title, description: fields.description || null, due_date: fields.due_date || null,
    } : t));
    toast({ title: 'Gespeichert' });
  };

  const rowProps = { myId, isAdmin, users, onToggle: toggle, onDelete: remove, onReassign: reassign, onReopen: reopen, onSave: saveEdit };

  const DoneAccordion = ({ items, label, showChain }: { items: Task[]; label: string; showChain?: boolean }) =>
    items.length > 0 ? (
      <details className="mt-2">
        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground select-none py-1.5">
          {items.length} {label}
        </summary>
        <div className="space-y-2 mt-2">
          {items.map(t => <TaskRow key={t.id} task={t} {...rowProps} showAssignee showCreator showChain={showChain} />)}
        </div>
      </details>
    ) : null;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Aufgaben</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {myOpen.length} offen
              {overdueCount > 0 && <span className="text-red-500 ml-1">· {overdueCount} überfällig</span>}
              {assignedOpen.length > 0 && <span className="text-amber-600 ml-1">· {assignedOpen.length} vergeben</span>}
              {bouncedCount > 0 && (
                <span className="text-orange-500 ml-1" title="Aufgaben die weitergeleitet wurden">
                  · {bouncedCount} weitergeleitet ⚠
                </span>
              )}
            </p>
          </div>
          <Button onClick={() => setShowForm(s => !s)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Neue Aufgabe
          </Button>
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-xl p-4 mb-6 space-y-3">
            <input autoFocus value={title} onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !assigneeId && create()}
              placeholder="Aufgabe eingeben…"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <div className="grid grid-cols-2 gap-2">
              <input value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Beschreibung (optional)"
                className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            {otherUsers.length > 0 && (
              <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20">
                <option value="">Für mich selbst</option>
                {otherUsers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
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
          <div className="space-y-8">
            {/* My tasks */}
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Meine Aufgaben</h2>
              {myOpen.length === 0 && myDone.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Keine Aufgaben</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {myOpen.map(t => <TaskRow key={t.id} task={t} {...rowProps} showCreator />)}
                  </div>
                  <DoneAccordion items={myDone} label="erledigte anzeigen" />
                </>
              )}
            </section>

            {/* Assigned by me */}
            <section>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
                Von mir vergeben
                {assignedOpen.length > 0 && (
                  <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                    {assignedOpen.length} offen
                  </span>
                )}
                {bouncedCount > 0 && (
                  <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-semibold px-1.5 py-0.5 rounded-full"
                    title="Weitergeleitet — prüfen ob Aufgabe noch bei der richtigen Person ist">
                    {bouncedCount} weitergeleitet ⚠
                  </span>
                )}
              </h2>
              {assignedByMe.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Noch keine Aufgaben vergeben · beim Erstellen "Für wen?" auswählen
                </p>
              ) : (
                <>
                  <div className="space-y-2">
                    {assignedOpen.map(t => (
                      <TaskRow key={t.id} task={t} {...rowProps} showAssignee showChain />
                    ))}
                  </div>
                  <DoneAccordion items={assignedDone} label="erledigte anzeigen" showChain />
                </>
              )}
            </section>

            {/* Admin team overview */}
            {isAdmin && teamTasks.length > 0 && (
              <section>
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                  Team-Aufgaben (Admin)
                </h2>
                <div className="space-y-2">
                  {teamTasks.filter(t => !t.completed).map(t => (
                    <TaskRow key={t.id} task={t} {...rowProps} showAssignee showCreator showChain />
                  ))}
                </div>
                <DoneAccordion items={teamTasks.filter(t => t.completed)} label="erledigte Team-Aufgaben" showChain />
              </section>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
