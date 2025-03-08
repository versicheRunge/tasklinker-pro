
import React, { useState } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { ChecklistItemType } from '../../types/case';

interface ChecklistItemProps {
  item: ChecklistItemType;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ item: initialItem }) => {
  const [item, setItem] = useState(initialItem);

  const toggleComplete = () => {
    setItem(prev => ({
      ...prev,
      completed: !prev.completed
    }));
  };

  return (
    <div 
      className={`flex items-start gap-3 p-2 rounded-lg transition-colors cursor-pointer hover:bg-muted/50 ${
        item.completed ? 'text-muted-foreground' : ''
      }`}
      onClick={toggleComplete}
    >
      <div className="mt-0.5">
        {item.completed ? (
          <CheckSquare className="w-5 h-5 text-primary" />
        ) : (
          <Square className="w-5 h-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${item.completed ? 'line-through' : ''}`}>
          {item.text}
        </p>
        {item.description && (
          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
        )}
      </div>
    </div>
  );
};
