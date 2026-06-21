import React, { useState, useEffect } from 'react';
import {
  FileText, CheckSquare, ClipboardCheck, Archive, MessageSquare,
  AlertTriangle, Clock, Calendar, Users, Phone, RefreshCw,
  TrendingUp, UserCheck, UserX, Bell, ChevronRight, Flag,
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { CaseItem, CASE_TYPE_LABELS } from '../types/case';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { format, isToday, isPast, addDays, isAfter, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { de } from 'date-fns/locale';

// ─── helpers ────────────────────────────────────────────────
const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-green-100 text-green-800', medium: 'bg-blue-100 text-blue-800',
  high: 'bg-amber-100 text-amber-800', urgent: 'bg-red-100 text-red-800',
};
const PRIORITY_LABELS: Record<string, string> = { low: 'Niedrig', medium: 'Mittel', high: 'Hoch', urgent: 'Dringend' };
const STATUS_LABELS: Record<string, string> = { new: 'Neu', in_progress: 'In Bearbeitung', waiting: 'Wartet', completed: 'Erledigt' };
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700', in_progress: 'bg-amber-100 text-amber-700',
  waiting: 'bg-purple-100 text-purple-700', completed: 'bg-green-100 text-green-700',
};

function StatTile({ label, value, icon: Icon, color, onClick }: { label: string; value: number; icon: any; color: string; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`bg-card border border-border rounded-xl p-5 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
      <div className={`p-3 rounded-full ${color}`}><Icon className="w-5 h-5" /></div>
      <div><p className="text-2xl font-bold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
    </div>
  );
}

function CaseRow({ c, users }: { c: CaseItem; users: any[] }) {
  const assigneeName = users.find(u => u.id === c.assignee?.id)?.name ?? c.assignee?.name ?? '—';
  const isOverdue = c.dueDate && isPast(new Date(c.dueDate)) && c.status !== 'completed';
  const isFollowUpToday = c.followUpDate && isToday(new Date(c.followUpDate));
  return (
    <Link to={`/cases/${c.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-medium text-sm truncate">{c.title}</span>
          {isOverdue && <Badge variant="destructive" className="text-xs py-0 px-1.5">Überfällig</Badge>}
          {isFollowUpToday && <Badge className="text-xs py-0 px-1.5 bg-purple-100 text-purple-700">Wiedervorlage heute</Badge>}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{c.customerName || '—'}</span>
          <span>·</span>
          <span>{CASE_TYPE_LABELS[c.type] ?? c.type}</span>
          {c.followUpDate && <><span>·</span><span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" />{format(new Date(c.followUpDate), 'dd.MM.', { locale: de })}</span></>}
          {c.dueDate && <><span>·</span><span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-medium' : ''}`}><Clock className="w-3 h-3" />{format(new Date(c.dueDate), 'dd.MM.', { locale: de })}</span></>}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted-foreground hidden sm:block">{assigneeName}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[c.status]}`}>{STATUS_LABELS[c.status]}</span>
        {c.priority && c.priority !== 'medium' && <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[c.priority]}`}>{PRIORITY_LABELS[c.priority]}</span>}
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

function SectionBox({ title, icon: Icon, count, children, onMore, emptyText }: { title: string; icon: any; count?: number; children: React.ReactNode; onMore?: () => void; emptyText?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">{title}</span>
          {count !== undefined && <Badge variant="secondary" className="text-xs">{count}</Badge>}
        </div>
        {onMore && <button onClick={onMore} className="text-xs text-primary hover:underline flex items-center gap-1">Alle anzeigen <ChevronRight className="w-3 h-3" /></button>}
      </div>
      <div className="p-3">
        {React.Children.count(children) === 0 || (Array.isArray(children) && children.filter(Boolean).length === 0)
          ? <p className="text-sm text-muted-foreground text-center py-4">{emptyText ?? 'Keine Einträge'}</p>
          : children}
      </div>
    </div>
  );
}

// ─── Admin Dashboard ─────────────────────────────────────────
function AdminDashboard({ allCases, users, absentToday }: { allCases: CaseItem[]; users: any[]; absentToday: string[] }) {
  const navigate = useNavigate();

  const active = allCases.filter(c => c.status !== 'completed');
  const newCases = allCases.filter(c => c.status === 'new');
  const overdue = active.filter(c => c.dueDate && isPast(new Date(c.dueDate)));
  const noFollowUp = active.filter(c => !c.followUpDate && c.status !== 'new');
  const urgent = active.filter(c => c.priority === 'urgent');
  const followUpToday = active.filter(c => c.followUpDate && isToday(new Date(c.followUpDate)));
  const followUpThisWeek = active.filter(c => {
    if (!c.followUpDate) return false;
    const d = new Date(c.followUpDate);
    return isAfter(d, new Date()) && !isAfter(d, addDays(new Date(), 7));
  });

  // Per-user workload
  const workload = users.map(u => ({
    ...u,
    open: active.filter(c => c.assignee?.id === u.id).length,
    urgent: active.filter(c => c.assignee?.id === u.id && c.priority === 'urgent').length,
    overdue: active.filter(c => c.assignee?.id === u.id && c.dueDate && isPast(new Date(c.dueDate))).length,
    isAbsent: absentToday.includes(u.id),
  })).sort((a, b) => b.open - a.open);

  return (
    <>
      {/* Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Offene Vorgänge" value={active.length} icon={FileText} color="bg-blue-100 text-blue-600" onClick={() => navigate('/cases')} />
        <StatTile label="Neue Vorgänge" value={newCases.length} icon={ClipboardCheck} color="bg-purple-100 text-purple-600" onClick={() => navigate('/cases')} />
        <StatTile label="Überfällig" value={overdue.length} icon={AlertTriangle} color="bg-red-100 text-red-600" onClick={() => navigate('/cases')} />
        <StatTile label="Heute abwesend" value={absentToday.length} icon={UserX} color="bg-amber-100 text-amber-600" />
      </div>

      {/* Warnungen */}
      {(urgent.length > 0 || overdue.length > 0) && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {urgent.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span><strong>{urgent.length}</strong> dringende Vorgänge im Team</span>
            </div>
          )}
          {overdue.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700">
              <Clock className="w-4 h-4" />
              <span><strong>{overdue.length}</strong> überfällige Vorgänge</span>
            </div>
          )}
          {noFollowUp.length > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5 text-sm text-orange-700">
              <Bell className="w-4 h-4" />
              <span><strong>{noFollowUp.length}</strong> Vorgänge ohne Wiedervorlage</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team-Auslastung */}
        <div className="lg:col-span-1">
          <SectionBox title="Team-Auslastung" icon={Users} count={users.length}>
            <div className="space-y-1">
              {workload.map(u => (
                <div key={u.id} className={`flex items-center gap-3 p-2.5 rounded-lg ${u.isAbsent ? 'bg-amber-50' : 'hover:bg-muted/50'}`}>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0 overflow-hidden">
                    {u.avatar_url ? <img src={u.avatar_url} alt={u.full_name} className="w-full h-full object-cover" /> : u.full_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate">{u.full_name}</span>
                      {u.isAbsent && <Badge variant="outline" className="text-xs py-0 border-amber-400 text-amber-600">Abwesend</Badge>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs shrink-0">
                    {u.urgent > 0 && <span className="text-red-600 font-bold">{u.urgent}!</span>}
                    {u.overdue > 0 && <span className="text-amber-600">⚠{u.overdue}</span>}
                    <span className="font-semibold">{u.open}</span>
                    <span className="text-muted-foreground">offen</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionBox>

          {/* Chat-Shortcut */}
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Team-Chat</span>
            </div>
            <Button size="sm" onClick={() => navigate('/chat')}>Öffnen</Button>
          </div>
        </div>

        {/* Vorgänge-Spalte */}
        <div className="lg:col-span-2 space-y-0">
          {followUpToday.length > 0 && (
            <SectionBox title="Wiedervorlagen heute" icon={RefreshCw} count={followUpToday.length} onMore={() => navigate('/cases')}>
              {followUpToday.slice(0, 6).map(c => <CaseRow key={c.id} c={c} users={users} />)}
            </SectionBox>
          )}

          {overdue.length > 0 && (
            <SectionBox title="Überfällige Vorgänge" icon={AlertTriangle} count={overdue.length} onMore={() => navigate('/cases')}>
              {overdue.slice(0, 5).map(c => <CaseRow key={c.id} c={c} users={users} />)}
            </SectionBox>
          )}

          <SectionBox title="Neue Vorgänge" icon={ClipboardCheck} count={newCases.length} onMore={() => navigate('/cases')} emptyText="Keine neuen Vorgänge">
            {newCases.slice(0, 5).map(c => <CaseRow key={c.id} c={c} users={users} />)}
          </SectionBox>

          {noFollowUp.length > 0 && (
            <SectionBox title="Ohne Wiedervorlage (Risiko)" icon={Bell} count={noFollowUp.length} onMore={() => navigate('/cases')}>
              {noFollowUp.slice(0, 4).map(c => <CaseRow key={c.id} c={c} users={users} />)}
            </SectionBox>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Staff Dashboard ──────────────────────────────────────────
function StaffDashboard({ allCases, currentUserId, users }: { allCases: CaseItem[]; currentUserId: string; users: any[] }) {
  const navigate = useNavigate();

  const mine = allCases.filter(c => c.assignee?.id === currentUserId && c.status !== 'completed');
  const newForMe = allCases.filter(c => c.assignee?.id === currentUserId && c.status === 'new');
  const total = mine.length;

  const followUpToday = mine.filter(c => c.followUpDate && isToday(new Date(c.followUpDate)));
  const followUpThisWeek = mine.filter(c => {
    if (!c.followUpDate) return false;
    const d = new Date(c.followUpDate);
    return isAfter(d, new Date()) && !isAfter(d, addDays(new Date(), 7)) && !isToday(d);
  });
  const overdue = mine.filter(c => c.dueDate && isPast(new Date(c.dueDate)));
  const urgent = mine.filter(c => c.priority === 'urgent' || c.priority === 'high');
  const waiting = mine.filter(c => c.status === 'waiting');
  const inProgress = mine.filter(c => c.status === 'in_progress');
  const noFollowUp = mine.filter(c => !c.followUpDate && c.status !== 'new');

  return (
    <>
      {/* Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatTile label="Meine offenen Vorgänge" value={total} icon={FileText} color="bg-blue-100 text-blue-600" onClick={() => navigate('/cases')} />
        <StatTile label="In Bearbeitung" value={inProgress.length} icon={CheckSquare} color="bg-amber-100 text-amber-600" onClick={() => navigate('/cases')} />
        <StatTile label="Wartet auf Rückmeldung" value={waiting.length} icon={Clock} color="bg-purple-100 text-purple-600" onClick={() => navigate('/cases')} />
        <StatTile label="Neue Vorgänge" value={newForMe.length} icon={ClipboardCheck} color="bg-green-100 text-green-600" onClick={() => navigate('/cases')} />
      </div>

      {/* Warnungen */}
      {(urgent.length > 0 || overdue.length > 0) && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {urgent.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-sm text-red-700">
              <Flag className="w-4 h-4" />
              <span><strong>{urgent.length}</strong> dringende/hohe Priorität</span>
            </div>
          )}
          {overdue.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5 text-sm text-amber-700">
              <Clock className="w-4 h-4" />
              <span><strong>{overdue.length}</strong> überfällig</span>
            </div>
          )}
          {noFollowUp.length > 0 && (
            <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-lg px-4 py-2.5 text-sm text-orange-700">
              <Bell className="w-4 h-4" />
              <span><strong>{noFollowUp.length}</strong> ohne Wiedervorlage</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Linke Spalte */}
        <div className="lg:col-span-1 space-y-4">
          {/* Wiedervorlagen heute */}
          <SectionBox title="Wiedervorlagen heute" icon={RefreshCw} count={followUpToday.length} emptyText="Heute keine Wiedervorlagen">
            {followUpToday.map(c => (
              <Link key={c.id} to={`/cases/${c.id}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.customerName || CASE_TYPE_LABELS[c.type]}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            ))}
          </SectionBox>

          {/* Wiedervorlagen diese Woche */}
          <SectionBox title="Diese Woche fällig" icon={Calendar} count={followUpThisWeek.length} emptyText="Keine weiteren Wiedervorlagen">
            {followUpThisWeek.slice(0, 5).map(c => (
              <Link key={c.id} to={`/cases/${c.id}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors group">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.followUpDate && format(new Date(c.followUpDate), 'EEEE, dd.MM.', { locale: de })}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </Link>
            ))}
          </SectionBox>

          {/* Chat */}
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Team-Chat</span>
            </div>
            <Button size="sm" onClick={() => navigate('/chat')}>Öffnen</Button>
          </div>
        </div>

        {/* Rechte Spalte: Meine Vorgänge */}
        <div className="lg:col-span-2 space-y-0">
          {urgent.length > 0 && (
            <SectionBox title="Dringend / Hohe Priorität" icon={AlertTriangle} count={urgent.length} onMore={() => navigate('/cases')}>
              {urgent.slice(0, 5).map(c => <CaseRow key={c.id} c={c} users={users} />)}
            </SectionBox>
          )}

          <SectionBox title="Meine aktiven Vorgänge" icon={FileText} count={mine.length} onMore={() => navigate('/cases')} emptyText="Keine aktiven Vorgänge — gut gemacht!">
            {mine.filter(c => c.priority !== 'urgent' && c.priority !== 'high').slice(0, 8).map(c => <CaseRow key={c.id} c={c} users={users} />)}
          </SectionBox>

          {waiting.length > 0 && (
            <SectionBox title="Wartet auf Rückmeldung" icon={Clock} count={waiting.length} onMore={() => navigate('/cases')}>
              {waiting.slice(0, 4).map(c => <CaseRow key={c.id} c={c} users={users} />)}
            </SectionBox>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Main ─────────────────────────────────────────────────────
const Index: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, currentUser, users } = useUser();
  const { profile } = useAuth();
  const [allCases, setAllCases] = useState<CaseItem[]>([]);
  const [absentToday, setAbsentToday] = useState<string[]>([]);
  const [rawUsers, setRawUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!profile) return;

    // Cases
    supabase.from('cases').select('id,title,description,status,priority,type,customer_name,assignee_id,created_by,due_date,follow_up_date,waiting_reason,updated_at,created_at')
      .eq('archived', false).order('updated_at', { ascending: false })
      .then(({ data }) => {
        if (!data) return;
        setAllCases(data.map((row: any) => ({
          id: row.id, title: row.title, description: row.description ?? '',
          status: row.status, priority: row.priority ?? 'medium', type: row.type,
          customerName: row.customer_name ?? '', customerEmail: '',
          assignee: { id: row.assignee_id, name: '', role: '' },
          creator: row.created_by ? { id: row.created_by, name: '', role: '' } : undefined,
          createdAt: row.created_at, lastUpdated: row.updated_at,
          dueDate: row.due_date, followUpDate: row.follow_up_date,
          waitingReason: row.waiting_reason, archived: false,
          activities: [], checklist: [], documents: [],
        })));
      });

    // Today's absences
    const today = new Date().toISOString().slice(0, 10);
    supabase.from('calendar_events').select('user_id').in('type', ['absence', 'sick'])
      .lte('start_time', today + 'T23:59:59').gte('end_time', today + 'T00:00:00')
      .then(({ data }) => { if (data) setAbsentToday(data.map((r: any) => r.user_id).filter(Boolean)); });

    // Raw profiles for workload table
    supabase.from('profiles').select('id,full_name,avatar_url,role').eq('is_active', true)
      .then(({ data }) => { if (data) setRawUsers(data); });
  }, [profile]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Guten Morgen';
    if (h < 17) return 'Guten Tag';
    return 'Guten Abend';
  };

  const todayStr = format(new Date(), "EEEE, d. MMMM yyyy", { locale: de });

  return (
    <AppLayout>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">{greeting()}, {profile?.full_name?.split(' ')[0]} 👋</h1>
          <p className="text-muted-foreground text-sm">{todayStr} · {isAdmin ? 'Admin-Übersicht' : 'Mein Arbeitsbereich'}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/cases')} className="flex items-center gap-1.5">
          <FileText className="w-4 h-4" /> Alle Vorgänge
        </Button>
      </div>

      {isAdmin
        ? <AdminDashboard allCases={allCases} users={rawUsers} absentToday={absentToday} />
        : <StaffDashboard allCases={allCases} currentUserId={currentUser?.id ?? ''} users={rawUsers} />
      }
    </AppLayout>
  );
};

export default Index;
