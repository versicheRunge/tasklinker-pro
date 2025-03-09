
import React, { useState, useEffect } from 'react';
import { CheckSquare, Square, Plus, Save } from 'lucide-react';
import { ChecklistItemType, SubChecklistItem } from '../../types/case';
import { toast } from "../../hooks/use-toast";

interface ChecklistItemProps {
  item: ChecklistItemType;
  index?: number; // Make index optional to maintain backward compatibility
  onComplete?: (completed: boolean) => void;
  onToggleComplete?: (completed: boolean) => void; // Add the new prop from ChecklistSection
  readOnly?: boolean;
  onAddSubItem?: (subItemText: string, addToTemplate: boolean) => void;
  allowEditing?: boolean;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({ 
  item: initialItem,
  index,
  onComplete,
  onToggleComplete,
  readOnly = false,
  onAddSubItem,
  allowEditing = false
}) => {
  const [item, setItem] = useState(initialItem);
  const [isAddingSubItem, setIsAddingSubItem] = useState(false);
  const [newSubItemText, setNewSubItemText] = useState('');
  const [addToTemplate, setAddToTemplate] = useState(false);

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
    
    // Notify parent component - support both callback methods
    if (onComplete) {
      onComplete(newCompleted);
    }
    
    if (onToggleComplete) {
      onToggleComplete(newCompleted);
    }
    
    // Auto-save notification
    toast({
      title: newCompleted ? "Aufgabe abgeschlossen" : "Aufgabe wieder geöffnet",
      description: "Der Status wurde automatisch gespeichert.",
    });
  };

  const handleAddSubItem = () => {
    if (!newSubItemText.trim()) return;
    
    if (onAddSubItem) {
      onAddSubItem(newSubItemText, addToTemplate);
    }
    
    setNewSubItemText('');
    setIsAddingSubItem(false);
    setAddToTemplate(false);
  };

  return (
    <div className="space-y-2">
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

      {/* Add new sub-item form */}
      {allowEditing && !readOnly && (
        <div>
          {isAddingSubItem ? (
            <div className="ml-8 space-y-2">
              <input
                type="text"
                className="w-full p-1.5 text-sm rounded-md border border-input"
                value={newSubItemText}
                onChange={(e) => setNewSubItemText(e.target.value)}
                placeholder="Neuen Unterpunkt hinzufügen"
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-xs">
                  <input 
                    type="checkbox" 
                    checked={addToTemplate} 
                    onChange={(e) => setAddToTemplate(e.target.checked)}
                    className="w-3 h-3"
                  />
                  Zur Standardvorlage hinzufügen
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setIsAddingSubItem(false);
                    setNewSubItemText('');
                    setAddToTemplate(false);
                  }}
                >
                  Abbrechen
                </button>
                <button 
                  className="px-2 py-1 text-xs text-white bg-primary rounded-md hover:bg-primary/90 flex items-center gap-1"
                  onClick={handleAddSubItem}
                >
                  <Save className="w-3 h-3" />
                  Speichern
                </button>
              </div>
            </div>
          ) : (
            <button 
              className="ml-8 text-xs text-primary hover:text-primary/80 flex items-center gap-1"
              onClick={() => setIsAddingSubItem(true)}
            >
              <Plus className="w-3 h-3" />
              Unterpunkt hinzufügen
            </button>
          )}
        </div>
      )}
    </div>
  );
};
