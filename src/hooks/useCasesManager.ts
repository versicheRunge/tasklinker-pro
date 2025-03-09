
import { useState, useEffect } from 'react';
import { CaseItem, CasePriority, ChecklistTemplate, CaseType, User, CaseDefaultTitle } from '../types/case';
import { cases as initialCasesData } from '../data/mockData';
import { toast } from "../hooks/use-toast";
import { useUser } from '../contexts/UserContext';

export const useCasesManager = () => {
  const getStoredCases = () => {
    const storedCases = localStorage.getItem('cases');
    return storedCases ? JSON.parse(storedCases) : initialCasesData;
  };

  const getDefaultTitles = (): CaseDefaultTitle[] => {
    const storedTitles = localStorage.getItem('defaultTitles');
    if (storedTitles) {
      return JSON.parse(storedTitles);
    }
    
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
  const [isFilterPriorityOpen, setIsFilterPriorityOpen] = useState(false);
  const [isFilterUserOpen, setIsFilterUserOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<CasePriority | 'all'>('all');
  const [filterUserId, setFilterUserId] = useState<string | 'all'>('all');
  
  const { currentUser, users, addNotification } = useUser();

  useEffect(() => {
    localStorage.setItem('cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('defaultTitles', JSON.stringify(defaultTitles));
  }, [defaultTitles]);

  useEffect(() => {
    const checkDueDates = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const dueCases = cases.filter(caseItem => {
        if (!caseItem.dueDate || caseItem.status === 'completed' || caseItem.reminderSent) return false;
        
        const dueDate = new Date(caseItem.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        return dueDate <= today;
      });
      
      dueCases.forEach(caseItem => {
        if (!currentUser) return;
        
        setCases(prev => prev.map(c => 
          c.id === caseItem.id ? { ...c, reminderSent: true } : c
        ));
        
        if (caseItem.assignee && caseItem.assignee.id) {
          addNotification({
            title: "Fällige Aufgabe",
            message: `Der Vorgang "${caseItem.title}" ist fällig.`,
            caseId: caseItem.id,
            targetUserId: caseItem.assignee.id,
            type: 'case'
          });
        }
        
        if (caseItem.assignee.id === currentUser.id) {
          toast({
            title: "Fällige Aufgabe",
            description: `Der Vorgang "${caseItem.title}" ist jetzt fällig.`,
            variant: "destructive"
          });
        }
      });
      
      const followUpCases = cases.filter(caseItem => {
        if (!caseItem.followUpDate || caseItem.status === 'completed' || caseItem.reminderSent) return false;
        
        const followUpDate = new Date(caseItem.followUpDate);
        followUpDate.setHours(0, 0, 0, 0);
        
        return followUpDate <= today;
      });
      
      followUpCases.forEach(caseItem => {
        if (!currentUser) return;
        
        setCases(prev => prev.map(c => 
          c.id === caseItem.id ? { ...c, reminderSent: true } : c
        ));
        
        if (caseItem.assignee && caseItem.assignee.id) {
          addNotification({
            title: "Wiedervorlage",
            message: `Der Vorgang "${caseItem.title}" ist zur Wiedervorlage fällig.`,
            caseId: caseItem.id,
            targetUserId: caseItem.assignee.id,
            type: 'case'
          });
        }
        
        if (caseItem.assignee.id === currentUser.id) {
          toast({
            title: "Wiedervorlage",
            description: `Der Vorgang "${caseItem.title}" sollte heute wiedervorgelegt werden.`,
            variant: "warning"
          });
        }
      });
    };
    
    checkDueDates();
    
    const interval = setInterval(checkDueDates, 24 * 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [cases, currentUser, addNotification]);

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

  const getTemplateItems = (templateId: string) => {
    const templates = getTemplates();
    const template = templates.find(t => t.id === templateId);
    if (!template) return [];
    
    return template.items;
  };

  const updateCase = (id: string, caseData: Partial<CaseItem>) => {
    setCases(prevCases => 
      prevCases.map(caseItem => 
        caseItem.id === id ? { ...caseItem, ...caseData } : caseItem
      )
    );
  };

  const handleCreateCase = (newCaseData: any, selectedAssignee: string) => {
    if (!currentUser) return;
    
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
      creator: currentUser,
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

    toast({
      title: "Vorgang erstellt",
      description: "Der neue Vorgang wurde erfolgreich angelegt."
    });

    if (assignee.id !== currentUser.id) {
      addNotification({
        title: "Neuer Vorgang zugewiesen",
        message: `${currentUser.name} hat Ihnen den Vorgang "${newCaseData.title}" zugewiesen.`,
        caseId: newCase.id,
        targetUserId: assignee.id,
        type: 'case'
      });
    }
  };

  const filteredCases = cases
    .filter(caseItem => filterPriority === 'all' || caseItem.priority === filterPriority)
    .filter(caseItem => filterUserId === 'all' || (caseItem.assignee && caseItem.assignee.id === filterUserId));

  return {
    cases,
    filteredCases,
    defaultTitles,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isFilterPriorityOpen,
    setIsFilterPriorityOpen,
    isFilterUserOpen,
    setIsFilterUserOpen,
    filterPriority,
    setFilterPriority,
    filterUserId,
    setFilterUserId,
    updateCase,
    handleCreateCase
  };
};
