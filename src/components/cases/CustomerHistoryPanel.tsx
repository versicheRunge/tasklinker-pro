
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, AlertCircle, Clock, Hourglass, CheckCircle2, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CASE_TYPE_LABELS } from '../../types/case';

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  new:         { icon: <AlertCircle className="w-3 h-3" />,   color: 'text-blue-600',   label: 'Neu' },
  in_progress: { icon: <Clock className="w-3 h-3" />,         color: 'text-amber-600',  label: 'In Bearb.' },
  waiting:     { icon: <Hourglass className="w-3 h-3" />,     color: 'text-purple-600', label: 'Wartet' },
  completed:   { icon: <CheckCircle2 className="w-3 h-3" />,  color: 'text-green-600',  label: 'Erledigt' },
};

interface Props {
  customerName: string;
  currentCaseId: string;
}

export const CustomerHistoryPanel: React.FC<Props> = ({ customerName, currentCaseId }) => {
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!customerName.trim()) { setLoading(false); return; }
    supabase
      .from('cases')
      .select('id, title, status, type, created_at, archived')
      .ilike('customer_name', customerName.trim())
      .neq('id', currentCaseId)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        setCases(data ?? []);
        setLoading(false);
      });
  }, [customerName, currentCaseId]);

  if (loading || cases.length === 0) return null;

  const open = cases.filter(c => !c.archived && c.status !== 'completed');
  const closed = cases.filter(c => c.archived || c.status === 'completed');

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="font-semibold text-sm">Weitere Vorgänge — {customerName}</span>
        <span className="ml-auto text-xs text-muted-foreground">{cases.length} gesamt</span>
      </div>

      <div className="divide-y divide-border/50">
        {open.length > 0 && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Offen ({open.length})</p>
            {open.map(c => {
              const sc = STATUS_CONFIG[c.status] ?? STATUS_CONFIG.new;
              return (
                <Link key={c.id} to={`/cases/${c.id}`} className="flex items-center gap-2 py-1.5 rounded hover:bg-muted/50 px-1 group transition-colors">
                  <span className={`${sc.color} shrink-0`}>{sc.icon}</span>
                  <span className="text-xs flex-1 truncate font-medium">{c.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{CASE_TYPE_LABELS[c.type as keyof typeof CASE_TYPE_LABELS] ?? c.type}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </Link>
              );
            })}
          </div>
        )}

        {closed.length > 0 && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">Abgeschlossen ({closed.length})</p>
            {closed.slice(0, 3).map(c => (
              <Link key={c.id} to={`/cases/${c.id}`} className="flex items-center gap-2 py-1.5 rounded hover:bg-muted/50 px-1 group transition-colors opacity-60">
                <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
                <span className="text-xs flex-1 truncate">{c.title}</span>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(c.created_at).toLocaleDateString('de-DE')}</span>
              </Link>
            ))}
            {closed.length > 3 && <p className="text-xs text-muted-foreground px-1 pt-1">+{closed.length - 3} weitere…</p>}
          </div>
        )}
      </div>
    </div>
  );
};
