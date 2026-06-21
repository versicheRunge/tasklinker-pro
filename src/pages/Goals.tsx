import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { GoalCard } from '../components/goals/GoalCard';
import { Goal } from '../types/chat';
import { Target, PlusCircle, BarChart3, Clock } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '../hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface ContribLogEntry {
  id: string;
  goal_id: string;
  user_id: string;
  delta: number;
  note: string | null;
  created_at: string;
}

const Goals: React.FC = () => {
  const { isAdmin, users, currentUser } = useUser();
  const { profile } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [contribLog, setContribLog] = useState<ContribLogEntry[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showUserContributions, setShowUserContributions] = useState(false);
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalType, setNewGoalType] = useState<'count' | 'sum'>('count');
  const [newGoalTarget, setNewGoalTarget] = useState('100');

  const loadGoals = async () => {
    const { data: goalsData } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
    const { data: contribData } = await supabase.from('goal_contributions').select('*');
    const { data: logData } = await supabase.from('goal_contribution_log').select('*').order('created_at', { ascending: false }).limit(200);
    if (!goalsData) return;

    setGoals(goalsData.map((g: any) => ({
      id: g.id,
      title: g.title,
      type: g.type,
      target: g.target,
      current: g.current,
      createdAt: g.created_at,
      userContributions: (contribData ?? [])
        .filter((c: any) => c.goal_id === g.id)
        .map((c: any) => ({ userId: c.user_id, contribution: c.contribution })),
    })));
    setContribLog(logData ?? []);
  };

  useEffect(() => { if (profile) loadGoals(); }, [profile]);

  const handleAddGoal = async () => {
    if (!newGoalTitle.trim()) { toast({ title: 'Fehler', description: 'Bitte Titel eingeben.', variant: 'destructive' }); return; }
    const target = parseInt(newGoalTarget);
    if (isNaN(target) || target <= 0) { toast({ title: 'Fehler', description: 'Ungültiger Zielwert.', variant: 'destructive' }); return; }

    const { error } = await supabase.from('goals').insert({
      title: newGoalTitle.trim(), type: newGoalType, target, current: 0, created_by: profile?.id,
    });
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }

    toast({ title: 'Ziel erstellt', description: `"${newGoalTitle}" wurde erstellt.` });
    setNewGoalTitle(''); setNewGoalType('count'); setNewGoalTarget('100'); setIsAddDialogOpen(false);
    loadGoals();
  };

  const handleUpdateGoal = async (updatedGoal: Goal, delta?: number) => {
    await supabase.from('goals').update({ current: updatedGoal.current, title: updatedGoal.title, target: updatedGoal.target }).eq('id', updatedGoal.id);
    for (const uc of updatedGoal.userContributions) {
      await supabase.from('goal_contributions').upsert({ goal_id: updatedGoal.id, user_id: uc.userId, contribution: uc.contribution });
    }
    // Log the delta for admin history
    if (delta && delta !== 0 && profile) {
      await supabase.from('goal_contribution_log').insert({
        goal_id: updatedGoal.id,
        user_id: profile.id,
        delta,
      });
    }
    loadGoals();
  };

  const handleDeleteGoal = async (goalId: string) => {
    await supabase.from('goals').delete().eq('id', goalId);
    toast({ title: 'Ziel gelöscht' });
    loadGoals();
  };

  // Summary: total per user across all goals
  const userTotals: Record<string, number> = {};
  users.forEach(u => { userTotals[u.id] = 0; });
  goals.forEach(g => g.userContributions.forEach(c => {
    if (userTotals[c.userId] !== undefined) userTotals[c.userId] += c.contribution;
  }));

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Aktuelle Ziele</h1>
          </div>
          <div className="flex gap-3">
            {isAdmin && <Button onClick={() => setIsAddDialogOpen(true)}><PlusCircle className="w-4 h-4 mr-2" />Neues Ziel</Button>}
            {isAdmin && (
              <Button variant="outline" onClick={() => setShowUserContributions(!showUserContributions)}>
                {showUserContributions ? <><Target className="w-4 h-4 mr-2" />Ziele</> : <><BarChart3 className="w-4 h-4 mr-2" />Beiträge</>}
              </Button>
            )}
          </div>
        </div>

        {showUserContributions && isAdmin ? (
          <div className="space-y-6">
            {/* Team total leaderboard */}
            <div className="bg-card rounded-lg border p-6">
              <h2 className="text-lg font-semibold mb-4">Team-Übersicht (gesamt)</h2>
              <div className="space-y-3">
                {Object.entries(userTotals).sort(([, a], [, b]) => b - a).map(([userId, total]) => {
                  const user = users.find(u => u.id === userId);
                  const maxVal = Math.max(...Object.values(userTotals), 1);
                  return (
                    <div key={userId} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
                        {user?.name?.charAt(0) ?? '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{user?.name ?? 'Unbekannt'}</span>
                          <span className="text-sm font-bold">{total}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full">
                          <div className="h-2 bg-primary rounded-full transition-all" style={{ width: `${(total / maxVal) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Per-goal breakdown */}
            {goals.map(goal => {
              const isExpanded = expandedGoal === goal.id;
              const goalLog = contribLog.filter(e => e.goal_id === goal.id);
              return (
                <div key={goal.id} className="bg-card rounded-lg border p-5">
                  <button
                    className="w-full flex justify-between items-center text-left"
                    onClick={() => setExpandedGoal(isExpanded ? null : goal.id)}
                  >
                    <h3 className="font-semibold flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      {goal.title}
                      <span className="text-muted-foreground font-normal text-sm">({goal.current}/{goal.target})</span>
                    </h3>
                    <span className="text-xs text-muted-foreground">{isExpanded ? '▲ Einklappen' : '▼ Details'}</span>
                  </button>

                  {isExpanded && (
                    <div className="mt-4 space-y-4">
                      {/* per-user contribution bars */}
                      <div className="space-y-2">
                        {goal.userContributions.filter(c => c.contribution > 0).sort((a, b) => b.contribution - a.contribution).map(c => {
                          const user = users.find(u => u.id === c.userId);
                          return (
                            <div key={c.userId} className="flex items-center gap-2 text-sm">
                              <span className="w-32 truncate">{user?.name ?? '?'}</span>
                              <div className="flex-1 h-2 bg-muted rounded-full">
                                <div className="h-2 bg-primary rounded-full" style={{ width: `${goal.current > 0 ? (c.contribution / goal.current) * 100 : 0}%` }} />
                              </div>
                              <span className="w-8 text-right font-medium">{c.contribution}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Log entries */}
                      {goalLog.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Verlauf
                          </h4>
                          <div className="space-y-1 max-h-48 overflow-y-auto">
                            {goalLog.map(entry => {
                              const user = users.find(u => u.id === entry.user_id);
                              return (
                                <div key={entry.id} className="flex items-center gap-2 text-xs py-1 border-b border-border/50">
                                  <span className={`font-bold w-6 text-center ${entry.delta > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {entry.delta > 0 ? `+${entry.delta}` : entry.delta}
                                  </span>
                                  <span className="font-medium">{user?.name ?? '?'}</span>
                                  {entry.note && <span className="text-muted-foreground italic">"{entry.note}"</span>}
                                  <span className="ml-auto text-muted-foreground">
                                    {format(new Date(entry.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {goals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdateGoal={(g, delta) => handleUpdateGoal(g, delta)}
                onDeleteGoal={handleDeleteGoal}
                isEditable={isAdmin}
              />
            ))}
            {goals.length === 0 && (
              <div className="col-span-full text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">{isAdmin ? 'Keine Ziele vorhanden. Erstellen Sie ein neues Ziel.' : 'Aktuell sind keine Ziele definiert.'}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isAdmin && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Neues Ziel erstellen</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Titel</Label>
                <Input placeholder="z.B. Abgeschlossene Vorgänge diesen Monat" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Typ</Label>
                <Select value={newGoalType} onValueChange={v => setNewGoalType(v as 'count' | 'sum')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Stückzahl</SelectItem>
                    <SelectItem value="sum">Summe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Zielwert</Label>
                <Input type="number" min="1" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Abbrechen</Button>
              <Button onClick={handleAddGoal}>Ziel erstellen</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
};

export default Goals;
