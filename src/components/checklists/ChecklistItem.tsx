
import React, { useState, useEffect } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { ChecklistItemType } from '../../types/case';
import { toast } from "../../hooks/use-toast";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onComplete?: (completed: boolean) => void;
  readOnly?: boolean;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ 
  item: initialItem, 
  onComplete,
  readOnly = false
}) => {
  const [item, setItem] = useState(initialItem);

  // When the initial item changes (from parent), update our local state
  useEffect(() => {
    setItem(initialItem);
  }, [initialItem]);

  const toggleComplete = () => {
    if (readOnly) return;
    
    const newCompleted = !item.completed;
    setItem(prev => ({
      ...prev,
      completed: newCompleted
    }));
    
    // Notify parent component
    if (onComplete) {
      onComplete(newCompleted);
    }
    
    // Auto-save notification
    toast({
      title: newCompleted ? "Aufgabe abgeschlossen" : "Aufgabe wieder geöffnet",
      description: "Der Status wurde automatisch gespeichert.",
    });
  };

  return (
    <div 
      className={`flex items-start gap-3 p-2 rounded-lg transition-colors ${
        readOnly ? '' : 'cursor-pointer hover:bg-muted/50'
      } ${
        item.completed ? 'text-muted-foreground' : ''
      }`}
      onClick={readOnly ? undefined : toggleComplete}
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
        
        {/* Display sub-items if they exist */}
        {item.subItems && item.subItems.length > 0 && (
          <div className="ml-4 mt-2 space-y-1 border-l-2 border-muted pl-3">
            {item.subItems.map((subItem, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2 p-1 rounded transition-colors ${
                  subItem.completed ? 'text-muted-foreground' : ''
                }`}
              >
                <div className="mt-0.5">
                  {subItem.completed ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-medium ${subItem.completed ? 'line-through' : ''}`}>
                    {subItem.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
