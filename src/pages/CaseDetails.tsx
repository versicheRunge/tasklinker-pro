
import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { CaseDetail } from '../components/cases/CaseDetail';
import { cases as initialCases } from '../data/mockData';
import { CaseItem, User } from '../types/case';
import { useUser } from '../contexts/UserContext';

const CaseDetails: React.FC = () => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const { currentUser, addNotification } = useUser();
  
  // Load cases from localStorage
  useEffect(() => {
    const storedCases = localStorage.getItem('cases');
    if (storedCases) {
      setCases(JSON.parse(storedCases));
    } else {
      // Initialize with creator field if not already present
      const casesWithCreator = initialCases.map(caseItem => ({
        ...caseItem,
        creator: caseItem.creator || caseItem.assignee
      }));
      setCases(casesWithCreator);
      localStorage.setItem('cases', JSON.stringify(casesWithCreator));
    }
  }, []);

  // Save cases to localStorage whenever they change
  useEffect(() => {
    if (cases.length > 0) {
      localStorage.setItem('cases', JSON.stringify(cases));
    }
  }, [cases]);

  const updateCase = (id: string, caseData: Partial<CaseItem>) => {
    // Get case before update to check if assignee has changed
    const originalCase = cases.find(c => c.id === id);
    const updatedCases = cases.map(caseItem => 
      caseItem.id === id ? { ...caseItem, ...caseData } : caseItem
    );
    
    setCases(updatedCases);
    
    // Handle notifications for case updates if we have a current user
    if (currentUser && originalCase) {
      // Notify the case creator if assignee changed and it's not the same person
      if (
        caseData.assignee && 
        originalCase.assignee.id !== caseData.assignee.id && 
        originalCase.creator && 
        originalCase.creator.id !== currentUser.id
      ) {
        // Only notify if the creator is not the current user and not the new assignee
        if (originalCase.creator.id !== caseData.assignee.id) {
          addNotification({
            title: "Vorgang neu zugewiesen",
            message: `${currentUser.name} hat den Vorgang "${originalCase.title}" an ${caseData.assignee.name} zugewiesen.`,
            caseId: id,
            targetUserId: originalCase.creator.id,
            type: 'case'
          });
        }
      }
      
      // Notify the creator if status has changed to completed
      if (
        caseData.status === 'completed' &&
        originalCase.status !== 'completed' && 
        originalCase.creator && 
        originalCase.creator.id !== currentUser.id
      ) {
        addNotification({
          title: "Vorgang abgeschlossen",
          message: `${currentUser.name} hat den Vorgang "${originalCase.title}" abgeschlossen.`,
          caseId: id,
          targetUserId: originalCase.creator.id,
          type: 'case'
        });
      }
      
      // Notify if priority has changed
      if (
        caseData.priority && 
        originalCase.priority !== caseData.priority && 
        originalCase.creator && 
        originalCase.creator.id !== currentUser.id
      ) {
        addNotification({
          title: "Priorität geändert",
          message: `${currentUser.name} hat die Priorität des Vorgangs "${originalCase.title}" geändert.`,
          caseId: id,
          targetUserId: originalCase.creator.id,
          type: 'case'
        });
      }
    }
  };

  return (
    <AppLayout>
      <CaseDetail cases={cases} updateCase={updateCase} />
    </AppLayout>
  );
};

export default CaseDetails;
