
import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CaseItem, CaseStatus, CaseActivity, ChecklistItemType, SubChecklistItem, User as UserType, CasePriority } from '../../types/case';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';
import { toast } from "../../hooks/use-toast";

// Import refactored components
import { CustomerHistoryPanel } from './CustomerHistoryPanel';
import { CaseCollaboratorsPanel } from './CaseCollaboratorsPanel';
import { CaseHeader } from './detail/CaseHeader';
import { CaseDescription } from './detail/CaseDescription';
import { ChecklistSection } from './detail/ChecklistSection';
import { CommentSection } from './detail/CommentSection';
import { CaseActions } from './detail/CaseActions';
import { generatePDF, checkAllCasesCompleted } from './detail/CaseHelpers';
import { insertNotification } from '../../hooks/useNotifications';
import { showConfetti } from './detail/ConfettiEffect';
import { CaseDocuments } from './detail/CaseDocuments';

interface CaseDetailProps {
  cases: CaseItem[];
  updateCase?: (id: string, caseData: Partial<CaseItem>) => void;
  isLoading?: boolean;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({ cases, updateCase, isLoading = false }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, currentUser, users, mentionUser } = useUser();

  const [caseItem, setCaseItem] = useState<CaseItem | undefined>(() => cases.find(c => c.id === id));
  const [directLoading, setDirectLoading] = useState(false);

  // Sync from cases prop when they arrive (covers the list-based path)
  useEffect(() => {
    const found = cases.find(c => c.id === id);
    if (found) setCaseItem(found);
  }, [cases, id]);

  // Fallback: if the cases list is done loading but we still don't have the case,
  // fetch it directly by ID from Supabase (covers direct URL access & fresh page loads)
  useEffect(() => {
    if (!id || caseItem) return;
    if (isLoading) return; // still waiting for list — don't double-fetch yet

    setDirectLoading(true);
    supabase
      .from('cases')
      .select('*, case_activities(*), checklist_items(*), case_collaborators(user_id)')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          // minimal mapping without full users list — names will show fallback until list loads
          const findUser = (uid: string) =>
            users.find(u => u.id === uid) ?? { id: uid, name: 'Lädt…', role: '' };
          setCaseItem({
            id: data.id,
            title: data.title,
            description: data.description ?? '',
            status: data.status,
            priority: data.priority ?? 'medium',
            type: data.type,
            customerName: data.customer_name ?? '',
            customerEmail: data.customer_email ?? '',
            customerPhone: data.customer_phone ?? '',
            assignee: findUser(data.assignee_id),
            creator: data.created_by ? findUser(data.created_by) : undefined,
            createdAt: data.created_at,
            lastUpdated: data.updated_at,
            dueDate: data.due_date,
            followUpDate: data.follow_up_date,
            waitingReason: data.waiting_reason,
            archived: data.archived ?? false,
            activities: (data.case_activities ?? []).map((a: any) => ({
              id: a.id, type: a.type, content: a.content,
              timestamp: a.created_at, user: findUser(a.user_id), caseId: data.id,
            })),
            checklist: (data.checklist_items ?? [])
              .sort((a: any, b: any) => a.sort_order - b.sort_order)
              .map((c: any) => ({ text: c.text, description: c.description, completed: c.completed, subItems: c.sub_items ?? [] })),
            documents: [],
            collaboratorIds: (data.case_collaborators ?? []).map((c: any) => c.user_id),
          });
        }
        setDirectLoading(false);
      });
  }, [id, isLoading, caseItem, users]);

  // Show skeleton while loading — never "not found" during a load
  if (!caseItem && (isLoading || directLoading)) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-7 bg-muted rounded w-64" />
        <div className="h-4 bg-muted rounded w-40" />
        <div className="h-4 bg-muted rounded w-full max-w-xl" />
      </div>
    );
  }

  if (!caseItem) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Vorgang nicht gefunden.</p>
        <Link to="/cases" className="text-primary hover:underline mt-4 inline-block">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const handleStatusChange = (newStatus: CaseStatus, waitingReason?: string) => {
    if (caseItem.status === newStatus) return;

    const LABELS: Record<string, string> = { new: 'Neu', in_progress: 'In Bearbeitung', waiting: 'Wartet auf Rückmeldung', completed: 'Erledigt' };
    const contentParts = [`Status geändert auf: ${LABELS[newStatus] ?? newStatus}`];
    if (waitingReason) contentParts.push(`Grund: ${waitingReason}`);

    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'status',
      content: contentParts.join(' · '),
      timestamp: new Date().toISOString(),
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' },
      caseId: caseItem.id,
    };

    const updatedCase = {
      ...caseItem,
      status: newStatus,
      waitingReason: newStatus === 'waiting' ? (waitingReason ?? caseItem.waitingReason) : undefined,
      lastUpdated: new Date().toISOString(),
      activities: [newActivity, ...caseItem.activities],
    };

    setCaseItem(updatedCase);

    if (updateCase) {
      updateCase(caseItem.id, {
        status: newStatus,
        waitingReason: updatedCase.waitingReason,
      });
    }

    if (newStatus === 'completed' && checkAllCasesCompleted()) showConfetti();
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
    
    insertNotification(
      userToAssign.id,
      'assignment',
      `Vorgang zugewiesen: ${caseItem.title}`,
      `${currentUser?.name} hat Ihnen diesen Vorgang zugewiesen.`,
      caseItem.id,
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

  const handleAddChecklistItem = async (text: string, description: string, addToTemplate: boolean) => {
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

    if (addToTemplate) {
      const { data: tmpl } = await supabase.from('checklist_templates').select('id,items').eq('type', caseItem.type).maybeSingle();
      if (tmpl) {
        await supabase.from('checklist_templates').update({ items: [...(tmpl.items ?? []), newItem] }).eq('id', tmpl.id);
        toast({ title: 'Vorlage aktualisiert', description: 'Eintrag zur Standardvorlage hinzugefügt.' });
      }
    }
  };

  const handleAddSubItem = async (parentIndex: number, subItemText: string, addToTemplate: boolean) => {
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

    if (addToTemplate) {
      const { data: tmpl } = await supabase.from('checklist_templates').select('id,items').eq('type', caseItem.type).maybeSingle();
      if (tmpl) {
        const items = [...(tmpl.items ?? [])];
        const parentText = updatedChecklist[parentIndex].text;
        const pi = items.findIndex((it: any) => it.text === parentText);
        if (pi !== -1) {
          if (!items[pi].subItems) items[pi].subItems = [];
          items[pi].subItems.push(newSubItem);
          await supabase.from('checklist_templates').update({ items }).eq('id', tmpl.id);
          toast({ title: 'Vorlage aktualisiert', description: 'Unterpunkt zur Standardvorlage hinzugefügt.' });
        }
      }
    }
  };

  const handleArchiveCase = () => {
    toast({ title: 'Vorgang archiviert', description: 'Der Vorgang wurde erfolgreich archiviert.' });
    navigate('/cases');
  };

  const handleDeleteCase = async () => {
    const { error } = await supabase.from('cases').delete().eq('id', caseItem.id);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Vorgang gelöscht', description: 'Der Vorgang wurde permanent gelöscht.' });
    navigate('/cases');
  };

  const handleAddComment = async (text: string, mentions: string[], activityType: string = 'comment') => {
    if (!text.trim() || !currentUser) return;

    const { data: inserted, error } = await supabase.from('case_activities').insert({
      case_id: caseItem.id,
      user_id: currentUser.id,
      type: activityType,
      content: text,
    }).select().single();

    if (error || !inserted) {
      toast({ title: 'Fehler beim Speichern', description: error?.message, variant: 'destructive' });
      return;
    }

    const newActivity: CaseActivity = {
      id: inserted.id,
      type: activityType as CaseActivity['type'],
      content: text,
      timestamp: inserted.created_at,
      user: currentUser,
      caseId: caseItem.id,
      mentions,
    };

    setCaseItem(prev => prev ? { ...prev, activities: [newActivity, ...prev.activities] } : prev);

    // Update cases.updated_at
    await supabase.from('cases').update({ updated_at: new Date().toISOString() }).eq('id', caseItem.id);

    mentions.forEach(userId => {
      if (userId !== currentUser?.id) {
        insertNotification(
          userId,
          'mention',
          `@Erwähnung in: ${caseItem.title}`,
          `${currentUser?.name}: ${text.slice(0, 100)}`,
          caseItem.id,
        );
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
            onTitleChange={newTitle => updateCase && updateCase(caseItem.id, { title: newTitle })}
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
        
        <div className="lg:col-span-1 space-y-4">
          {caseItem.customerName && (
            <CustomerHistoryPanel customerName={caseItem.customerName} currentCaseId={caseItem.id} />
          )}
          <CaseCollaboratorsPanel
            caseId={caseItem.id}
            collaboratorIds={caseItem.collaboratorIds ?? []}
            onUpdated={() => {
              // Reload case to refresh collaborators
              supabase.from('cases').select('*, case_activities(*), checklist_items(*), case_collaborators(user_id)')
                .eq('id', caseItem.id).single().then(({ data }) => {
                  if (data) setCaseItem(prev => prev ? {
                    ...prev,
                    collaboratorIds: (data.case_collaborators ?? []).map((c: any) => c.user_id),
                  } : prev);
                });
            }}
          />
          <CaseDocuments caseId={caseItem.id} />
          {caseItem.customerEmail && (
            <a
              href={`mailto:${caseItem.customerEmail}?subject=${encodeURIComponent(caseItem.title)}`}
              className="flex items-center justify-center gap-2 w-full px-3 py-2 border border-border rounded-xl text-sm hover:bg-muted transition-colors"
            >
              ✉ E-Mail an Kunde senden
            </a>
          )}
          <CaseActions
            onGeneratePDF={() => {
              const fileName = generatePDF(caseItem);
              toast({
                title: "PDF generiert",
                description: `Die Datei "${fileName}" wurde erfolgreich erstellt und heruntergeladen.`
              });
            }}
            onArchiveCase={handleArchiveCase}
            onDeleteCase={handleDeleteCase}
            isAdmin={isAdmin}
            caseItem={caseItem}
            currentUser={currentUser}
            onUpdate={(id, data) => {
              setCaseItem(prev => prev ? { ...prev, ...data } : prev);
              if (updateCase) updateCase(id, data);
            }}
          />
        </div>
      </div>
    </div>
  );
};
