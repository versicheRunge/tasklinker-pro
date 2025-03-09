
import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { CasesList } from '../components/cases/CasesList';
import { cases as initialCasesData } from '../data/mockData';
import { PlusCircle } from 'lucide-react';
import { CaseItem, CaseType, ChecklistTemplate } from '../types/case';
import { toast } from "../hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { useUser } from '../contexts/UserContext';

const Cases: React.FC = () => {
  const [cases, setCases] = useState<CaseItem[]>(initialCasesData);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCaseData, setNewCaseData] = useState({
    title: '',
    description: '',
    type: 'damage' as CaseType,
    selectedTemplate: ''
  });
  const { currentUser } = useUser();

  // Mock templates - in a real app, these would be fetched from the server
  const templates = [
    { id: 'template-1', title: 'Schadenmeldung', type: 'damage' },
    { id: 'template-2', title: 'eVB-Anfrage', type: 'evb' },
    { id: 'template-3', title: 'Vertragsänderung', type: 'contract_change' },
    { id: 'template-4', title: 'Kundenanfrage', type: 'inquiry' }
  ];

  const getTemplateItems = (templateId: string) => {
    // In a real app, you would fetch the template from the server
    const found = cases.find(c => c.type === templates.find(t => t.id === templateId)?.type);
    return found?.checklist || [];
  };

  const updateCase = (id: string, caseData: Partial<CaseItem>) => {
    setCases(prevCases => 
      prevCases.map(caseItem => 
        caseItem.id === id ? { ...caseItem, ...caseData } : caseItem
      )
    );
  };

  const handleCreateCase = () => {
    if (!newCaseData.title.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel ein.",
        variant: "destructive"
      });
      return;
    }

    const newCase: CaseItem = {
      id: `case-${Date.now()}`,
      title: newCaseData.title,
      description: newCaseData.description,
      status: 'new',
      type: newCaseData.type,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      assignee: currentUser || {
        id: '1',
        name: 'Max Schmidt',
        role: 'Teamleiter',
        userRole: 'admin'
      },
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'status',
          content: 'Neuer Vorgang erstellt',
          timestamp: new Date().toISOString(),
          user: currentUser || {
            id: '1',
            name: 'Max Schmidt',
            role: 'Teamleiter',
            userRole: 'admin'
          },
          caseId: `case-${Date.now()}`
        }
      ],
      checklist: newCaseData.selectedTemplate ? 
        getTemplateItems(newCaseData.selectedTemplate) : []
    };

    setCases(prevCases => [newCase, ...prevCases]);
    setIsCreateDialogOpen(false);
    setNewCaseData({
      title: '',
      description: '',
      type: 'damage',
      selectedTemplate: ''
    });

    toast({
      title: "Vorgang erstellt",
      description: "Der neue Vorgang wurde erfolgreich angelegt."
    });
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vorgänge</h1>
          <p className="text-muted-foreground">Alle Vorgänge im Überblick.</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Neuer Vorgang</span>
        </button>
      </div>
      
      <CasesList cases={cases} updateCase={updateCase} />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Neuen Vorgang erstellen</DialogTitle>
            <DialogDescription>
              Erstellen Sie einen neuen Vorgang mit den folgenden Informationen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                {/* Add custom types that might be available from templates */}
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
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreateCase}>
              Vorgang erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Cases;
