
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, Hourglass, CheckCircle2, Flag, CalendarCheck, User, ChevronRight } from 'lucide-react';
import { CaseItem, CaseStatus, CASE_TYPE_LABELS } from '../../types/case';
import { CustomAvatar } from '../ui/CustomAvatar';
import { supabase } from '../../lib/supabase';
import { toast } from '../../hooks/use-toast';
import { format, isToday, isPast } from 'date-fns';
import { de } from 'date-fns/locale';

const COLUMNS: { status: CaseStatus; label: string; icon: React.ReactNode; color: string; headerColor: string }[] = [
  { status: 'new',         label: 'Neu',               icon: <AlertCircle className="w-4 h-4" />,  color: 'border-blue-200',   headerColor: 'bg-blue-50 border-blue-200 text-blue-700' },
  { status: 'in_progress', label: 'In Bearbeitung',    icon: <Clock className="w-4 h-4" />,        color: 'border-amber-200',  headerColor: 'bg-amber-50 border-amber-200 text-amber-700' },
  { status: 'waiting',     label: 'Wartet',            icon: <Hourglass className="w-4 h-4" />,    color: 'border-purple-200', headerColor: 'bg-purple-50 border-purple-200 text-purple-700' },
  { status: 'completed',   label: 'Erledigt',          icon: <CheckCircle2 className="w-4 h-4" />, color: 'border-green-200',  headerColor: 'bg-green-50 border-green-200 text-green-700' },
];

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-500', high: 'bg-orange-500', medium: 'bg-blue-400', low: 'bg-gray-300',
};

interface Props {
  cases: CaseItem[];
  onUpdate: (id: string, data: Partial<CaseItem>) => void;
}

function KanbanCard({ c, onDragStart }: { c: CaseItem; onDragStart: (id: string) => void }) {
  const followUp = c.followUpDate ? new Date(c.followUpDate) : null;
  const due = c.dueDate ? new Date(c.dueDate) : null;
  const dueOverdue = due && isPast(due) && c.status !== 'completed';
  const followUpToday = followUp && isToday(followUp);
  const checkDone = c.checklist?.filter(i => i.completed).length ?? 0;
  const checkTotal = c.checklist?.length ?? 0;

  return (
    <Link
      to={`/cases/${c.id}`}
      draggable
      onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; onDragStart(c.id); }}
      onClick={e => e.stopPropagation()}
      className="block bg-card border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow select-none"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {c.priority && <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[c.priority] ?? PRIORITY_DOT.medium}`} title={c.priority} />}
          <span className="text-xs font-semibold truncate leading-snug">{c.title}</span>
        </div>
        <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
      </div>

      {/* Customer */}
      {c.customerName && (
        <div className="flex items-center gap-1 mb-1.5">
          <User className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground truncate">{c.customerName}</span>
        </div>
      )}

      {/* Type + Waiting reason */}
      <div className="flex flex-wrap gap-1 mb-2">
        <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{CASE_TYPE_LABELS[c.type] ?? c.type}</span>
        {c.status === 'waiting' && c.waitingReason && (
          <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded truncate max-w-[140px]">{c.waitingReason}</span>
        )}
      </div>

      {/* Dates */}
      {(followUp || due) && (
        <div className="flex flex-wrap gap-1 mb-2">
          {followUp && (
            <span className={`flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full ${followUpToday ? 'bg-green-100 text-green-700 font-semibold' : 'bg-muted text-muted-foreground'}`}>
              <CalendarCheck className="w-2.5 h-2.5" />
              {format(followUp, 'dd.MM.', { locale: de })}
            </span>
          )}
          {due && (
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${dueOverdue ? 'bg-red-100 text-red-700 font-semibold' : 'bg-muted text-muted-foreground'}`}>
              Fällig {format(due, 'dd.MM.', { locale: de })}
            </span>
          )}
        </div>
      )}

      {/* Checklist progress */}
      {checkTotal > 0 && (
        <div className="mb-2">
          <div className="flex justify-between mb-0.5">
            <span className="text-xs text-muted-foreground">Checkliste</span>
            <span className={`text-xs font-medium ${checkDone === checkTotal ? 'text-green-600' : 'text-muted-foreground'}`}>{checkDone}/{checkTotal}</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${checkDone === checkTotal ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${Math.round((checkDone / checkTotal) * 100)}%` }} />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
        <span className="text-xs text-muted-foreground">{new Date(c.lastUpdated).toLocaleDateString('de-DE')}</span>
        <CustomAvatar name={c.assignee.name} imageSrc={c.assignee.avatar} size="xs" />
      </div>
    </Link>
  );
}

export const KanbanBoard: React.FC<Props> = ({ cases, onUpdate }) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<CaseStatus | null>(null);
  const dragCounter = useRef<Record<string, number>>({});

  const activeCases = cases.filter(c => !c.archived);

  const handleDrop = async (status: CaseStatus) => {
    if (!dragId) return;
    const c = cases.find(c => c.id === dragId);
    if (!c || c.status === status) { setDragId(null); setOverCol(null); return; }

    onUpdate(dragId, { status });
    const { error } = await supabase.from('cases').update({ status, updated_at: new Date().toISOString() }).eq('id', dragId);
    if (error) toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    else {
      await supabase.from('case_activities').insert({
        case_id: dragId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        type: 'status',
        content: `Status geändert auf: ${COLUMNS.find(col => col.status === status)?.label ?? status}`,
      });
    }
    setDragId(null);
    setOverCol(null);
  };

  const onDragEnter = (status: CaseStatus) => {
    dragCounter.current[status] = (dragCounter.current[status] ?? 0) + 1;
    setOverCol(status);
  };
  const onDragLeave = (status: CaseStatus) => {
    dragCounter.current[status] = Math.max(0, (dragCounter.current[status] ?? 1) - 1);
    if (dragCounter.current[status] === 0) setOverCol(prev => prev === status ? null : prev);
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
      {COLUMNS.map(col => {
        const colCases = activeCases.filter(c => c.status === col.status);
        const isDragOver = overCol === col.status && dragId !== null;
        return (
          <div
            key={col.status}
            className="flex flex-col min-w-[260px] w-[260px] shrink-0"
            onDragOver={e => e.preventDefault()}
            onDragEnter={() => onDragEnter(col.status)}
            onDragLeave={() => onDragLeave(col.status)}
            onDrop={() => handleDrop(col.status)}
          >
            {/* Column header */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border mb-3 ${col.headerColor}`}>
              {col.icon}
              <span className="font-semibold text-sm">{col.label}</span>
              <span className="ml-auto text-xs font-bold opacity-70">{colCases.length}</span>
            </div>

            {/* Drop zone */}
            <div className={`flex-1 flex flex-col gap-2.5 rounded-xl p-2 min-h-[100px] transition-colors ${isDragOver ? 'bg-primary/5 border-2 border-dashed border-primary/40' : 'border-2 border-transparent'}`}>
              {colCases.map(c => (
                <KanbanCard key={c.id} c={c} onDragStart={setDragId} />
              ))}
              {colCases.length === 0 && !isDragOver && (
                <div className="flex items-center justify-center h-20 rounded-lg border border-dashed border-border text-xs text-muted-foreground">
                  Keine Vorgänge
                </div>
              )}
              {isDragOver && (
                <div className="flex items-center justify-center h-16 rounded-lg border-2 border-dashed border-primary/60 text-xs text-primary font-medium">
                  Hier ablegen
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
