
import { useState, useEffect } from 'react';
import { CaseItem, CaseType, CaseStatus, CasePriority, CaseDefaultTitle } from '../types/case';
import { useUser } from '../contexts/UserContext';
import { useLocation } from 'react-router-dom';

export const useCasesManager = () => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFilterPriorityOpen, setIsFilterPriorityOpen] = useState(false);
  const [isFilterUserOpen, setIsFilterUserOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<CasePriority | 'all'>('all');
  const [filterUserId, setFilterUserId] = useState<string | 'all'>('all');
  const { currentUser } = useUser();
  const location = useLocation();
  
  // Check if we're on the archived cases route
  const isArchived = location.pathname === '/cases/archived';
  
  // Default titles for quick case creation
  const defaultTitles: CaseDefaultTitle[] = [
    { id: '1', title: 'Schadenmeldung', type: 'damage' },
    { id: '2', title: 'Vertragsänderung', type: 'contract_change' },
    { id: '3', title: 'Anfrage zu EVB', type: 'evb' },
    { id: '4', title: 'Allgemeine Anfrage', type: 'inquiry' },
    { id: '5', title: 'Sonstiges', type: 'other' }
  ];
  
  useEffect(() => {
    const loadCases = () => {
      setIsLoading(true);
      const storedCases = localStorage.getItem('cases');
      if (storedCases) {
        try {
          const parsedCases = JSON.parse(storedCases);
          setCases(parsedCases);
        } catch (e) {
          console.error('Error parsing stored cases:', e);
          setCases([]);
        }
      } else {
        setCases([]);
      }
      setIsLoading(false);
    };
    
    loadCases();
  }, []);
  
  // Filter cases based on archive status, priority and user assignment
  const filteredCases = cases.filter(c => {
    // First filter by archive status
    const archiveMatch = isArchived ? c.archived : !c.archived;
    if (!archiveMatch) return false;
    
    // Then filter by priority if one is selected
    if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
    
    // Then filter by assigned user if one is selected
    if (filterUserId !== 'all' && c.assignee.id !== filterUserId) return false;
    
    return true;
  });
  
  const addCase = (newCase: Omit<CaseItem, 'id' | 'createdAt' | 'lastUpdated' | 'activities' | 'checklist'>) => {
    const caseId = `case-${Date.now()}`;
    const now = new Date().toISOString();
    
    const caseToAdd: CaseItem = {
      id: caseId,
      ...newCase,
      createdAt: now,
      lastUpdated: now,
      activities: [
        {
          id: `activity-${Date.now()}`,
          type: 'status',
          content: `Vorgang erstellt und Status auf "${newCase.status === 'new' ? 'Neu' : 
            newCase.status === 'in_progress' ? 'In Bearbeitung' :
            newCase.status === 'waiting' ? 'Wartend' : 'Abgeschlossen'}" gesetzt.`,
          timestamp: now,
          user: currentUser!,
          caseId: caseId
        }
      ],
      checklist: [],
      archived: false
    };
    
    const updatedCases = [...cases, caseToAdd];
    setCases(updatedCases);
    localStorage.setItem('cases', JSON.stringify(updatedCases));
    
    return caseId;
  };
  
  const handleCreateCase = (caseData: Omit<CaseItem, 'id' | 'createdAt' | 'lastUpdated' | 'activities' | 'checklist'>) => {
    return addCase(caseData);
  };
  
  const updateCase = (id: string, caseData: Partial<CaseItem>) => {
    const updatedCases = cases.map(c => {
      if (c.id === id) {
        return {
          ...c,
          ...caseData,
          lastUpdated: new Date().toISOString()
        };
      }
      return c;
    });
    
    setCases(updatedCases);
    localStorage.setItem('cases', JSON.stringify(updatedCases));
  };
  
  const archiveCase = (id: string) => {
    const updatedCases = cases.map(c => {
      if (c.id === id) {
        return {
          ...c,
          archived: true,
          lastUpdated: new Date().toISOString()
        };
      }
      return c;
    });
    
    setCases(updatedCases);
    localStorage.setItem('cases', JSON.stringify(updatedCases));
  };
  
  const restoreCase = (id: string) => {
    const updatedCases = cases.map(c => {
      if (c.id === id) {
        return {
          ...c,
          archived: false,
          lastUpdated: new Date().toISOString()
        };
      }
      return c;
    });
    
    setCases(updatedCases);
    localStorage.setItem('cases', JSON.stringify(updatedCases));
  };
  
  const deleteCase = (id: string) => {
    const updatedCases = cases.filter(c => c.id !== id);
    setCases(updatedCases);
    localStorage.setItem('cases', JSON.stringify(updatedCases));
  };
  
  const getCaseById = (id: string) => {
    return cases.find(c => c.id === id);
  };
  
  return {
    cases: filteredCases,
    filteredCases,
    allCases: cases,
    isLoading,
    addCase,
    updateCase,
    deleteCase,
    getCaseById,
    archiveCase,
    restoreCase,
    isArchived,
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
    handleCreateCase
  };
};
