
import React from 'react';
import { Pencil, Trash2, Award } from 'lucide-react';
import { UserBadge } from '../../../contexts/UserTypes';
import { CustomBadge } from '../../ui/CustomBadge';

interface BadgeItemProps {
  badge: UserBadge;
  badgeCategories: { id: string; name: string }[];
  onEdit: (badge: UserBadge) => void;
  onDelete: (id: string) => void;
}

const BadgeItem: React.FC<BadgeItemProps> = ({ badge, badgeCategories, onEdit, onDelete }) => {
  // Prüfe, ob das Icon ein Lucide-Icon ist oder ein Emoji
  const isLucideIcon = badge.icon && badge.icon.startsWith('lucide:');
  const iconDisplay = isLucideIcon 
    ? badge.icon.replace('lucide:', '') 
    : badge.icon;

  return (
    <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        {isLucideIcon ? (
          <Award className="h-6 w-6 text-primary" />
        ) : (
          <span className="text-2xl">{badge.icon}</span>
        )}
        
        <div>
          <h3 className="font-medium">{badge.name}</h3>
          <p className="text-xs text-muted-foreground">
            {badgeCategories.find(c => c.id === badge.category)?.name || 'Kategorie'}
          </p>
        </div>
      </div>
      
      <div className="flex gap-1">
        <button
          className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          onClick={() => onEdit(badge)}
          title="Bearbeiten"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-muted transition-colors"
          onClick={() => onDelete(badge.id)}
          title="Löschen"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BadgeItem;
