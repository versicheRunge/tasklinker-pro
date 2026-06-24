
import React, { useState } from 'react';
import { FileText, ArchiveIcon, RefreshCw, Clock, Hourglass, Trash2 } from 'lucide-react';
import { CaseItem, User } from '../../../types/case';
import EmailTemplateSelector from '../EmailTemplateSelector';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../hooks/use-toast';
import { format } from 'date-fns';

const WAITING_REASONS = [
  { value: 'Wartet auf Dokumente vom Kunden', label: 'Dokumente vom Kunden' },
  { value: 'Wartet auf Rückruf des Kunden', label: 'Rückruf des Kunden' },
  { value: 'Wartet auf Antwort des Versicherers', label: 'Antwort des Versicherers' },
  { value: 'Wartet auf Gutachter', label: 'Gutachter' },
  { value: 'Wartet auf Handwerker-Angebot', label: 'Handwerker-Angebot' },
  { value: 'Wartet auf Freigabe intern', label: 'Freigabe intern' },
  { value: 'Wartet auf Unterschrift', label: 'Unterschrift' },
  { value: 'Sonstiges', label: 'Sonstiges' },
];

interface CaseActionsProps {
  onGeneratePDF: () => void;
  onArchiveCase: () => void;
  onDeleteCase?: () => void;
  isAdmin?: boolean;
  caseItem: CaseItem;
  currentUser: User | null;
  onUpdate?: (id: string, data: Partial<CaseItem>) => void;
}

export const CaseActions: React.FC<CaseActionsProps> = ({
  onGeneratePDF, onArchiveCase, onDeleteCase, isAdmin, caseItem, currentUser, onUpdate
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [followUpDate, setFollowUpDate] = useState(caseItem.followUpDate ? format(new Date(caseItem.followUpDate), 'yyyy-MM-dd') : '');
  const [dueDate, setDueDate] = useState(caseItem.dueDate ? format(new Date(caseItem.dueDate), 'yyyy-MM-dd') : '');
  const [waitingReason, setWaitingReason] = useState(caseItem.waitingReason ?? '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    const update: Partial<CaseItem> = {
      followUpDate: followUpDate || undefined,
      dueDate: dueDate || undefined,
      waitingReason: waitingReason || undefined,
    };
    const { error } = await supabase.from('cases').update({
      follow_up_date: followUpDate || null,
      due_date: dueDate || null,
      waiting_reason: waitingReason || null,
    }).eq('id', caseItem.id);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); }
    else {
      toast({ title: 'Gespeichert' });
      if (onUpdate) onUpdate(caseItem.id, update);
    }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      {/* Fristen & Wiedervorlage */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4 text-primary" /> Fristen & Wiedervorlage</h2>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Wiedervorlage am</label>
          <input
            type="date"
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            value={followUpDate}
            onChange={e => setFollowUpDate(e.target.value)}
          />
          {followUpDate && (
            <button onClick={() => setFollowUpDate('')} className="text-xs text-muted-foreground hover:text-destructive mt-1">Entfernen</button>
          )}
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Fällig bis</label>
          <input
            type="date"
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
          />
          {dueDate && (
            <button onClick={() => setDueDate('')} className="text-xs text-muted-foreground hover:text-destructive mt-1">Entfernen</button>
          )}
        </div>

        {caseItem.status === 'waiting' && (
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1 flex items-center gap-1"><Hourglass className="w-3 h-3" /> Wartet auf…</label>
            <select
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              value={waitingReason}
              onChange={e => setWaitingReason(e.target.value)}
            >
              <option value="">— Grund auswählen —</option>
              {WAITING_REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        )}

        <button
          onClick={save}
          disabled={saving}
          className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-60"
        >
          {saving ? 'Speichert…' : 'Speichern'}
        </button>
      </div>

      {/* Aktionen */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-3">
        <h2 className="font-semibold text-sm">Aktionen</h2>

        <button
          className="flex items-center gap-2 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
          onClick={onGeneratePDF}
        >
          <FileText className="w-4 h-4" /> PDF exportieren
        </button>

        <EmailTemplateSelector caseItem={caseItem} currentUser={currentUser} />

        <button
          className="flex items-center gap-2 w-full px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors text-sm"
          onClick={onArchiveCase}
        >
          <ArchiveIcon className="w-4 h-4" /> Vorgang archivieren
        </button>

        {isAdmin && onDeleteCase && (
          confirmDelete ? (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 space-y-2">
              <p className="text-xs text-red-800 font-medium">Vorgang wirklich permanent löschen? Dies kann nicht rückgängig gemacht werden.</p>
              <div className="flex gap-2">
                <button
                  onClick={onDeleteCase}
                  className="flex-1 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >Ja, löschen</button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors"
                >Abbrechen</button>
              </div>
            </div>
          ) : (
            <button
              className="flex items-center gap-2 w-full px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="w-4 h-4" /> Vorgang permanent löschen
            </button>
          )
        )}
      </div>
    </div>
  );
};
