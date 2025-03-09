
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CaseItem, CaseStatus, CaseActivity, ChecklistItemType, SubChecklistItem, User as UserType, CasePriority } from '../../types/case';
import { useUser } from '../../contexts/UserContext';
import { toast } from "../../hooks/use-toast";

// Import refactored components
import { CaseHeader } from './detail/CaseHeader';
import { CaseDescription } from './detail/CaseDescription';
import { ChecklistSection } from './detail/ChecklistSection';
import { CommentSection } from './detail/CommentSection';
import { CaseActions } from './detail/CaseActions';
import { generatePDF, sendNotification, checkAllCasesCompleted } from './detail/CaseHelpers';
import { showConfetti } from './detail/ConfettiEffect';

interface CaseDetailProps {
  cases: CaseItem[];
  updateCase?: (id: string, caseData: Partial<CaseItem>) => void;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({ cases, updateCase }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, currentUser, users, mentionUser } = useUser();
  const initialCase = cases.find(c => c.id === id);
  
  const [caseItem, setCaseItem] = useState<CaseItem | undefined>(initialCase);
  
  useEffect(() => {
    const updatedCase = cases.find(c => c.id === id);
    if (updatedCase) {
      setCaseItem(updatedCase);
    }
  }, [cases, id]);

  if (!caseItem) {
    return (
      <div className="p-8 text-center">
        <p>Vorgang nicht gefunden</p>
        <Link to="/cases" className="text-primary hover:underline mt-4 inline-block">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: CaseStatus) => {
    if (caseItem.status === newStatus) return;
    
    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'status',
      content: `Status geändert auf: ${newStatus === 'new' ? 'Neu' : 
                newStatus === 'in_progress' ? 'In Bearbeitung' : 
                newStatus === 'waiting' ? 'Wartet auf Rückmeldung' : 'Erledigt'}`,
      timestamp: new Date().toISOString(),
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' },
      caseId: caseItem.id
    };
    
    const updatedCase = {
      ...caseItem,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
      activities: [newActivity, ...caseItem.activities]
    };
    
    setCaseItem(updatedCase);
    
    if (updateCase) {
      // Use a direct update to ensure the state is saved
      updateCase(caseItem.id, {
        status: newStatus,
        lastUpdated: updatedCase.lastUpdated,
        activities: updatedCase.activities
      });
    }
    
    // Send notification to the case creator if it's not the current user
    if (caseItem.assignee.id !== currentUser?.id) {
      sendNotification(
        caseItem.assignee.id, 
        `Status geändert: ${caseItem.title}`,
        `${currentUser?.name} hat den Status auf "${newStatus === 'new' ? 'Neu' : 
          newStatus === 'in_progress' ? 'In Bearbeitung' : 
          newStatus === 'waiting' ? 'Wartet auf Rückmeldung' : 'Erledigt'}" geändert.`,
        caseItem.id
      );
    }
    
    // Check if all cases are now completed when this case is marked as completed
    if (newStatus === 'completed' && checkAllCasesCompleted()) {
      showConfetti();
    }
  };

  const handlePriorityChange = (newPriority: CasePriority) => {
    if (caseItem.priority === newPriority) return;
    
    const oldPriorityLabel = caseItem.priority ? 
      (caseItem.priority === 'low' ? 'Niedrig' : 
       caseItem.priority === 'medium' ? 'Mittel' : 
       caseItem.priority === 'high' ? 'Hoch' : 'Dringend') : 'Keine';
    
    const newPriorityLabel = newPriority === 'low' ? 'Niedrig' : 
                             newPriority === 'medium' ? 'Mittel' : 
                             newPriority === 'high' ? 'Hoch' : 'Dringend';
    
    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'other',
      content: `Priorität geändert von: ${oldPriorityLabel} auf: ${newPriorityLabel}`,
      timestamp: new Date().toISOString(),
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' },
      caseId: caseItem.id
    };
    
    const updatedCase = {
      ...caseItem,
      priority: newPriority,
      lastUpdated: new Date().toISOString(),
      activities: [newActivity, ...caseItem.activities]
    };
    
    setCaseItem(updatedCase);
    
    if (updateCase) {
      updateCase(caseItem.id, {
        priority: newPriority,
        lastUpdated: updatedCase.lastUpdated,
        activities: updatedCase.activities
      });
    }
    
    toast({
      title: "Priorität aktualisiert",
      description: `Die Priorität wurde auf "${newPriorityLabel}" geändert.`
    });
  };

  const handleAssignUser = (userId: string) => {
    const userToAssign = users.find(u => u.id === userId);
    if (!userToAssign || caseItem.assignee.id === userId) return;
    
    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'other',
      content: `Vorgang zugewiesen an: ${userToAssign.name}`,
      timestamp: new Date().toISOString(),
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' },
      caseId: caseItem.id
    };
    
    const updatedCase = {
      ...caseItem,
      assignee: userToAssign,
      lastUpdated: new Date().toISOString(),
      activities: [newActivity, ...caseItem.activities]
    };
    
    setCaseItem(updatedCase);
    
    if (updateCase) {
      updateCase(caseItem.id, {
        assignee: userToAssign,
        lastUpdated: updatedCase.lastUpdated,
        activities: updatedCase.activities
      });
    }
    
    // Send notification to the newly assigned user
    sendNotification(
      userToAssign.id, 
      `Neuer Vorgang zugewiesen: ${caseItem.title}`,
      `${currentUser?.name} hat Ihnen den Vorgang "${caseItem.title}" zugewiesen.`,
      caseItem.id
    );
    
    toast({
      title: "Vorgang zugewiesen",
      description: `Der Vorgang wurde ${userToAssign.name} zugewiesen.`
    });
  };

  const handleChecklistItemComplete = (index: number, completed: boolean) => {
    const updatedChecklist = [...caseItem.checklist];
    
    updatedChecklist[index] = {
      ...updatedChecklist[index],
      completed
    };
    
    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'checklist',
      content: `Checklist-Aufgabe "${updatedChecklist[index].text}" ${completed ? 'abgeschlossen' : 'wieder geöffnet'}`,
      timestamp: new Date().toISOString(),
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' },
      caseId: caseItem.id
    };
    
    const updatedCase = {
      ...caseItem,
      checklist: updatedChecklist,
      lastUpdated: new Date().toISOString(),
      activities: [newActivity, ...caseItem.activities]
    };
    
    setCaseItem(updatedCase);
    
    if (updateCase) {
      updateCase(caseItem.id, {
        checklist: updatedChecklist,
        lastUpdated: updatedCase.lastUpdated,
        activities: updatedCase.activities
      });
    }
    
    const allComplete = updatedChecklist.every(item => item.completed);
    if (allComplete && caseItem.status !== 'completed') {
      toast({
        title: "Alle Aufgaben erledigt",
        description: "Möchten Sie den Status auf 'Erledigt' ändern?",
        action: (
          <button 
            className="px-3 py-1 bg-green-500 text-white rounded-md text-xs"
            onClick={() => handleStatusChange('completed')}
          >
            Ja, erledigt
          </button>
        )
      });
    }
  };

  const handleAddChecklistItem = (text: string, description: string, addToTemplate: boolean) => {
    const newItem: ChecklistItemType = {
      text,
      description: description || undefined,
      completed: false,
      subItems: []
    };

    const updatedChecklist = [...caseItem.checklist, newItem];
    
    // Create activity for the new checklist item
    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'checklist',
      content: `Neuer Checklist-Eintrag hinzugefügt: "${text}"`,
      timestamp: new Date().toISOString(),
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' },
      caseId: caseItem.id
    };
    
    const updatedCase = {
      ...caseItem,
      checklist: updatedChecklist,
      lastUpdated: new Date().toISOString(),
      activities: [newActivity, ...caseItem.activities]
    };
    
    setCaseItem(updatedCase);
    
    if (updateCase) {
      updateCase(caseItem.id, {
        checklist: updatedChecklist,
        lastUpdated: updatedCase.lastUpdated,
        activities: updatedCase.activities
      });
    }

    // Add to template if requested
    if (addToTemplate) {
      const storedTemplates = localStorage.getItem('checklistTemplates');
      if (storedTemplates) {
        const templates = JSON.parse(storedTemplates);
        const templateToUpdate = templates.find((t: any) => t.type === caseItem.type);
        
        if (templateToUpdate) {
          templateToUpdate.items = [...templateToUpdate.items, newItem];
          localStorage.setItem('checklistTemplates', JSON.stringify(templates));
          
          toast({
            title: "Vorlage aktualisiert",
            description: "Der neue Eintrag wurde auch zur Standardvorlage hinzugefügt"
          });
        }
      }
    }
  };

  const handleAddSubItem = (parentIndex: number, subItemText: string, addToTemplate: boolean) => {
    const newSubItem: SubChecklistItem = {
      text: subItemText,
      completed: false
    };

    // Create updated checklist
    const updatedChecklist = [...caseItem.checklist];
    
    // Ensure subItems array exists
    if (!updatedChecklist[parentIndex].subItems) {
      updatedChecklist[parentIndex].subItems = [];
    }
    
    // Add the new sub-item
    updatedChecklist[parentIndex].subItems = [
      ...(updatedChecklist[parentIndex].subItems || []),
      newSubItem
    ];

    // Create activity for the new checklist sub-item
    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'checklist',
      content: `Neuer Unterpunkt hinzugefügt zu "${updatedChecklist[parentIndex].text}": "${subItemText}"`,
      timestamp: new Date().toISOString(),
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' },
      caseId: caseItem.id
    };
    
    const updatedCase = {
      ...caseItem,
      checklist: updatedChecklist,
      lastUpdated: new Date().toISOString(),
      activities: [newActivity, ...caseItem.activities]
    };
    
    setCaseItem(updatedCase);
    
    if (updateCase) {
      updateCase(caseItem.id, {
        checklist: updatedChecklist,
        lastUpdated: updatedCase.lastUpdated,
        activities: updatedCase.activities
      });
    }

    // Add to template if requested
    if (addToTemplate) {
      const storedTemplates = localStorage.getItem('checklistTemplates');
      if (storedTemplates) {
        const templates = JSON.parse(storedTemplates);
        const templateToUpdate = templates.find((t: any) => t.type === caseItem.type);
        
        if (templateToUpdate) {
          const templateParentItem = updatedChecklist[parentIndex];
          const templateParentIndex = templateToUpdate.items.findIndex((item: any) => item.text === templateParentItem.text);
          
          if (templateParentIndex !== -1) {
            if (!templateToUpdate.items[templateParentIndex].subItems) {
              templateToUpdate.items[templateParentIndex].subItems = [];
            }
            
            templateToUpdate.items[templateParentIndex].subItems.push(newSubItem);
            localStorage.setItem('checklistTemplates', JSON.stringify(templates));
            
            toast({
              title: "Vorlage aktualisiert",
              description: "Der neue Unterpunkt wurde auch zur Standardvorlage hinzugefügt"
            });
          }
        }
      }
    }
  };

  const handleArchiveCase = () => {
    toast({
      title: "Vorgang archiviert",
      description: "Der Vorgang wurde erfolgreich archiviert."
    });
    navigate('/cases');
  };

  const handleAddComment = (text: string, mentions: string[]) => {
    if (!text.trim()) return;
    
    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'comment',
      content: text,
      timestamp: new Date().toISOString(),
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' },
      caseId: caseItem.id,
      mentions
    };
    
    const updatedCase = {
      ...caseItem,
      lastUpdated: new Date().toISOString(),
      activities: [newActivity, ...caseItem.activities]
    };
    
    setCaseItem(updatedCase);
    
    if (updateCase) {
      updateCase(caseItem.id, {
        lastUpdated: updatedCase.lastUpdated,
        activities: updatedCase.activities
      });
    }
    
    // Notify mentioned users
    mentions.forEach(userId => {
      if (userId !== currentUser?.id) {
        const mentionedUser = users.find(u => u.id === userId);
        if (mentionedUser) {
          mentionUser(
            userId,
            caseItem.id,
            `${currentUser?.name} hat Sie in einem Kommentar erwähnt`,
            "case" // Fixed: Pass the correct type string literal
          );
        }
      }
    });
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CaseHeader 
            caseItem={caseItem}
            users={users}
            onStatusChange={handleStatusChange}
            onPriorityChange={handlePriorityChange}
            onAssignUser={handleAssignUser}
            isAdmin={isAdmin}
            currentUser={currentUser}
          />
          
          <CaseDescription description={caseItem.description} />
          
          <ChecklistSection 
            checklist={caseItem.checklist}
            currentUser={currentUser}
            caseId={caseItem.id}
            caseType={caseItem.type}
            onChecklistItemComplete={handleChecklistItemComplete}
            onAddChecklistItem={handleAddChecklistItem}
            onAddSubItem={handleAddSubItem}
          />
          
          <CommentSection 
            activities={caseItem.activities}
            currentUser={currentUser}
            caseId={caseItem.id}
            users={users}
            onAddComment={handleAddComment}
          />
        </div>
        
        <div className="lg:col-span-1">
          <CaseActions 
            onGeneratePDF={() => {
              const fileName = generatePDF(caseItem);
              toast({
                title: "PDF generiert",
                description: `Die Datei "${fileName}" wurde erfolgreich erstellt und heruntergeladen.`
              });
            }}
            onArchiveCase={handleArchiveCase}
          />
        </div>
      </div>
    </div>
  );
};
