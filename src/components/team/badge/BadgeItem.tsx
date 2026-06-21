
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

  const categoryName = badgeCategories.find(c => c.id === badge.category)?.name || 'Kategorie';

  return (
    <div className="relative group flex flex-col items-center text-center p-4 border border-border rounded-xl hover:bg-muted/40 hover:shadow-sm transition-all">
      <div className="text-3xl mb-2 leading-none">
        {isLucideIcon ? <Award className="h-8 w-8 text-primary mx-auto" /> : iconDisplay}
      </div>
      <h3 className="font-semibold text-sm leading-snug mb-0.5">{badge.name}</h3>
      <p className="text-xs text-muted-foreground">{categoryName}</p>

      {/* Hover actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-background transition-colors"
          onClick={() => onEdit(badge)}
          title="Bearbeiten"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-background transition-colors"
          onClick={() => onDelete(badge.id)}
          title="Löschen"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default BadgeItem;
