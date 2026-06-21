
import React, { useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, Hourglass, Flag, User, CalendarCheck, CalendarClock, ChevronDown } from 'lucide-react';
import { Badge } from '../ui/badge';
import { CustomAvatar } from '../ui/CustomAvatar';
import { Link } from 'react-router-dom';
import { CaseItem, CASE_TYPE_LABELS } from '../../types/case';
import { supabase } from '../../lib/supabase';
import { toast } from '../../hooks/use-toast';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { de } from 'date-fns/locale';

const statusConfig = {
  new:         { icon: <AlertCircle className="w-3.5 h-3.5" />,  label: 'Neu',               color: 'bg-blue-100 text-blue-700 border-blue-200' },
  in_progress: { icon: <Clock className="w-3.5 h-3.5" />,        label: 'In Bearbeitung',    color: 'bg-amber-100 text-amber-700 border-amber-200' },
  waiting:     { icon: <Hourglass className="w-3.5 h-3.5" />,    label: 'Wartet',            color: 'bg-purple-100 text-purple-700 border-purple-200' },
  completed:   { icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Erledigt',          color: 'bg-green-100 text-green-700 border-green-200' },
};

const priorityConfig = {
  urgent: { label: 'Dringend', color: 'bg-red-100 text-red-800' },
  high:   { label: 'Hoch',     color: 'bg-orange-100 text-orange-800' },
  medium: { label: 'Mittel',   color: 'bg-amber-100 text-amber-800' },
  low:    { label: 'Niedrig',  color: 'bg-green-100 text-green-800' },
};

interface CaseCardProps {
  caseItem: CaseItem;
  onUpdate?: (id: string, data: Partial<CaseItem>) => void;
}

const QUICK_STATUS_OPTIONS = [
  { value: 'new',         label: 'Neu' },
  { value: 'in_progress', label: 'In Bearbeitung' },
  { value: 'waiting',     label: 'Wartet auf Rückmeldung' },
  { value: 'completed',   label: 'Erledigt' },
];

export const CaseCard: React.FC<CaseCardProps> = ({ caseItem, onUpdate }) => {
  const [showActions, setShowActions] = useState(false);
  const [saving, setSaving] = useState(false);

  const stat = statusConfig[caseItem.status] ?? statusConfig.new;
  const prio = caseItem.priority ? priorityConfig[caseItem.priority] : null;
  const typeLabel = CASE_TYPE_LABELS[caseItem.type] ?? caseItem.type;

  const followUp = caseItem.followUpDate ? new Date(caseItem.followUpDate) : null;
  const due = caseItem.dueDate ? new Date(caseItem.dueDate) : null;
  const followUpToday = followUp && isToday(followUp);
  const followUpOverdue = followUp && isPast(followUp) && !isToday(followUp);
  const dueOverdue = due && isPast(due) && caseItem.status !== 'completed';
  const staleDays = caseItem.status !== 'completed' ? differenceInDays(new Date(), new Date(caseItem.lastUpdated)) : 0;

  const quickSetStatus = async (e: React.MouseEvent, status: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSaving(true);
    const { error } = await supabase.from('cases').update({ status, updated_at: new Date().toISOString() }).eq('id', caseItem.id);
    if (!error && onUpdate) onUpdate(caseItem.id, { status: status as CaseItem['status'] });
    else if (error) toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    setSaving(false);
    setShowActions(false);
  };

  return (
    <div className="relative group">
      <Link to={`/cases/${caseItem.id}`}>
        <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
          {/* Header row */}
          <div className="flex justify-between items-start mb-2 gap-2">
            <div className="flex-1 min-w-0">
              {caseItem.customerName && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                  <User className="w-3 h-3" />
                  <span className="truncate font-medium text-foreground">{caseItem.customerName}</span>
                </div>
              )}
              <h3 className="font-semibold text-sm leading-snug line-clamp-2">{caseItem.title}</h3>
            </div>
            <div className="flex flex-col items-end gap-1 shrink-0">
              {prio && (
                <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${prio.color}`}>
                  <Flag className="w-2.5 h-2.5" /> {prio.label}
                </span>
              )}
              <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full border font-medium ${stat.color}`}>
                {stat.icon} {stat.label}
              </span>
            </div>
          </div>

          {/* Description */}
          {caseItem.description && (
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{caseItem.description}</p>
          )}

          {/* Waiting reason */}
          {caseItem.status === 'waiting' && caseItem.waitingReason && (
            <div className="flex items-center gap-1 text-xs text-purple-700 bg-purple-50 rounded px-2 py-1 mb-2">
              <Hourglass className="w-3 h-3 shrink-0" />
              <span className="truncate">{caseItem.waitingReason}</span>
            </div>
          )}

          {/* Date chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {followUp && (
              <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${followUpOverdue ? 'bg-red-100 text-red-700' : followUpToday ? 'bg-green-100 text-green-700 font-semibold' : 'bg-muted text-muted-foreground'}`}>
                <CalendarCheck className="w-3 h-3" />
                WV {format(followUp, 'dd.MM.', { locale: de })}
                {followUpToday && ' heute'}
              </span>
            )}
            {due && (
              <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${dueOverdue ? 'bg-red-100 text-red-700 font-semibold' : 'bg-muted text-muted-foreground'}`}>
                <CalendarClock className="w-3 h-3" />
                Fällig {format(due, 'dd.MM.', { locale: de })}
                {dueOverdue && ' überfällig!'}
              </span>
            )}
          </div>

          {/* Checklist progress */}
          {caseItem.checklist && caseItem.checklist.length > 0 && (() => {
            const total = caseItem.checklist.length;
            const done = caseItem.checklist.filter(i => i.completed).length;
            const pct = Math.round((done / total) * 100);
            return (
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-muted-foreground">Checkliste</span>
                  <span className={`text-xs font-medium ${done === total ? 'text-green-600' : 'text-muted-foreground'}`}>{done}/{total}</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${done === total ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })()}

          {/* Stale indicator */}
          {staleDays >= 7 && (
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded mb-2 ${staleDays >= 14 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>
              <Clock className="w-3 h-3 shrink-0" />
              {staleDays >= 14 ? `${staleDays} Tage ohne Aktivität!` : `${staleDays} Tage inaktiv`}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <span className="text-xs text-muted-foreground bg-secondary/60 px-1.5 py-0.5 rounded">{typeLabel}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{new Date(caseItem.lastUpdated).toLocaleDateString('de-DE')}</span>
              <CustomAvatar name={caseItem.assignee.name} imageSrc={caseItem.assignee.avatar} size="xs" />
            </div>
          </div>
        </div>
      </Link>

      {/* Quick actions button — outside the Link */}
      {onUpdate && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.preventDefault()}>
          <div className="relative">
            <button
              onClick={e => { e.preventDefault(); e.stopPropagation(); setShowActions(v => !v); }}
              className="flex items-center gap-0.5 text-xs bg-background border border-border rounded px-1.5 py-0.5 shadow-sm hover:bg-muted"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
            {showActions && (
              <div className="absolute right-0 top-7 bg-popover border border-border rounded-lg shadow-lg z-20 py-1 min-w-[170px]" onClick={e => e.stopPropagation()}>
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">Status setzen</div>
                {QUICK_STATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={e => quickSetStatus(e, opt.value)}
                    disabled={saving || caseItem.status === opt.value}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted transition-colors disabled:opacity-40 ${caseItem.status === opt.value ? 'font-semibold' : ''}`}
                  >
                    {caseItem.status === opt.value ? '✓ ' : ''}{opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
