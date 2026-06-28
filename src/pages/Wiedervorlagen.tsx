import React, { useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useUser } from '../contexts/UserContext';
import { Link } from 'react-router-dom';
import { RefreshCw, ChevronRight, Clock, AlertTriangle, Info } from 'lucide-react';
import { format, isToday, isPast, isTomorrow, addDays, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';
import { Badge } from '../components/ui/badge';
import { CASE_TYPE_LABELS } from '../types/case';

interface WVCase {
  id: string;
  title: string;
  customer_name: string;
  status: string;
  type: string;
  priority: string;
  follow_up_date: string;
  assignee_id: string;
}

const STATUS_LABELS: Record<string,string> = { new:'Neu', in_progress:'In Bearbeitung', waiting:'Wartet', completed:'Erledigt' };
const STATUS_COLORS: Record<string,string> = { new:'bg-blue-100 text-blue-700', in_progress:'bg-amber-100 text-amber-700', waiting:'bg-purple-100 text-purple-700', completed:'bg-green-100 text-green-700' };

function dateLabel(d: string) {
  const date = new Date(d);
  if (isPast(date) && !isToday(date)) return { label: `Überfällig · ${format(date,'dd.MM.yyyy',{locale:de})}`, cls:'text-red-500 font-semibold' };
  if (isToday(date)) return { label: 'Heute', cls: 'text-amber-600 font-semibold' };
  if (isTomorrow(date)) return { label: 'Morgen', cls: 'text-amber-500' };
  return { label: format(date,'dd. MMMM yyyy',{locale:de}), cls:'text-muted-foreground' };
}

export default function Wiedervorlagen() {
  const { profile } = useAuth();
  const { users, currentUser, isAdmin } = useUser();
  const [cases, setCases] = useState<WVCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterUser, setFilterUser] = useState<string>('me');
  const [filterInitialized, setFilterInitialized] = useState(false);

  // Set admin default once isAdmin is known (auth loads async)
  useEffect(() => {
    if (filterInitialized) return;
    if (isAdmin) { setFilterUser('all'); setFilterInitialized(true); }
    else if (profile) setFilterInitialized(true);
  }, [isAdmin, profile, filterInitialized]);

  useEffect(() => {
    if (!profile) return;
    setIsLoading(true);
    supabase.from('cases')
      .select('id,title,customer_name,status,type,priority,follow_up_date,assignee_id')
      .not('follow_up_date', 'is', null)
      .eq('archived', false)
      .neq('status', 'completed')
      .order('follow_up_date', { ascending: true })
      .then(({ data }) => {
        if (data) setCases(data);
        setIsLoading(false);
      });
  }, [profile]);

  const displayCases = cases.filter(c => {
    if (filterUser === 'me') return c.assignee_id === profile?.id;
    if (filterUser === 'all') return true;
    return c.assignee_id === filterUser;
  });

  // Group by: overdue, today, tomorrow, this week, later
  const overdue  = displayCases.filter(c => isPast(new Date(c.follow_up_date)) && !isToday(new Date(c.follow_up_date)));
  const today    = displayCases.filter(c => isToday(new Date(c.follow_up_date)));
  const tomorrow = displayCases.filter(c => isTomorrow(new Date(c.follow_up_date)));
  const thisWeek = displayCases.filter(c => {
    const d = new Date(c.follow_up_date);
    return !isPast(d) && !isToday(d) && !isTomorrow(d) && isAfter(addDays(new Date(), 7), d);
  });
  const later = displayCases.filter(c => isAfter(new Date(c.follow_up_date), addDays(new Date(), 7)));

  const Row = ({ c }: { c: WVCase }) => {
    const { label, cls } = dateLabel(c.follow_up_date);
    const user = users.find(u => u.id === c.assignee_id);
    return (
      <Link to={`/cases/${c.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{c.title}</p>
          <div className="flex items-center gap-2 text-xs mt-0.5 flex-wrap">
            <span className={`flex items-center gap-1 ${cls}`}><RefreshCw className="w-3 h-3" />{label}</span>
            {c.customer_name && <><span className="text-muted-foreground">·</span><span className="text-muted-foreground">{c.customer_name}</span></>}
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{CASE_TYPE_LABELS[c.type] ?? c.type}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isAdmin && user && <span className="text-xs text-muted-foreground hidden sm:block">{user.name}</span>}
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>
      </Link>
    );
  };

  const Group = ({ title, icon: Icon, items, cls }: { title: string; icon: any; items: WVCase[]; cls?: string }) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-6">
        <div className={`flex items-center gap-2 mb-2 ${cls ?? 'text-foreground'}`}>
          <Icon className="w-4 h-4" />
          <span className="font-semibold text-sm">{title}</span>
          <Badge variant="secondary" className="text-xs">{items.length}</Badge>
        </div>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border p-1">
            {items.map(c => <Row key={c.id} c={c} />)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <RefreshCw className="w-7 h-7" /> Wiedervorlagen
              <span className="group relative">
                <Info className="w-5 h-5 text-muted-foreground cursor-help" />
                <div className="absolute left-0 top-7 z-10 hidden group-hover:block w-72 bg-popover border border-border rounded-xl shadow-lg p-3 text-sm font-normal">
                  <p className="font-semibold mb-1 text-foreground">Was ist eine Wiedervorlage?</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Eine Wiedervorlage ist ein Erinnerungsdatum an einem Vorgang — z.B. "In 2 Wochen nachfragen ob der Antrag bearbeitet wurde". Vorgänge mit Wiedervorlagedatum erscheinen hier sortiert nach Dringlichkeit.
                  </p>
                </div>
              </span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{displayCases.length} Vorgänge mit Wiedervorlage</p>
          </div>
          {isAdmin && (
            <select value={filterUser} onChange={e => setFilterUser(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none">
              <option value="me">Nur meine</option>
              <option value="all">Alle Mitarbeiter</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          )}
        </div>

        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[1,2,3,4].map(i => <div key={i} className="h-14 bg-muted rounded-xl" />)}
          </div>
        ) : displayCases.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <RefreshCw className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Keine Wiedervorlagen</p>
            <p className="text-sm mt-1">Setze an einem Vorgang ein Wiedervorlagedatum um es hier zu sehen.</p>
          </div>
        ) : (
          <>
            <Group title="Überfällig" icon={AlertTriangle} items={overdue} cls="text-red-500" />
            <Group title="Heute" icon={Clock} items={today} cls="text-amber-600" />
            <Group title="Morgen" icon={Clock} items={tomorrow} cls="text-amber-500" />
            <Group title="Diese Woche" icon={RefreshCw} items={thisWeek} />
            <Group title="Später" icon={RefreshCw} items={later} />
          </>
        )}
      </div>
    </AppLayout>
  );
}
