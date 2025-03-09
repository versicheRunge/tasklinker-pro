
import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { CasesList } from '../components/cases/CasesList';
import { cases as initialCasesData } from '../data/mockData';
import { PlusCircle, Plus, Edit2, Save, X } from 'lucide-react';
import { CaseItem, CaseType, ChecklistTemplate, CaseDefaultTitle } from '../types/case';
import { toast } from "../hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogClose
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { useUser } from '../contexts/UserContext';

const Cases: React.FC = () => {
  // Use localStorage to persist cases between sessions
  const getStoredCases = () => {
    const storedCases = localStorage.getItem('cases');
    return storedCases ? JSON.parse(storedCases) : initialCasesData;
  };

  // Get default titles from localStorage or initialize
  const getDefaultTitles = (): CaseDefaultTitle[] => {
    const storedTitles = localStorage.getItem('defaultTitles');
    if (storedTitles) {
      return JSON.parse(storedTitles);
    }
    
    // Initial default titles
    return [
      { id: 'title-1', title: 'Schadenmeldung', type: 'damage' },
      { id: 'title-2', title: 'eVB-Anforderung', type: 'evb' },
      { id: 'title-3', title: 'Rückrufbitte', type: 'inquiry' },
      { id: 'title-4', title: 'Vertragsänderung', type: 'contract_change' }
    ];
  };

  const [cases, setCases] = useState<CaseItem[]>(getStoredCases());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [defaultTitles, setDefaultTitles] = useState<CaseDefaultTitle[]>(getDefaultTitles());
  const [isManageTitlesDialogOpen, setIsManageTitlesDialogOpen] = useState(false);
  const [newDefaultTitle, setNewDefaultTitle] = useState({ title: '', type: 'damage' as CaseType });
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');
  
  const [newCaseData, setNewCaseData] = useState({
    title: '',
    description: '',
    type: 'damage' as CaseType,
    selectedTemplate: '',
    customerName: '',
    selectedDefaultTitle: ''
  });
  const { currentUser, isAdmin } = useUser();

  // Save cases to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cases', JSON.stringify(cases));
  }, [cases]);

  // Save default titles to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('defaultTitles', JSON.stringify(defaultTitles));
  }, [defaultTitles]);

  // When a default title is selected, update the title and type
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

  // Update case title when customer name changes
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

  // Mock templates - in a real app, these would be fetched from the server
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

  const getTemplateItems = (templateId: string) => {
    // Find the template by ID
    const template = templates.find(t => t.id === templateId);
    if (!template) return [];
    
    // Return the template items
    return template.items;
  };

  const updateCase = (id: string, caseData: Partial<CaseItem>) => {
    setCases(prevCases => 
      prevCases.map(caseItem => 
        caseItem.id === id ? { ...caseItem, ...caseData } : caseItem
      )
    );
  };

  const handleAddDefaultTitle = () => {
    if (!newDefaultTitle.title.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel ein.",
        variant: "destructive"
      });
      return;
    }

    const newTitle: CaseDefaultTitle = {
      id: `title-${Date.now()}`,
      title: newDefaultTitle.title,
      type: newDefaultTitle.type
    };

    setDefaultTitles(prev => [...prev, newTitle]);
    setNewDefaultTitle({ title: '', type: 'damage' });

    toast({
      title: "Titel hinzugefügt",
      description: "Der neue Standardtitel wurde erfolgreich hinzugefügt."
    });
  };

  const handleEditDefaultTitle = (id: string) => {
    const title = defaultTitles.find(t => t.id === id);
    if (title) {
      setEditingTitleId(id);
      setEditingTitleText(title.title);
    }
  };

  const handleSaveEditedTitle = () => {
    if (!editingTitleId || !editingTitleText.trim()) return;

    setDefaultTitles(prev => 
      prev.map(title => 
        title.id === editingTitleId 
          ? { ...title, title: editingTitleText }
          : title
      )
    );

    setEditingTitleId(null);
    setEditingTitleText('');

    toast({
      title: "Titel aktualisiert",
      description: "Der Standardtitel wurde erfolgreich aktualisiert."
    });
  };

  const handleDeleteDefaultTitle = (id: string) => {
    setDefaultTitles(prev => prev.filter(title => title.id !== id));

    toast({
      title: "Titel gelöscht",
      description: "Der Standardtitel wurde erfolgreich gelöscht."
    });
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
      customerName: newCaseData.customerName,
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
      selectedTemplate: '',
      customerName: '',
      selectedDefaultTitle: ''
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
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button 
              className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
              onClick={() => setIsManageTitlesDialogOpen(true)}
            >
              <Edit2 className="w-4 h-4" />
              <span>Standardtitel</span>
            </button>
          )}
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Neuer Vorgang</span>
          </button>
        </div>
      </div>
      
      <CasesList cases={cases} updateCase={updateCase} />

      {/* Create Case Dialog */}
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
                {/* Custom types from templates */}
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

      {/* Manage Default Titles Dialog */}
      <Dialog open={isManageTitlesDialogOpen} onOpenChange={setIsManageTitlesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Standardtitel verwalten</DialogTitle>
            <DialogDescription>
              Fügen Sie neue Standardtitel hinzu oder bearbeiten Sie bestehende.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h3 className="text-sm font-medium mb-2">Bestehende Titel</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto mb-4">
              {defaultTitles.map(title => (
                <div key={title.id} className="flex items-center justify-between p-2 border rounded-md">
                  {editingTitleId === title.id ? (
                    <input
                      type="text"
                      className="flex-1 p-1 border rounded mr-2"
                      value={editingTitleText}
                      onChange={(e) => setEditingTitleText(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1">{title.title}</span>
                  )}
                  <div className="flex items-center gap-1">
                    <Badge variant="secondary" className="mr-2">
                      {title.type === 'damage' ? 'Schadenmeldung' : 
                      title.type === 'evb' ? 'eVB-Anfrage' : 
                      title.type === 'contract_change' ? 'Vertragsänderung' :
                      title.type === 'inquiry' ? 'Kundenanfrage' : title.type}
                    </Badge>
                    
                    {editingTitleId === title.id ? (
                      <>
                        <button 
                          onClick={handleSaveEditedTitle}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingTitleId(null);
                            setEditingTitleText('');
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEditDefaultTitle(title.id)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDefaultTitle(title.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-medium mb-2">Neuen Titel hinzufügen</h3>
            <div className="space-y-3">
              <div>
                <input
                  type="text"
                  className="w-full p-2 rounded-md border"
                  value={newDefaultTitle.title}
                  onChange={(e) => setNewDefaultTitle({...newDefaultTitle, title: e.target.value})}
                  placeholder="Titelbeschreibung"
                />
              </div>
              <div>
                <select
                  className="w-full p-2 rounded-md border"
                  value={newDefaultTitle.type}
                  onChange={(e) => setNewDefaultTitle({...newDefaultTitle, type: e.target.value as CaseType})}
                >
                  <option value="damage">Schadenmeldung</option>
                  <option value="evb">eVB-Anfrage</option>
                  <option value="contract_change">Vertragsänderung</option>
                  <option value="inquiry">Kundenanfrage</option>
                  <option value="other">Sonstiges</option>
                  {/* Custom case types can be added here */}
                </select>
              </div>
              <Button onClick={handleAddDefaultTitle} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Hinzufügen
              </Button>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Schließen</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Cases;
