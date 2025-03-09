
import React, { useState, useEffect } from 'react';
import { CaseType, CaseDefaultTitle, ChecklistTemplate, CasePriority, CaseStatus } from '../../types/case';
import { toast } from "../../hooks/use-toast";
import { Button } from "../ui/button";
import { useUser } from '../../contexts/UserContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose
} from "../ui/dialog";

interface CreateCaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCase: (caseData: any, assigneeId: string) => void;
  defaultTitles: CaseDefaultTitle[];
}

export const CreateCaseDialog: React.FC<CreateCaseDialogProps> = ({
  isOpen,
  onOpenChange,
  onCreateCase,
  defaultTitles
}) => {
  const [newCaseData, setNewCaseData] = useState({
    title: '',
    description: '',
    type: 'damage' as CaseType,
    selectedTemplate: '',
    customerName: '',
    selectedDefaultTitle: '',
    dueDate: '',
    followUpDate: '',
    priority: 'medium' as CasePriority,
    status: 'new' as CaseStatus
  });
  
  const { currentUser, users } = useUser();
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');

  useEffect(() => {
    if (isOpen && currentUser) {
      setSelectedAssignee(currentUser.id);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (newCaseData.selectedDefaultTitle) {
      const selectedTitle = defaultTitles.find(t => t.id === newCaseData.selectedDefaultTitle);
      if (selectedTitle) {
        setNewCaseData(prev => ({
          ...prev,
          type: selectedTitle.type,
          title: selectedTitle.title + (prev.customerName ? ` - ${prev.customerName}` : '')
        }));
      }
    }
  }, [newCaseData.selectedDefaultTitle, newCaseData.customerName, defaultTitles]);

  useEffect(() => {
    if (newCaseData.selectedDefaultTitle && newCaseData.customerName) {
      const selectedTitle = defaultTitles.find(t => t.id === newCaseData.selectedDefaultTitle);
      if (selectedTitle) {
        setNewCaseData(prev => ({
          ...prev,
          title: `${selectedTitle.title} - ${prev.customerName}`
        }));
      }
    }
  }, [newCaseData.customerName, newCaseData.selectedDefaultTitle, defaultTitles]);
  
  const getTemplates = () => {
    const storedTemplates = localStorage.getItem('checklistTemplates');
    if (storedTemplates) {
      return JSON.parse(storedTemplates) as ChecklistTemplate[];
    }
    
    return [
      { id: 'template-1', title: 'Schadenmeldung', type: 'damage', items: [] },
      { id: 'template-2', title: 'eVB-Anfrage', type: 'evb', items: [] },
      { id: 'template-3', title: 'Vertragsänderung', type: 'contract_change', items: [] },
      { id: 'template-4', title: 'Kundenanfrage', type: 'inquiry', items: [] }
    ];
  };

  const templates = getTemplates();

  const handleCreateCase = () => {
    if (!currentUser) {
      toast({
        title: "Fehler",
        description: "Sie müssen angemeldet sein, um einen Vorgang zu erstellen.",
        variant: "destructive"
      });
      return;
    }
    
    if (!newCaseData.title.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel ein.",
        variant: "destructive"
      });
      return;
    }

    if (!selectedAssignee) {
      toast({
        title: "Fehler", 
        description: "Bitte wählen Sie einen Bearbeiter aus.",
        variant: "destructive"
      });
      return;
    }

    const assignee = users.find(user => user.id === selectedAssignee);
    if (!assignee) {
      toast({
        title: "Fehler",
        description: "Der ausgewählte Benutzer wurde nicht gefunden.",
        variant: "destructive"
      });
      return;
    }

    try {
      const caseData = {
        ...newCaseData,
        creator: currentUser,
        assignee,
        status: newCaseData.status || 'new',
      };

      onCreateCase(caseData, selectedAssignee);
      
      setNewCaseData({
        title: '',
        description: '',
        type: 'damage',
        selectedTemplate: '',
        customerName: '',
        selectedDefaultTitle: '',
        dueDate: '',
        followUpDate: '',
        priority: 'medium',
        status: 'new'
      });
      setSelectedAssignee('');
      onOpenChange(false);
    } catch (error) {
      console.error("Fehler beim Erstellen des Vorgangs:", error);
      toast({
        title: "Fehler",
        description: "Der Vorgang konnte nicht erstellt werden. Bitte versuchen Sie es erneut.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neuen Vorgang erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen Vorgang mit den folgenden Informationen.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="defaultTitle">
              Standardvorlage
            </label>
            <select
              id="defaultTitle"
              className="w-full p-2 rounded-md border border-input"
              value={newCaseData.selectedDefaultTitle}
              onChange={(e) => setNewCaseData({...newCaseData, selectedDefaultTitle: e.target.value})}
            >
              <option value="">Keine Vorlage auswählen</option>
              {defaultTitles.map(title => (
                <option key={title.id} value={title.id}>
                  {title.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="customerName">
              Kundenname
            </label>
            <input
              id="customerName"
              className="w-full p-2 rounded-md border border-input"
              value={newCaseData.customerName}
              onChange={(e) => setNewCaseData({...newCaseData, customerName: e.target.value})}
              placeholder="Name des Kunden"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="title">
              Titel
            </label>
            <input
              id="title"
              className="w-full p-2 rounded-md border border-input"
              value={newCaseData.title}
              onChange={(e) => setNewCaseData({...newCaseData, title: e.target.value})}
              placeholder="Titel des Vorgangs"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="description">
              Beschreibung
            </label>
            <textarea
              id="description"
              className="w-full p-2 rounded-md border border-input"
              rows={3}
              value={newCaseData.description}
              onChange={(e) => setNewCaseData({...newCaseData, description: e.target.value})}
              placeholder="Beschreibung des Vorgangs"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="dueDate">
                Zu erledigen bis
              </label>
              <input
                id="dueDate"
                type="date"
                className="w-full p-2 rounded-md border border-input"
                value={newCaseData.dueDate}
                onChange={(e) => setNewCaseData({...newCaseData, dueDate: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="followUpDate">
                Wiedervorlage am
              </label>
              <input
                id="followUpDate"
                type="date"
                className="w-full p-2 rounded-md border border-input"
                value={newCaseData.followUpDate}
                onChange={(e) => setNewCaseData({...newCaseData, followUpDate: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="priority">
              Priorität
            </label>
            <select
              id="priority"
              className="w-full p-2 rounded-md border border-input"
              value={newCaseData.priority}
              onChange={(e) => setNewCaseData({...newCaseData, priority: e.target.value as CasePriority})}
            >
              <option value="low">Niedrig</option>
              <option value="medium">Mittel</option>
              <option value="high">Hoch</option>
              <option value="urgent">Dringend</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              className="w-full p-2 rounded-md border border-input"
              value={newCaseData.status}
              onChange={(e) => setNewCaseData({...newCaseData, status: e.target.value as CaseStatus})}
            >
              <option value="new">Neu</option>
              <option value="in_progress">In Bearbeitung</option>
              <option value="waiting">Wartend</option>
              <option value="completed">Abgeschlossen</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 required" htmlFor="assignee">
              Zuweisen an
            </label>
            <select
              id="assignee"
              className="w-full p-2 rounded-md border border-input"
              value={selectedAssignee}
              onChange={(e) => setSelectedAssignee(e.target.value)}
              required
            >
              <option value="">Bitte wählen Sie einen Bearbeiter</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="type">
              Vorgangstyp
            </label>
            <select
              id="type"
              className="w-full p-2 rounded-md border border-input"
              value={newCaseData.type}
              onChange={(e) => setNewCaseData({...newCaseData, type: e.target.value as CaseType})}
            >
              <option value="damage">Schadenmeldung</option>
              <option value="evb">eVB-Anfrage</option>
              <option value="contract_change">Vertragsänderung</option>
              <option value="inquiry">Kundenanfrage</option>
              <option value="other">Sonstiges</option>
              {templates
                .filter(template => !['damage', 'evb', 'contract_change', 'inquiry', 'other'].includes(template.type))
                .map(template => (
                  <option key={template.id} value={template.type}>
                    {template.title}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="template">
              Checkliste hinzufügen
            </label>
            <select
              id="template"
              className="w-full p-2 rounded-md border border-input"
              value={newCaseData.selectedTemplate}
              onChange={(e) => setNewCaseData({...newCaseData, selectedTemplate: e.target.value})}
            >
              <option value="">Keine Checkliste</option>
              {templates
                .filter(template => template.type === newCaseData.type)
                .map(template => (
                  <option key={template.id} value={template.id}>
                    {template.title}
                  </option>
                ))}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleCreateCase}>
            Vorgang erstellen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
