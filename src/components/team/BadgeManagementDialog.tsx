
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../components/ui/dialog";
import { User } from '../../types/case';
import { UserBadge } from '../../contexts/UserTypes';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const filteredBadges = availableBadges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           badge.icon.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
  return (
    <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Auszeichnungen verwalten</DialogTitle>
        <DialogDescription>
          {user?.name ? `Auszeichnungen für ${user.name}` : ''}
        </DialogDescription>
      </DialogHeader>
      
      <div className="pt-4 pb-2">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Auszeichnungen suchen..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Alle Kategorien</option>
            {badgeCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="py-4">
        {badgeCategories
          .filter(category => selectedCategory === 'all' || category.id === selectedCategory)
          .map(category => {
            const categoryBadges = filteredBadges.filter(badge => badge.category === category.id);
            
            if (categoryBadges.length === 0) return null;
            
            return (
              <div key={category.id} className="mb-6">
                <h3 className="text-lg font-medium mb-3">{category.name}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categoryBadges.map(badge => {
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
                        <span className="text-sm truncate">{badge.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
        {filteredBadges.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Keine Auszeichnungen gefunden.
          </div>
        )}
      </div>
      
      <DialogFooter>
        <button
          className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors"
          onClick={onCancel}
        >
          Abbrechen
        </button>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          onClick={onSave}
        >
          Auszeichnungen speichern
        </button>
      </DialogFooter>
    </DialogContent>
  );
};
