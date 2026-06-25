import React, { useState, useEffect, useRef } from 'react';
import { CaseType, CaseDefaultTitle, CasePriority, CASE_TYPE_LABELS } from '../../types/case';
import { toast } from '../../hooks/use-toast';
import { Button } from '../ui/button';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';
import { AlertTriangle, Users } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '../ui/dialog';

interface CreateCaseDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCase: (caseData: any, assigneeId: string) => void;
  defaultTitles: CaseDefaultTitle[];
}

const EMPTY_FORM = {
  title: '',
  description: '',
  type: 'sonstiges' as CaseType,
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  selectedDefaultTitle: '',
  dueDate: '',
  followUpDate: '',
  priority: 'medium' as CasePriority,
};

export const CreateCaseDialog: React.FC<CreateCaseDialogProps> = ({
  isOpen, onOpenChange, onCreateCase, defaultTitles,
}) => {
  const { currentUser, users } = useUser();
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [collaboratorIds, setCollaboratorIds] = useState<string[]>([]);
  const [duplicates, setDuplicates] = useState<{ id: string; title: string; status: string }[]>([]);
  const dupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen && currentUser) setSelectedAssignee(currentUser.id);
    if (!isOpen) { setDuplicates([]); setCollaboratorIds([]); }
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (dupTimer.current) clearTimeout(dupTimer.current);
    if (form.customerName.trim().length < 3) { setDuplicates([]); return; }
    dupTimer.current = setTimeout(async () => {
      const { data } = await supabase
        .from('cases')
        .select('id, title, status')
        .ilike('customer_name', form.customerName.trim())
        .in('status', ['new', 'in_progress', 'waiting'])
        .eq('archived', false)
        .limit(5);
      setDuplicates(data ?? []);
    }, 500);
    return () => { if (dupTimer.current) clearTimeout(dupTimer.current); };
  }, [form.customerName]);

  // Titel automatisch aus Vorlage + Kundenname zusammensetzen
  useEffect(() => {
    if (!form.selectedDefaultTitle) return;
    const t = defaultTitles.find(t => t.id === form.selectedDefaultTitle);
    if (!t) return;
    setForm(prev => ({
      ...prev,
      type: t.type,
      title: form.customerName ? `${t.title} - ${form.customerName}` : t.title,
    }));
  }, [form.selectedDefaultTitle, form.customerName]);

  const set = (key: keyof typeof EMPTY_FORM, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleCollaborator = (userId: string) => {
    setCollaboratorIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleCreate = () => {
    if (!form.title.trim()) {
      toast({ title: 'Fehler', description: 'Bitte Titel eingeben.', variant: 'destructive' });
      return;
    }
    onCreateCase({ ...form, collaboratorIds }, selectedAssignee);
    setForm(EMPTY_FORM);
    setSelectedAssignee('');
    setCollaboratorIds([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neuen Vorgang erstellen</DialogTitle>
          <DialogDescription>Füllen Sie die folgenden Felder aus.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Schnellvorlage */}
          <div>
            <label className="block text-sm font-medium mb-1">Schnellvorlage</label>
            <select
              className="w-full p-2 rounded-md border border-input bg-background"
              value={form.selectedDefaultTitle}
              onChange={e => set('selectedDefaultTitle', e.target.value)}
            >
              <option value="">— keine Vorlage —</option>
              {defaultTitles.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          {/* Kundendaten */}
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Kundenname</label>
              <input
                className="w-full p-2 rounded-md border border-input bg-background"
                value={form.customerName}
                onChange={e => set('customerName', e.target.value)}
                placeholder="Name des Kunden"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Kunden-E-Mail</label>
                <input
                  type="email"
                  className="w-full p-2 rounded-md border border-input bg-background"
                  value={form.customerEmail}
                  onChange={e => set('customerEmail', e.target.value)}
                  placeholder="kunde@beispiel.de"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Kunden-Telefon</label>
                <input
                  type="tel"
                  className="w-full p-2 rounded-md border border-input bg-background"
                  value={form.customerPhone}
                  onChange={e => set('customerPhone', e.target.value)}
                  placeholder="+49 123 456789"
                />
              </div>
            </div>
          </div>
          {duplicates.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-2 text-amber-800 font-medium text-xs mb-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                {duplicates.length === 1
                  ? 'Für diesen Kunden gibt es bereits einen offenen Vorgang:'
                  : `Für diesen Kunden gibt es bereits ${duplicates.length} offene Vorgänge:`}
              </div>
              <ul className="space-y-0.5">
                {duplicates.map(d => (
                  <li key={d.id} className="text-xs text-amber-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                    {d.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Titel */}
          <div>
            <label className="block text-sm font-medium mb-1">Titel *</label>
            <input
              className="w-full p-2 rounded-md border border-input bg-background"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Titel des Vorgangs"
            />
          </div>

          {/* Beschreibung */}
          <div>
            <label className="block text-sm font-medium mb-1">Beschreibung</label>
            <textarea
              className="w-full p-2 rounded-md border border-input bg-background"
              rows={3}
              value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Optionale Beschreibung"
            />
          </div>

          {/* Sparte */}
          <div>
            <label className="block text-sm font-medium mb-1">Sparte</label>
            <select
              className="w-full p-2 rounded-md border border-input bg-background"
              value={form.type}
              onChange={e => set('type', e.target.value)}
            >
              {(Object.entries(CASE_TYPE_LABELS) as [CaseType, string][]).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>

          {/* Priorität + Zuweisung */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Priorität</label>
              <select
                className="w-full p-2 rounded-md border border-input bg-background"
                value={form.priority}
                onChange={e => set('priority', e.target.value)}
              >
                <option value="low">Niedrig</option>
                <option value="medium">Mittel</option>
                <option value="high">Hoch</option>
                <option value="urgent">Dringend</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Zuweisen an</label>
              <select
                className="w-full p-2 rounded-md border border-input bg-background"
                value={selectedAssignee}
                onChange={e => setSelectedAssignee(e.target.value)}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Datum */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Fällig bis</label>
              <input
                type="date"
                className="w-full p-2 rounded-md border border-input bg-background"
                value={form.dueDate}
                onChange={e => set('dueDate', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Wiedervorlage</label>
              <input
                type="date"
                className="w-full p-2 rounded-md border border-input bg-background"
                value={form.followUpDate}
                onChange={e => set('followUpDate', e.target.value)}
              />
            </div>
          </div>

          {/* Kollegen einbinden */}
          {users.filter(u => u.id !== selectedAssignee).length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-1 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Kollegen einbinden (@mention)
              </label>
              <div className="flex flex-wrap gap-2">
                {users.filter(u => u.id !== selectedAssignee).map(u => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => toggleCollaborator(u.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      collaboratorIds.includes(u.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-input hover:bg-muted'
                    }`}
                  >
                    @{u.name}
                  </button>
                ))}
              </div>
              {collaboratorIds.length > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {collaboratorIds.length} Kollege{collaboratorIds.length > 1 ? 'n' : ''} werden benachrichtigt.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleCreate}>Vorgang erstellen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
