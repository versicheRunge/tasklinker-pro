
import React, { useState } from 'react';
import { Goal } from '../../types/chat';
import { Button } from '../ui/button';
import { Target, Plus, Minus, Pencil, Trash, Check, X } from 'lucide-react';
import { Progress } from '../ui/progress';
import { useUser } from '../../contexts/UserContext';
import { Badge } from '../ui/badge';
import { showConfetti } from '../cases/detail/ConfettiEffect';

interface GoalCardProps {
  goal: Goal;
  onUpdateGoal: (updatedGoal: Goal) => void;
  onDeleteGoal: (goalId: string) => void;
  isEditable?: boolean;
}

export const GoalCard: React.FC<GoalCardProps> = ({ 
  goal, 
  onUpdateGoal, 
  onDeleteGoal,
  isEditable = false
}) => {
  const { currentUser, isAdmin } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(goal.title);
  const [editTarget, setEditTarget] = useState(goal.target.toString());

  const progressPercentage = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  
  // Find user's contribution to this goal
  const myContribution = currentUser 
    ? goal.userContributions.find(c => c.userId === currentUser.id)?.contribution || 0
    : 0;
  
  const handleIncrement = () => {
    // Don't allow going over target
    if (goal.current >= goal.target) return;
    
    const newUserContributions = [...goal.userContributions];
    const userContribIndex = newUserContributions.findIndex(
      c => currentUser && c.userId === currentUser.id
    );
    
    if (userContribIndex >= 0) {
      newUserContributions[userContribIndex].contribution += 1;
    } else if (currentUser) {
      newUserContributions.push({
        userId: currentUser.id,
        contribution: 1
      });
    }
    
    const updatedGoal = {
      ...goal,
      current: goal.current + 1,
      userContributions: newUserContributions
    };
    
    onUpdateGoal(updatedGoal);
    
    // Show confetti if we've hit the target exactly
    if (updatedGoal.current === updatedGoal.target) {
      showConfetti();
    }
  };
  
  const handleDecrement = () => {
    // Don't allow going below zero
    if (goal.current <= 0) return;
    
    const newUserContributions = [...goal.userContributions];
    const userContribIndex = newUserContributions.findIndex(
      c => currentUser && c.userId === currentUser.id
    );
    
    if (userContribIndex >= 0 && newUserContributions[userContribIndex].contribution > 0) {
      newUserContributions[userContribIndex].contribution -= 1;
    }
    
    onUpdateGoal({
      ...goal,
      current: goal.current - 1,
      userContributions: newUserContributions
    });
  };
  
  const handleSaveEdit = () => {
    const newTarget = parseInt(editTarget);
    
    if (isNaN(newTarget) || newTarget <= 0) {
      return;
    }
    
    onUpdateGoal({
      ...goal,
      title: editTitle,
      target: newTarget
    });
    
    setIsEditing(false);
  };

  return (
    <div className="border rounded-lg p-5 bg-card shadow-sm">
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Titel</label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Zielwert</label>
            <input
              type="number"
              value={editTarget}
              onChange={(e) => setEditTarget(e.target.value)}
              min="1"
              className="w-full border rounded p-2"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              <X className="w-4 h-4 mr-1" /> Abbrechen
            </Button>
            <Button 
              size="sm"
              onClick={handleSaveEdit}
            >
              <Check className="w-4 h-4 mr-1" /> Speichern
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <Target className="text-primary w-5 h-5" />
              <h3 className="font-medium text-lg">{goal.title}</h3>
            </div>
            
            {isEditable && (
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={() => onDeleteGoal(goal.id)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-3 mb-2">
            <span className="text-2xl font-bold">
              {goal.current} <span className="text-muted-foreground text-sm">/ {goal.target}</span>
            </span>
            <Badge variant={progressPercentage >= 100 ? "success" : "outline"}>
              {progressPercentage}%
            </Badge>
          </div>
          
          <Progress value={progressPercentage} className="h-2" />
          
          {currentUser && (
            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-2">
                Ihr Beitrag: <span className="font-medium text-foreground">{myContribution}</span>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={handleDecrement}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={handleIncrement}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
