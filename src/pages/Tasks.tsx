import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';
import { Plus, CheckSquare, Square, Trash2, CalendarDays, ClipboardList } from 'lucide-react';
import { Button } from '../components/ui/button';
import { format, isPast, isToday } from 'date-fns';
import { de } from 'date-fns/locale';

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

export default function Tasks() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState<'open' | 'done' | 'all'>('open');

  const load = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('user_tasks').select('*').order('due_date', { ascending: true, nullsFirst: false });
    if (data) setTasks(data);
    setIsLoading(false);
  };

  useEffect(() => { if (profile) load(); }, [profile]);

  const create = async () => {
    if (!title.trim()) { toast({ title: 'Titel erforderlich', variant: 'destructive' }); return; }
    const { error } = await supabase.from('user_tasks').insert({
      user_id: profile!.id,
      title: title.trim(),
      description: description.trim() || null,
      due_date: dueDate || null,
    });
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    setTitle(''); setDescription(''); setDueDate(''); setShowForm(false);
    toast({ title: 'Aufgabe erstellt' });
    load();
  };

  const toggle = async (task: Task) => {
    await supabase.from('user_tasks').update({ completed: !task.completed, updated_at: new Date().toISOString() }).eq('id', task.id);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !t.completed } : t));
  };

  const remove = async (id: string) => {
    await supabase.from('user_tasks').delete().eq('id', id);
    setTasks(prev => prev.filter(t => t.id !== id));
    toast({ title: 'Aufgabe gelöscht' });
  };

  const filtered = tasks.filter(t => {
    if (filter === 'open') return !t.completed;
    if (filter === 'done') return t.completed;
    return true;
  });

  const openCount = tasks.filter(t => !t.completed).length;
  const overdueCount = tasks.filter(t => !t.completed && t.due_date && isPast(new Date(t.due_date)) && !isToday(new Date(t.due_date))).length;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Meine Aufgaben</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {openCount} offen{overdueCount > 0 && <span className="text-red-500 ml-1">· {overdueCount} überfällig</span>}
            </p>
          </div>
          <Button onClick={() => setShowForm(s => !s)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Neue Aufgabe
          </Button>
        </div>

        {/* New task form */}
        {showForm && (
          <div className="bg-card border border-border rounded-xl p-4 mb-5 space-y-3">
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && create()}
              placeholder="Aufgabe eingeben…"
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <div className="flex gap-2">
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Beschreibung (optional)"
                className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={create}>Erstellen</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Abbrechen</Button>
            </div>
          </div>
        )}

        {/* Filter tabs */}
        <div className="flex gap-1 mb-4 bg-muted p-1 rounded-lg w-fit">
          {(['open', 'done', 'all'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${filter === f ? 'bg-card shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              {f === 'open' ? 'Offen' : f === 'done' ? 'Erledigt' : 'Alle'}
            </button>
          ))}
        </div>

        {/* Task list */}
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-muted rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{filter === 'open' ? 'Keine offenen Aufgaben' : 'Keine Einträge'}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(task => {
              const isOverdue = !task.completed && task.due_date && isPast(new Date(task.due_date)) && !isToday(new Date(task.due_date));
              const isDueToday = !task.completed && task.due_date && isToday(new Date(task.due_date));
              return (
                <div key={task.id} className={`bg-card border rounded-xl px-4 py-3 flex items-start gap-3 transition-colors ${
                  isOverdue ? 'border-red-200 dark:border-red-900' : isDueToday ? 'border-amber-200 dark:border-amber-900' : 'border-border'
                }`}>
                  <button onClick={() => toggle(task)} className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors">
                    {task.completed ? <CheckSquare className="w-5 h-5 text-green-500" /> : <Square className="w-5 h-5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                    {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                    {task.due_date && (
                      <p className={`text-xs mt-1 flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : isDueToday ? 'text-amber-600 font-medium' : 'text-muted-foreground'}`}>
                        <CalendarDays className="w-3 h-3" />
                        {isOverdue && 'Überfällig · '}
                        {isDueToday && 'Heute · '}
                        {format(new Date(task.due_date), 'dd. MMMM yyyy', { locale: de })}
                      </p>
                    )}
                  </div>
                  <button onClick={() => remove(task.id)}
                    className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
