
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { User } from '../../types/case';
import { UserBadge } from '../../contexts/UserTypes';
import { Button } from '../ui/button';

interface BadgeManagementDialogProps {
  user: User | null;
  badgeCategories: { id: string; name: string }[];
  availableBadges: UserBadge[];
  onToggleBadge: (badgeId: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export const BadgeManagementDialog: React.FC<BadgeManagementDialogProps> = ({
  user,
  badgeCategories,
  availableBadges,
  onToggleBadge,
  onCancel,
  onSave
}) => {
  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Auszeichnungen verwalten</DialogTitle>
        <DialogDescription>
          {user?.name ? `Auszeichnungen für ${user.name}` : ''}
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        {badgeCategories.map(category => (
          <div key={category.id} className="mb-6">
            <h3 className="text-lg font-medium mb-3">{category.name}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {availableBadges
                .filter(badge => badge.category === category.id)
                .map(badge => {
                  const isActive = user?.badges?.some(b => b.id === badge.id);
                  return (
                    <button
                      key={badge.id}
                      className={`flex items-center gap-2 p-2 rounded-md border ${
                        isActive 
                          ? 'border-primary bg-primary/10 text-primary' 
                          : 'border-border hover:bg-muted'
                      }`}
                      onClick={() => onToggleBadge(badge.id)}
                    >
                      <span className="text-xl">{badge.icon}</span>
                      <span className="text-sm">{badge.name}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button onClick={onSave}>
          Auszeichnungen speichern
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};
