
import React from 'react';
import { Input } from '../../ui/input';
import { CustomBadge } from '../../ui/CustomBadge';
import { UserBadge } from '../../../contexts/UserTypes';

interface BadgeFormProps {
  badge: UserBadge;
  onChange: (updatedBadge: UserBadge) => void;
  badgeCategories: { id: string; name: string }[];
}

const BadgeForm: React.FC<BadgeFormProps> = ({ badge, onChange, badgeCategories }) => {
  return (
    <div className="space-y-4 py-4">
      <div className="flex justify-center mb-4">
        <div className="text-6xl">{badge.icon}</div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="badge-icon">
          Emoji
        </label>
        <Input
          id="badge-icon"
          value={badge.icon}
          onChange={(e) => onChange({...badge, icon: e.target.value})}
          placeholder="🏆"
        />
        <p className="text-xs text-muted-foreground">
          Emoji einfügen oder kopieren (z.B. 🏆, 🎯, 🌟)
        </p>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="badge-name">
          Name
        </label>
        <Input
          id="badge-name"
          value={badge.name}
          onChange={(e) => onChange({...badge, name: e.target.value})}
          placeholder="Name der Auszeichnung"
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="badge-category">
          Kategorie
        </label>
        <select
          id="badge-category"
          className="w-full px-3 py-2 rounded-md border border-input bg-background"
          value={badge.category}
          onChange={(e) => onChange({...badge, category: e.target.value})}
        >
          {badgeCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-2">Vorschau:</h4>
        <div className="flex items-center gap-2 p-2 border border-border rounded-md">
          <CustomBadge 
            icon={badge.icon} 
            label={badge.name}
            variant={badge.category as any}
          />
        </div>
      </div>
    </div>
  );
};

export default BadgeForm;
