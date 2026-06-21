import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../ui/button';
import { toast } from '../../hooks/use-toast';
import { Check, X, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface VacationRequest {
  id: string;
  user_id: string;
  type: 'vacation' | 'sick';
  start_date: string;
  end_date: string;
  working_days: number;
  note: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

const TYPE_LABELS = { vacation: 'Urlaub', sick: 'Krankheit' };
const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};
const STATUS_LABELS = { pending: 'Ausstehend', approved: 'Genehmigt', rejected: 'Abgelehnt' };

export const VacationRequestsAdmin: React.FC = () => {
  const { profile } = useAuth();
  const { users } = useUser();
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const load = async () => {
    const { data } = await supabase
      .from('vacation_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRequests(data as VacationRequest[]);
  };

  useEffect(() => { if (profile) load(); }, [profile]);

  const handle = async (id: string, status: 'approved' | 'rejected', req: VacationRequest) => {
    await supabase.from('vacation_requests').update({
      status,
      reviewed_by: profile?.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id);

    if (status === 'approved') {
      // Auto-create calendar event
      await supabase.from('calendar_events').insert({
        title: `${TYPE_LABELS[req.type]} – ${users.find(u => u.id === req.user_id)?.name ?? ''}`,
        start: req.start_date,
        end: req.end_date,
        type: req.type,
        user_id: req.user_id,
        created_by: profile?.id,
      });
      // Notify employee
      await supabase.from('notifications').insert({
        user_id: req.user_id,
        type: 'system',
        title: `${TYPE_LABELS[req.type]} genehmigt`,
        body: `${format(new Date(req.start_date), 'dd.MM.', { locale: de })} – ${format(new Date(req.end_date), 'dd.MM.yyyy', { locale: de })}`,
      });
      toast({ title: 'Genehmigt', description: 'Kalendereintrag wurde automatisch erstellt.' });
    } else {
      await supabase.from('notifications').insert({
        user_id: req.user_id,
        type: 'system',
        title: `${TYPE_LABELS[req.type]} abgelehnt`,
        body: `${format(new Date(req.start_date), 'dd.MM.', { locale: de })} – ${format(new Date(req.end_date), 'dd.MM.yyyy', { locale: de })}`,
      });
      toast({ title: 'Abgelehnt' });
    }
    load();
  };

  const visible = filter === 'pending' ? requests.filter(r => r.status === 'pending') : requests;
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="bg-card rounded-xl border p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Urlaubs- &amp; Krankanträge
          {pendingCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-xs font-bold">{pendingCount}</span>
          )}
        </h2>
        <div className="flex gap-2">
          <button onClick={() => setFilter('pending')} className={`px-3 py-1 rounded-full text-sm border transition-colors ${filter === 'pending' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>Ausstehend</button>
          <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-full text-sm border transition-colors ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>Alle</button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Keine Anträge vorhanden.</p>
      ) : (
        <div className="space-y-2">
          {visible.map(req => {
            const user = users.find(u => u.id === req.user_id);
            return (
              <div key={req.id} className="flex items-center gap-3 p-3 border rounded-lg bg-background">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold shrink-0">
                  {user?.name?.charAt(0) ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{user?.name ?? 'Unbekannt'}</div>
                  <div className="text-xs text-muted-foreground">
                    {TYPE_LABELS[req.type]} · {format(new Date(req.start_date), 'dd.MM.', { locale: de })} – {format(new Date(req.end_date), 'dd.MM.yyyy', { locale: de })} · {req.working_days} AT
                    {req.note && ` · "${req.note}"`}
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_COLORS[req.status]}`}>
                  {STATUS_LABELS[req.status]}
                </span>
                {req.status === 'pending' && (
                  <div className="flex gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:text-green-700" onClick={() => handle(req.id, 'approved', req)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => handle(req.id, 'rejected', req)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
