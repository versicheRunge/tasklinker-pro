import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { CaseItem, CaseDefaultTitle, CasePriority } from '../types/case';
import { toast } from './use-toast';

const CASE_TYPES_DEFAULT: CaseDefaultTitle[] = [
  { id: '1',  title: 'Schadenmeldung KFZ',        type: 'kfz' },
  { id: '2',  title: 'Schadenmeldung Hausrat',     type: 'hr' },
  { id: '3',  title: 'Schadenmeldung Wohngebäude', type: 'wgb' },
  { id: '4',  title: 'Vertragsänderung',           type: 'sonstiges' },
  { id: '5',  title: 'EVB-Anfrage',                type: 'kfz' },
  { id: '6',  title: 'Allgemeine Anfrage',         type: 'sonstiges' },
  { id: '7',  title: 'BU-Antrag',                  type: 'bu' },
  { id: '8',  title: 'Altersvorsorge-Beratung',    type: 'altersvorsorge' },
  { id: '9',  title: 'PHV-Anfrage',                type: 'phv' },
  { id: '10', title: 'Sonstiges',                  type: 'sonstiges' },
];

const rowToCase = (row: any, users: any[]): CaseItem => {
  const findUser = (id: string) =>
    users.find(u => u.id === id) ?? { id, name: 'Unbekannt', role: '' };

  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    status: row.status,
    priority: row.priority ?? 'medium',
    type: row.type,
    customerName: row.customer_name ?? '',
    customerEmail: '',
    assignee: findUser(row.assignee_id),
    creator: row.created_by ? findUser(row.created_by) : undefined,
    createdAt: row.created_at,
    lastUpdated: row.updated_at,
    dueDate: row.due_date,
    followUpDate: row.follow_up_date,
    waitingReason: row.waiting_reason,
    archived: row.archived ?? false,
    activities: (row.case_activities ?? []).map((a: any) => ({
      id: a.id,
      type: a.type,
      content: a.content,
      timestamp: a.created_at,
      user: findUser(a.user_id),
      caseId: row.id,
    })),
    checklist: (row.checklist_items ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((c: any) => ({
        text: c.text,
        description: c.description,
        completed: c.completed,
        subItems: c.sub_items ?? [],
      })),
    documents: [],
    collaboratorIds: (row.case_collaborators ?? []).map((c: any) => c.user_id),
  };
};

export const useCasesManager = () => {
  const { profile } = useAuth();
  const { users } = useUser();
  const location = useLocation();
  const isArchived = location.pathname === '/cases/archived';

  const [cases, setCases] = useState<CaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isFilterPriorityOpen, setIsFilterPriorityOpen] = useState(false);
  const [isFilterUserOpen, setIsFilterUserOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<CasePriority | 'all'>('all');
  const [filterUserId, setFilterUserId] = useState<string | 'all'>('all');

  const loadCases = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('cases')
      .select('*, case_activities(*), checklist_items(*), case_collaborators(user_id)')
      .eq('archived', isArchived)
      .order('updated_at', { ascending: false });

    if (!error && data) setCases(data.map(row => rowToCase(row, users)));
    setIsLoading(false);
  }, [isArchived, users]);

  useEffect(() => {
    if (profile && users.length >= 0) loadCases();
  }, [profile, loadCases]);

  // Realtime subscription — reload on any case change
  useEffect(() => {
    if (!profile) return;
    const channel = supabase
      .channel('cases-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cases' }, () => {
        loadCases();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile, loadCases]);

  const handleCreateCase = async (caseData: any, assigneeId?: string): Promise<string> => {
    if (!profile) return '';

    const { data, error } = await supabase.from('cases').insert({
      title: caseData.title,
      description: caseData.description ?? '',
      status: 'new',
      priority: caseData.priority ?? 'medium',
      type: caseData.type ?? 'sonstiges',
      customer_name: caseData.customerName ?? '',
      assignee_id: assigneeId ?? caseData.assignee?.id ?? profile.id,
      created_by: profile.id,
      due_date: caseData.dueDate || null,
      follow_up_date: caseData.followUpDate || null,
      archived: false,
    }).select().single();

    if (error || !data) {
      toast({ title: 'Fehler beim Anlegen', description: error?.message ?? 'Unbekannter Fehler', variant: 'destructive' });
      return '';
    }

    await supabase.from('case_activities').insert({
      case_id: data.id,
      user_id: profile.id,
      type: 'status',
      content: 'Vorgang erstellt.',
    });

    // Save collaborators + notify them
    const collabIds: string[] = caseData.collaboratorIds ?? [];
    if (collabIds.length > 0) {
      await supabase.from('case_collaborators').insert(
        collabIds.map((uid: string) => ({ case_id: data.id, user_id: uid }))
      );
      for (const uid of collabIds) {
        await supabase.from('notifications').insert({
          user_id: uid,
          type: 'mention',
          title: `Sie wurden eingebunden`,
          body: `Vorgang: ${caseData.title}`,
          case_id: data.id,
        });
      }
    }

    await loadCases();
    return data.id as string;
  };

  const updateCase = async (id: string, caseData: Partial<CaseItem>) => {
    const update: Record<string, any> = { updated_at: new Date().toISOString() };
    if (caseData.title !== undefined)        update.title = caseData.title;
    if (caseData.description !== undefined)  update.description = caseData.description;
    if (caseData.status !== undefined)       update.status = caseData.status;
    if (caseData.priority !== undefined)     update.priority = caseData.priority;
    if (caseData.type !== undefined)         update.type = caseData.type;
    if (caseData.customerName !== undefined) update.customer_name = caseData.customerName;
    if (caseData.assignee !== undefined)     update.assignee_id = caseData.assignee.id;
    if (caseData.dueDate !== undefined)      update.due_date = caseData.dueDate;
    if (caseData.followUpDate !== undefined) update.follow_up_date = caseData.followUpDate;
    if (caseData.archived !== undefined)      update.archived = caseData.archived;
    if (caseData.waitingReason !== undefined) update.waiting_reason = caseData.waitingReason;

    const { error } = await supabase.from('cases').update(update).eq('id', id);
    if (error) {
      toast({ title: 'Fehler beim Speichern', description: error.message, variant: 'destructive' });
      return;
    }

    if (profile) {
      const labels: Record<string, string> = {
        new: 'Neu', in_progress: 'In Bearbeitung', waiting: 'Wartend',
        completed: 'Abgeschlossen', archived: 'Archiviert',
      };
      if (caseData.status) {
        await supabase.from('case_activities').insert({
          case_id: id, user_id: profile.id, type: 'status',
          content: `Status geändert zu: ${labels[caseData.status] ?? caseData.status}`,
        });
      }
      if (caseData.assignee) {
        await supabase.from('case_activities').insert({
          case_id: id, user_id: profile.id, type: 'assignment',
          content: `Vorgang zugewiesen an: ${caseData.assignee.name}`,
        });
      }
    }

    await loadCases();
  };

  const archiveCase = (id: string) => updateCase(id, { archived: true });
  const restoreCase = (id: string) => updateCase(id, { archived: false });

  const deleteCase = async (id: string) => {
    await supabase.from('cases').delete().eq('id', id);
    setCases(prev => prev.filter(c => c.id !== id));
  };

  const getCaseById = (id: string) => cases.find(c => c.id === id);

  const filteredCases = cases.filter(c => {
    if (filterPriority !== 'all' && c.priority !== filterPriority) return false;
    if (filterUserId !== 'all' && c.assignee?.id !== filterUserId) return false;
    return true;
  });

  return {
    cases: filteredCases,
    filteredCases,
    allCases: cases,
    isLoading,
    handleCreateCase,
    updateCase,
    deleteCase,
    getCaseById,
    archiveCase,
    restoreCase,
    isArchived,
    defaultTitles: CASE_TYPES_DEFAULT,
    isCreateDialogOpen, setIsCreateDialogOpen,
    isFilterPriorityOpen, setIsFilterPriorityOpen,
    isFilterUserOpen, setIsFilterUserOpen,
    filterPriority, setFilterPriority,
    filterUserId, setFilterUserId,
    reload: loadCases,
  };
};
