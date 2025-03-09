
import React, { useState } from 'react';
import { CheckSquare, Plus, X } from 'lucide-react';
import { ChecklistItemType, CaseActivity, User } from '../../../types/case';
import { Button } from '../../ui/button';
import { toast } from "../../../hooks/use-toast";
import { ChecklistItem } from '../../checklists/ChecklistItem';

interface ChecklistSectionProps {
  checklist: ChecklistItemType[];
  currentUser: User | null | undefined;
  caseId: string;
  caseType: string;
  onChecklistItemComplete: (index: number, completed: boolean) => void;
  onAddChecklistItem: (
    text: string, 
    description: string, 
    addToTemplate: boolean
  ) => void;
  onAddSubItem: (
    parentItemIndex: number, 
    subItemText: string, 
    addToTemplate: boolean
  ) => void;
}

export const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  checklist,
  currentUser,
  caseId,
  caseType,
  onChecklistItemComplete,
  onAddChecklistItem,
  onAddSubItem
}) => {
  const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false);
  const [newChecklistItemText, setNewChecklistItemText] = useState('');
  const [newChecklistItemDesc, setNewChecklistItemDesc] = useState('');
  const [addToTemplate, setAddToTemplate] = useState(false);

  const handleAddChecklistItem = () => {
    if (!newChecklistItemText.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Text für den neuen Eintrag ein",
        variant: "destructive"
      });
      return;
    }

    onAddChecklistItem(newChecklistItemText, newChecklistItemDesc, addToTemplate);
    setNewChecklistItemText('');
    setNewChecklistItemDesc('');
    setAddToTemplate(false);
    setIsAddingChecklistItem(false);
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Checkliste</h3>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 gap-1"
          onClick={() => setIsAddingChecklistItem(true)}
        >
          <Plus className="w-4 h-4" /> Hinzufügen
        </Button>
      </div>
      
      <div className="divide-y divide-border">
        {checklist.length === 0 ? (
          <div className="px-6 py-8 text-center text-muted-foreground">
            <p>Keine Checklisten-Einträge vorhanden</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => setIsAddingChecklistItem(true)}
            >
              <Plus className="w-4 h-4 mr-1" /> Eintrag hinzufügen
            </Button>
          </div>
        ) : (
          checklist.map((item, index) => (
            <ChecklistItem
              key={`${caseId}-checklist-${index}`}
              item={item}
              onComplete={(completed) => onChecklistItemComplete(index, completed)}
              onAddSubItem={(subItemText, addToTemplate) => 
                onAddSubItem(index, subItemText, addToTemplate)
              }
              allowEditing
            />
          ))
        )}
      </div>
      
      {isAddingChecklistItem && (
        <div className="p-4 bg-muted/30 border-t border-border">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium">Neuen Eintrag hinzufügen</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => setIsAddingChecklistItem(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Titel des Eintrags"
                className="w-full px-3 py-2 border border-border rounded-md text-sm"
                value={newChecklistItemText}
                onChange={(e) => setNewChecklistItemText(e.target.value)}
              />
            </div>
            
            <div>
              <textarea
                placeholder="Beschreibung (optional)"
                className="w-full px-3 py-2 border border-border rounded-md text-sm resize-none"
                rows={2}
                value={newChecklistItemDesc}
                onChange={(e) => setNewChecklistItemDesc(e.target.value)}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="add-to-template"
                checked={addToTemplate}
                onChange={(e) => setAddToTemplate(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="add-to-template" className="text-sm">
                Zur Standardvorlage für {caseType === 'damage' ? 'Schadensmeldungen' : 
                  caseType === 'evb' ? 'eVB-Anfragen' : 
                  caseType === 'contract_change' ? 'Vertragsänderungen' : 
                  caseType === 'inquiry' ? 'Kundenanfragen' : 'diesen Typ'} hinzufügen
              </label>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsAddingChecklistItem(false)}
              >
                Abbrechen
              </Button>
              <Button 
                size="sm"
                onClick={handleAddChecklistItem}
              >
                Hinzufügen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
