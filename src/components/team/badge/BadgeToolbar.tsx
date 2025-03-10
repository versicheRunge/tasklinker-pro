
import React from 'react';
import { Plus, Search } from 'lucide-react';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';

interface BadgeToolbarProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  badgeCategories: { id: string; name: string }[];
  badgeCount: number;
  categoryCountMap: Record<string, number>;
  onCreateClick: () => void;
}

const BadgeToolbar: React.FC<BadgeToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  badgeCategories,
  badgeCount,
  categoryCountMap,
  onCreateClick
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-3 justify-between mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Auszeichnungen suchen..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <div className="flex gap-2">
        <select
          className="px-3 py-2 rounded-md border border-input bg-background text-sm"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Alle Kategorien ({badgeCount})</option>
          {badgeCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name} ({categoryCountMap[category.id] || 0})
            </option>
          ))}
        </select>
        
        <Button onClick={onCreateClick} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <span>Neue Auszeichnung</span>
        </Button>
      </div>
    </div>
  );
};

export default BadgeToolbar;
