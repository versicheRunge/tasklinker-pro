import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { CasesList } from '../components/cases/CasesList';
import { cases as initialCasesData } from '../data/mockData';
import { PlusCircle, Filter } from 'lucide-react';
import { CaseItem, CaseType, ChecklistTemplate, CaseDefaultTitle, CasePriority } from '../types/case';
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
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";

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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<CasePriority | 'all'>('all');
  
  const [newCaseData, setNewCaseData] = useState({
    title: '',
    description: '',
    type: 'damage' as CaseType,
    selectedTemplate: '',
    customerName: '',
    selectedDefaultTitle: '',
    dueDate: '',
    followUpDate: '',
    priority: 'medium' as CasePriority
  });
  const { currentUser, isAdmin, users } = useUser();
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');

  // Initialize assignee when dialog opens with current user
  useEffect(() => {
    if (isCreateDialogOpen && currentUser) {
      setSelectedAssignee(currentUser.id);
    }
  }, [isCreateDialogOpen, currentUser]);

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

  // Erinnerungsfunktion für fällige Aufgaben
  useEffect(() => {
    const checkDueDates = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dueCases = cases.filter(caseItem => {
        if (!caseItem.dueDate || caseItem.status === 'completed' || caseItem.reminderSent) return false;
        
        const dueDate = new Date(caseItem.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        // Überprüfe, ob das Fälligkeitsdatum heute oder in der Vergangenheit liegt
        return dueDate <= today;
      });
      
      // Sende Erinnerungen für fällige Aufgaben
      dueCases.forEach(caseItem => {
        if (!currentUser) return;
        
        // Aktualisiere den reminderSent-Status
        setCases(prev => prev.map(c => 
          c.id === caseItem.id ? { ...c, reminderSent: true } : c
        ));
        
        // Sende eine Benachrichtigung an den zugewiesenen Benutzer
        if (caseItem.assignee && caseItem.assignee.id) {
          const { addNotification } = useUser();
          addNotification({
            title: "Fällige Aufgabe",
            message: `Der Vorgang "${caseItem.title}" ist fällig.`,
            caseId: caseItem.id,
            targetUserId: caseItem.assignee.id
          });
        }
        
        // Zeige eine Toast-Benachrichtigung für den aktuellen Benutzer an
        if (caseItem.assignee.id === currentUser.id) {
          toast({
            title: "Fällige Aufgabe",
            description: `Der Vorgang "${caseItem.title}" ist jetzt fällig.`,
            variant: "destructive"
          });
        }
      });
      
      // Überprüfe Wiedervorlagen
      const followUpCases = cases.filter(caseItem => {
        if (!caseItem.followUpDate || caseItem.status === 'completed' || caseItem.reminderSent) return false;
        
        const followUpDate = new Date(caseItem.followUpDate);
        followUpDate.setHours(0, 0, 0, 0);
        
        return followUpDate <= today;
      });
      
      followUpCases.forEach(caseItem => {
        if (!currentUser) return;
        
        // Aktualisiere den reminderSent-Status
        setCases(prev => prev.map(c => 
          c.id === caseItem.id ? { ...c, reminderSent: true } : c
        ));
        
        // Sende eine Benachrichtigung an den zugewiesenen Benutzer
        if (caseItem.assignee && caseItem.assignee.id) {
          const { addNotification } = useUser();
          addNotification({
            title: "Wiedervorlage",
            message: `Der Vorgang "${caseItem.title}" ist zur Wiedervorlage fällig.`,
            caseId: caseItem.id,
            targetUserId: caseItem.assignee.id
          });
        }
        
        // Zeige eine Toast-Benachrichtigung für den aktuellen Benutzer an
        if (caseItem.assignee.id === currentUser.id) {
          toast({
            title: "Wiedervorlage",
            description: `Der Vorgang "${caseItem.title}" sollte heute wiedervorgelegt werden.`,
            variant: "warning"
          });
        }
      });
    };
    
    // Führe die Überprüfung beim Laden der Seite durch
    checkDueDates();
    
    // Setze einen täglichen Timer für die Überprüfung (für längere Sitzungen)
    const interval = setInterval(checkDueDates, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [cases, currentUser]);

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

  const handleCreateCase = () => {
    if (!currentUser) return;
    
    if (!newCaseData.title.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel ein.",
        variant: "destructive"
      });
      return;
    }

    const assignee = users.find(user => user.id === selectedAssignee) || currentUser;

    const newCase: CaseItem = {
      id: `case-${Date.now()}`,
      title: newCaseData.title,
      description: newCaseData.description,
      status: 'new',
      type: newCaseData.type,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      customerName: newCaseData.customerName,
      assignee: assignee,
      creator: currentUser, // Store the creator
      dueDate: newCaseData.dueDate || undefined,
      followUpDate: newCaseData.followUpDate || undefined,
      priority: newCaseData.priority,
      reminderSent: false,
      activities: [
        {
          id: `act-${Date.now()}`,
          type: 'status',
          content: 'Neuer Vorgang erstellt',
          timestamp: new Date().toISOString(),
          user: currentUser,
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
      selectedDefaultTitle: '',
      dueDate: '',
      followUpDate: '',
      priority: 'medium'
    });
    setSelectedAssignee('');

    toast({
      title: "Vorgang erstellt",
      description: "Der neue Vorgang wurde erfolgreich angelegt."
    });

    // Notify the assignee if it's not the creator
    if (assignee.id !== currentUser.id) {
      const { addNotification } = useUser();
      addNotification({
        title: "Neuer Vorgang zugewiesen",
        message: `${currentUser.name} hat Ihnen den Vorgang "${newCaseData.title}" zugewiesen.`,
        caseId: newCase.id,
        targetUserId: assignee.id
      });
    }
  };

  // Filter cases by priority
  const filteredCases = filterPriority === 'all' 
    ? cases 
    : cases.filter(caseItem => caseItem.priority === filterPriority);

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vorgänge</h1>
          <p className="text-muted-foreground">Alle Vorgänge im Überblick.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Removed the Standardtitel button */}
          
          {/* Prioritäts-Filter */}
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <button 
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Priorität filtern</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium mb-2">Nach Priorität filtern</h4>
                <div className="flex flex-col gap-2">
                  <button 
                    className={`px-3 py-2 rounded-md ${filterPriority === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => setFilterPriority('all')}
                  >
                    Alle Prioritäten
                  </button>
                  <button 
                    className={`px-3 py-2 rounded-md ${filterPriority === 'low' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => setFilterPriority('low')}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      Niedrig
                    </div>
                  </button>
                  <button 
                    className={`px-3 py-2 rounded-md ${filterPriority === 'medium' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => setFilterPriority('medium')}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                      Mittel
                    </div>
                  </button>
                  <button 
                    className={`px-3 py-2 rounded-md ${filterPriority === 'high' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => setFilterPriority('high')}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                      Hoch
                    </div>
                  </button>
                  <button 
                    className={`px-3 py-2 rounded-md ${filterPriority === 'urgent' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    onClick={() => setFilterPriority('urgent')}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      Dringend
                    </div>
                  </button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Neuer Vorgang</span>
          </button>
        </div>
      </div>
      
      <CasesList cases={filteredCases} updateCase={updateCase} />

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
            
            {/* Neue Felder für Fälligkeitsdatum und Wiedervorlage */}
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
            
            {/* Prioritätsfeld */}
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
              <label className="block text-sm font-medium mb-1" htmlFor="assignee">
                Zuweisen an
              </label>
              <select
                id="assignee"
                className="w-full p-2 rounded-md border border-input"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
              >
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
    </AppLayout>
  );
};

export default Cases;
