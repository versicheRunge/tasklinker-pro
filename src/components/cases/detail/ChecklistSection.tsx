
import React, { useState } from 'react';
import { ChecklistItemType, SubChecklistItem, User } from '../../../types/case';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Switch } from '../../ui/switch';
import { ChecklistItem } from '../../checklists/ChecklistItem';
import { CheckCheck, Plus, AlertCircle } from 'lucide-react';

interface ChecklistSectionProps {
  checklist: ChecklistItemType[];
  currentUser: User | null | undefined;
  caseId: string;
  caseType: string;
  onChecklistItemComplete: (index: number, completed: boolean) => void;
  onAddChecklistItem: (text: string, description: string, addToTemplate: boolean) => void;
  onAddSubItem: (parentIndex: number, subItemText: string, addToTemplate: boolean) => void;
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddSubItemDialogOpen, setIsAddSubItemDialogOpen] = useState(false);
  const [selectedParentIndex, setSelectedParentIndex] = useState<number | null>(null);
  const [itemText, setItemText] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [subItemText, setSubItemText] = useState('');
  const [addToTemplate, setAddToTemplate] = useState(false);
  
  const completedCount = checklist.filter(item => item.completed).length;
  const progress = checklist.length > 0 
    ? Math.round((completedCount / checklist.length) * 100) 
    : 0;
  
  const handleAddSubItem = () => {
    if (subItemText.trim() && selectedParentIndex !== null) {
      onAddSubItem(selectedParentIndex, subItemText, addToTemplate);
      setSubItemText('');
      setAddToTemplate(false);
      setIsAddSubItemDialogOpen(false);
      setSelectedParentIndex(null);
    }
  };
  
  const handleAddItem = () => {
    if (itemText.trim()) {
      onAddChecklistItem(itemText, itemDescription, addToTemplate);
      setItemText('');
      setItemDescription('');
      setAddToTemplate(false);
      setIsAddDialogOpen(false);
    }
  };
  
  const openAddSubItemDialog = (parentIndex: number) => {
    setSelectedParentIndex(parentIndex);
    setSubItemText('');
    setAddToTemplate(false);
    setIsAddSubItemDialogOpen(true);
  };
  
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden mt-6">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCheck className="w-5 h-5 text-primary" />
          <h3 className="font-medium">Checkliste</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {progress}% abgeschlossen
          </span>
          
          <div className="h-2 w-24 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Aufgabe
          </Button>
        </div>
      </div>
      
      <div className="p-2">
        {checklist.length === 0 ? (
          <div className="p-8 text-center">
            <AlertCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Keine Aufgaben vorhanden</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Erste Aufgabe hinzufügen
            </Button>
          </div>
        ) : (
          <div className="space-y-1">
            {checklist.map((item, index) => (
              <ChecklistItem 
                key={`${index}-${item.text}`}
                item={item}
                index={index}
                onToggleComplete={(completed) => onChecklistItemComplete(index, completed)}
                onAddSubItem={() => openAddSubItemDialog(index)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Dialog for adding a new checklist item */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aufgabe hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Aufgabe</Label>
              <Input 
                id="task-title" 
                value={itemText}
                onChange={(e) => setItemText(e.target.value)}
                placeholder="Aufgabentitel eingeben"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-description">Beschreibung (optional)</Label>
              <Textarea 
                id="task-description" 
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                placeholder="Beschreiben Sie die Aufgabe"
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="add-to-template" 
                checked={addToTemplate}
                onCheckedChange={setAddToTemplate}
              />
              <Label htmlFor="add-to-template">Zur Standardvorlage hinzufügen</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleAddItem} disabled={!itemText.trim()}>Hinzufügen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for adding a sub-item */}
      <Dialog open={isAddSubItemDialogOpen} onOpenChange={setIsAddSubItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unterpunkt hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subitem-title">Unterpunkt</Label>
              <Input 
                id="subitem-title" 
                value={subItemText}
                onChange={(e) => setSubItemText(e.target.value)}
                placeholder="Unterpunkt eingeben"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="add-to-template-subitem" 
                checked={addToTemplate}
                onCheckedChange={setAddToTemplate}
              />
              <Label htmlFor="add-to-template-subitem">Zur Standardvorlage hinzufügen</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddSubItemDialogOpen(false)}>Abbrechen</Button>
            <Button onClick={handleAddSubItem} disabled={!subItemText.trim()}>Hinzufügen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
