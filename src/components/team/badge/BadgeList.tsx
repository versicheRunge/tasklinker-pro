
import React from 'react';
import { Trophy } from 'lucide-react';
import BadgeItem from './BadgeItem';
import { UserBadge } from '../../../contexts/UserTypes';

interface BadgeListProps {
  badges: UserBadge[];
  searchTerm: string;
  selectedCategory: string;
  badgeCategories: { id: string; name: string }[];
  onEdit: (badge: UserBadge) => void;
  onDelete: (id: string) => void;
}

const BadgeList: React.FC<BadgeListProps> = ({
  badges,
  searchTerm,
  selectedCategory,
  badgeCategories,
  onEdit,
  onDelete
}) => {
  const filteredBadges = badges.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           badge.icon.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (filteredBadges.length === 0) {
    return (
      <div className="col-span-full text-center p-8 border border-dashed border-border rounded-lg">
        <Trophy className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
        <h3 className="font-medium text-lg mb-1">Keine Auszeichnungen gefunden</h3>
        <p className="text-muted-foreground">
          {searchTerm || selectedCategory !== 'all' 
            ? "Keine Auszeichnungen entsprechen Ihren Filterkriterien." 
            : "Erstellen Sie neue Auszeichnungen mit dem Button 'Neue Auszeichnung'."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {filteredBadges.map(badge => (
        <BadgeItem
          key={badge.id}
          badge={badge}
          badgeCategories={badgeCategories}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default BadgeList;
