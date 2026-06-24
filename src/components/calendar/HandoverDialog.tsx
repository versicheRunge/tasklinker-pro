
import React, { useState, useEffect } from 'react';
import { UserCheck, RefreshCw, FileText, CheckSquare, Square } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CaseItem, User } from '../../types/case';
import { toast } from '../../hooks/use-toast';

interface HandoverDialogProps {
  currentUser: User;
  users: User[];
  vacationStart: string;
  vacationEnd: string;
  onClose: () => void;
}

export const HandoverDialog: React.FC<HandoverDialogProps> = ({ currentUser, users, vacationStart, vacationEnd, onClose }) => {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [targetUserId, setTargetUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [reassigning, setReassigning] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('cases')
        .select('id, title, status, priority, customer_name, due_date, follow_up_date')
        .eq('assignee_id', currentUser.id)
        .in('status', ['new', 'in_progress', 'waiting'])
        .eq('archived', false);
      if (data) {
        setCases(data.map((r: any) => ({
          id: r.id, title: r.title, status: r.status, priority: r.priority,
          customerName: r.customer_name, dueDate: r.due_date, followUpDate: r.follow_up_date,
          description: '', type: 'sonstiges', createdAt: '', lastUpdated: '',
          assignee: currentUser, activities: [], checklist: [],
        })));
        setSelected(data.map((r: any) => r.id));
      }
      setLoading(false);
    };
    load();
  }, [currentUser.id]);

  const toggle = (id: string) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const allSelected = selected.length === cases.length;

  const handleReassign = async () => {
    if (!targetUserId || selected.length === 0) return;
    setReassigning(true);
    const target = users.find(u => u.id === targetUserId);
    for (const caseId of selected) {
      await supabase.from('cases').update({ assignee_id: targetUserId, updated_at: new Date().toISOString() }).eq('id', caseId);
      await supabase.from('case_activities').insert({
        case_id: caseId, user_id: currentUser.id, type: 'assignment',
        content: `Übergabe an ${target?.name ?? 'unbekannt'} wegen Abwesenheit (${vacationStart} – ${vacationEnd}).`,
      });
    }
    toast({ title: 'Übergabe abgeschlossen', description: `${selected.length} Vorgänge wurden an ${target?.name} übergeben.` });
    setReassigning(false);
    onClose();
  };

  const handleGenerateSummary = () => {
    const target = users.find(u => u.id === targetUserId);
    const lines = [
      `Übergabe-Zusammenfassung – ${currentUser.name}`,
      `Abwesenheit: ${vacationStart} bis ${vacationEnd}`,
      target ? `Vertretung: ${target.name}` : '',
      '',
      'Offene Vorgänge:',
      ...cases.filter(c => selected.includes(c.id)).map(c =>
        `• [${c.status}] ${c.title}${c.customerName ? ` (${c.customerName})` : ''}${c.followUpDate ? ` | WV: ${new Date(c.followUpDate).toLocaleDateString('de-DE')}` : ''}`
      ),
    ];
    const blob = new Blob([lines.filter(Boolean).join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Übergabe_${currentUser.name.replace(/ /g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Zusammenfassung heruntergeladen' });
  };

  const colleagues = users.filter(u => u.id !== currentUser.id);
  const STATUS_LABELS: Record<string, string> = { new: 'Neu', in_progress: 'In Bearb.', waiting: 'Wartet', completed: 'Erledigt' };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <UserCheck className="w-5 h-5 text-primary" />
          <div>
            <h2 className="font-semibold">Übergabe organisieren</h2>
            <p className="text-xs text-muted-foreground">Sie haben eine Abwesenheit eingetragen. Möchten Sie Vorgänge übergeben?</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Colleague selector */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Vertretung (Vorgänge werden übergeben an)</label>
            <select
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary"
              value={targetUserId}
              onChange={e => setTargetUserId(e.target.value)}
            >
              <option value="">— Kollegen auswählen —</option>
              {colleagues.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          {/* Case list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-muted-foreground">
                Zu übergebende Vorgänge ({selected.length} / {cases.length})
              </label>
              <button
                onClick={() => setSelected(allSelected ? [] : cases.map(c => c.id))}
                className="text-xs text-primary hover:underline"
              >
                {allSelected ? 'Alle abwählen' : 'Alle auswählen'}
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Lade Vorgänge…</p>
            ) : cases.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Keine offenen Vorgänge gefunden.</p>
            ) : (
              <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                {cases.map(c => (
                  <button
                    key={c.id}
                    onClick={() => toggle(c.id)}
                    className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-colors ${selected.includes(c.id) ? 'bg-primary/10 border border-primary/30' : 'bg-muted/40 border border-transparent hover:bg-muted'}`}
                  >
                    {selected.includes(c.id) ? <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" /> : <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{c.title}</div>
                      {c.customerName && <div className="text-xs text-muted-foreground">{c.customerName}</div>}
                    </div>
                    <span className="text-xs bg-secondary px-1.5 py-0.5 rounded shrink-0">{STATUS_LABELS[c.status]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-4 border-t border-border">
          <button onClick={onClose} className="text-sm text-muted-foreground hover:text-foreground">Überspringen</button>
          <div className="flex gap-2">
            <button
              onClick={handleGenerateSummary}
              disabled={selected.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-40"
            >
              <FileText className="w-4 h-4" /> Zusammenfassung
            </button>
            <button
              onClick={handleReassign}
              disabled={!targetUserId || selected.length === 0 || reassigning}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${reassigning ? 'animate-spin' : ''}`} />
              {reassigning ? 'Übergabe läuft…' : `${selected.length} Vorgänge übergeben`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
