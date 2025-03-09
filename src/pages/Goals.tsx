
import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { GoalCard } from '../components/goals/GoalCard';
import { Goal } from '../types/chat';
import { Target, Plus, PlusCircle, BarChart3, UserCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useUser } from '../contexts/UserContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from '../hooks/use-toast';

const Goals: React.FC = () => {
  const { isAdmin, users, currentUser } = useUser();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showUserContributions, setShowUserContributions] = useState(false);
  
  // Form state
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalType, setNewGoalType] = useState<'count' | 'sum'>('count');
  const [newGoalTarget, setNewGoalTarget] = useState('100');
  
  // Load goals from localStorage
  useEffect(() => {
    const storedGoals = localStorage.getItem('goals');
    if (storedGoals) {
      setGoals(JSON.parse(storedGoals));
    }
  }, []);
  
  // Save goals to localStorage
  useEffect(() => {
    if (goals.length > 0) {
      localStorage.setItem('goals', JSON.stringify(goals));
    }
  }, [goals]);
  
  const handleAddGoal = () => {
    if (!newGoalTitle.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel für das Ziel ein.",
        variant: "destructive"
      });
      return;
    }
    
    const target = parseInt(newGoalTarget);
    if (isNaN(target) || target <= 0) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen gültigen Zielwert ein.",
        variant: "destructive"
      });
      return;
    }
    
    const newGoal: Goal = {
      id: `goal-${Date.now()}`,
      title: newGoalTitle.trim(),
      type: newGoalType,
      target: target,
      current: 0,
      createdAt: new Date().toISOString(),
      userContributions: []
    };
    
    setGoals(prev => [...prev, newGoal]);
    
    // Reset form
    setNewGoalTitle('');
    setNewGoalType('count');
    setNewGoalTarget('100');
    setIsAddDialogOpen(false);
    
    toast({
      title: "Ziel erstellt",
      description: `Das Ziel "${newGoalTitle}" wurde erfolgreich erstellt.`
    });
  };
  
  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(prev => 
      prev.map(goal => 
        goal.id === updatedGoal.id ? updatedGoal : goal
      )
    );
  };
  
  const handleDeleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
    
    toast({
      title: "Ziel gelöscht",
      description: "Das Ziel wurde erfolgreich gelöscht."
    });
  };
  
  // Get user contributions for all goals
  const getUserContributions = () => {
    const userContributions: Record<string, number> = {};
    
    users.forEach(user => {
      userContributions[user.id] = 0;
    });
    
    goals.forEach(goal => {
      goal.userContributions.forEach(contribution => {
        if (userContributions[contribution.userId] !== undefined) {
          userContributions[contribution.userId] += contribution.contribution;
        }
      });
    });
    
    return userContributions;
  };
  
  const userContributions = getUserContributions();

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Aktuelle Ziele</h1>
          </div>
          
          <div className="flex gap-3">
            {isAdmin && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <PlusCircle className="w-4 h-4 mr-2" /> Neues Ziel
              </Button>
            )}
            
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => setShowUserContributions(!showUserContributions)}
              >
                {showUserContributions ? (
                  <>
                    <Target className="w-4 h-4 mr-2" /> Ziele anzeigen
                  </>
                ) : (
                  <>
                    <BarChart3 className="w-4 h-4 mr-2" /> Beiträge anzeigen
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        
        {showUserContributions && isAdmin ? (
          <div className="bg-card rounded-lg border p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5 text-primary" />
              Mitarbeiterbeiträge
            </h2>
            
            <div className="space-y-4">
              {Object.entries(userContributions)
                .sort(([, contribA], [, contribB]) => contribB - contribA)
                .map(([userId, contribution]) => {
                  const user = users.find(u => u.id === userId);
                  return (
                    <div key={userId} className="flex justify-between items-center p-3 bg-background border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                          {user?.name.charAt(0) || "?"}
                        </div>
                        <span className="font-medium">{user?.name || "Unbekannter Benutzer"}</span>
                      </div>
                      <div className="text-2xl font-bold">{contribution}</div>
                    </div>
                  );
                })
              }
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {goals.map(goal => (
              <GoalCard 
                key={goal.id}
                goal={goal}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
                isEditable={isAdmin}
              />
            ))}
            
            {goals.length === 0 && (
              <div className="col-span-full text-center py-12 bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">
                  {isAdmin 
                    ? "Keine Ziele vorhanden. Erstellen Sie ein neues Ziel mit dem Button oben rechts."
                    : "Aktuell sind keine Ziele definiert."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {isAdmin && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neues Ziel erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Titel</Label>
                <Input
                  id="goal-title"
                  placeholder="z.B. Abgeschlossene Vorgänge diesen Monat"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal-type">Typ</Label>
                <Select
                  value={newGoalType}
                  onValueChange={(value) => setNewGoalType(value as 'count' | 'sum')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Typ auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Stückzahl</SelectItem>
                    <SelectItem value="sum">Summe</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal-target">Zielwert</Label>
                <Input
                  id="goal-target"
                  type="number"
                  min="1"
                  placeholder="z.B. 100"
                  value={newGoalTarget}
                  onChange={(e) => setNewGoalTarget(e.target.value)}
                />
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
