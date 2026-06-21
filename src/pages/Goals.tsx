import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { GoalCard } from '../components/goals/GoalCard';
import { Goal } from '../types/chat';
import { Target, PlusCircle, BarChart3, UserCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '../hooks/use-toast';

const Goals: React.FC = () => {
  const { isAdmin, users, currentUser } = useUser();
  const { profile } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showUserContributions, setShowUserContributions] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalType, setNewGoalType] = useState<'count' | 'sum'>('count');
  const [newGoalTarget, setNewGoalTarget] = useState('100');

  const loadGoals = async () => {
    const { data: goalsData } = await supabase.from('goals').select('*').order('created_at', { ascending: false });
    const { data: contribData } = await supabase.from('goal_contributions').select('*');
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

  const handleUpdateGoal = async (updatedGoal: Goal) => {
    await supabase.from('goals').update({ current: updatedGoal.current, title: updatedGoal.title, target: updatedGoal.target }).eq('id', updatedGoal.id);
    for (const uc of updatedGoal.userContributions) {
      await supabase.from('goal_contributions').upsert({ goal_id: updatedGoal.id, user_id: uc.userId, contribution: uc.contribution });
    }
    loadGoals();
  };

  const handleDeleteGoal = async (goalId: string) => {
    await supabase.from('goals').delete().eq('id', goalId);
    toast({ title: 'Ziel gelöscht' });
    loadGoals();
  };

  const userContributions: Record<string, number> = {};
  users.forEach(u => { userContributions[u.id] = 0; });
  goals.forEach(g => g.userContributions.forEach(c => {
    if (userContributions[c.userId] !== undefined) userContributions[c.userId] += c.contribution;
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
          <div className="bg-card rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><UserCircle className="w-5 h-5 text-primary" />Mitarbeiterbeiträge</h2>
            <div className="space-y-4">
              {Object.entries(userContributions).sort(([, a], [, b]) => b - a).map(([userId, contribution]) => {
                const user = users.find(u => u.id === userId);
                return (
                  <div key={userId} className="flex justify-between items-center p-3 bg-background border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">{user?.name.charAt(0) ?? '?'}</div>
                      <span className="font-medium">{user?.name ?? 'Unbekannt'}</span>
                    </div>
                    <div className="text-2xl font-bold">{contribution}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {goals.map(goal => (
              <GoalCard key={goal.id} goal={goal} onUpdateGoal={handleUpdateGoal} onDeleteGoal={handleDeleteGoal} isEditable={isAdmin} />
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
