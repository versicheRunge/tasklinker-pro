import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Clock, CheckCircle2, XCircle, Plane, Stethoscope } from 'lucide-react';

interface Request {
  id: string;
  type: 'vacation' | 'sick';
  start_date: string;
  end_date: string;
  working_days: number;
  note: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const TYPE_LABELS = { vacation: 'Urlaub', sick: 'Krankmeldung' };
const TYPE_ICON = {
  vacation: <Plane className="w-3.5 h-3.5" />,
  sick: <Stethoscope className="w-3.5 h-3.5" />,
};
const STATUS_CONFIG = {
  pending:  { label: 'Ausstehend', icon: <Clock className="w-3.5 h-3.5" />, cls: 'bg-amber-100 text-amber-800 border-amber-200' },
  approved: { label: 'Genehmigt',  icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: 'bg-green-100 text-green-800 border-green-200' },
  rejected: { label: 'Abgelehnt',  icon: <XCircle className="w-3.5 h-3.5" />, cls: 'bg-red-100 text-red-800 border-red-200' },
};

export const MyVacationRequests: React.FC = () => {
  const { profile } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending'>('all');

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('vacation_requests')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => { if (data) setRequests(data as Request[]); });
  }, [profile]);

  const shown = filter === 'pending' ? requests.filter(r => r.status === 'pending') : requests;

  return (
    <div className="mt-6 bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-sm">Meine Anträge</h3>
        <div className="flex gap-1">
          {(['all', 'pending'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-2.5 py-1 rounded-md transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
            >
              {f === 'all' ? 'Alle' : 'Ausstehend'}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          {filter === 'pending' ? 'Keine ausstehenden Anträge.' : 'Noch keine Anträge gestellt.'}
        </p>
      ) : (
        <div className="divide-y divide-border/50">
          {shown.map(r => {
            const cfg = STATUS_CONFIG[r.status];
            return (
              <div key={r.id} className="flex items-center gap-4 px-5 py-3 text-sm">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${cfg.cls}`}>
                  {cfg.icon}
                  {cfg.label}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  {TYPE_ICON[r.type]}
                  <span className="font-medium text-foreground">{TYPE_LABELS[r.type]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <span>
                    {format(new Date(r.start_date), 'dd. MMM', { locale: de })} –{' '}
                    {format(new Date(r.end_date), 'dd. MMM yyyy', { locale: de })}
                  </span>
                  <span className="text-muted-foreground ml-2">({r.working_days} AT)</span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(r.created_at), 'dd.MM.yy', { locale: de })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
