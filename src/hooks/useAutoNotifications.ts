import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format, subDays } from 'date-fns';

const TODAY = format(new Date(), 'yyyy-MM-dd');
const STORAGE_KEY = 'auto_notif_checked';

/** Runs once per day on mount. Creates in-app notifications for:
 *  - Wiedervorlagen fällig heute
 *  - Überfällige Aufgaben
 *  - Vorgänge mit Deadline in ≤3 Tagen aber ohne WVL
 */
export function useAutoNotifications() {
  const { profile } = useAuth();

  useEffect(() => {
    if (!profile) return;
    const storageKey = `${STORAGE_KEY}_${profile.id}`;
    if (localStorage.getItem(storageKey) === TODAY) return;

    (async () => {
      await checkWvlDueToday(profile.id);
      await checkOverdueTasks(profile.id);
      await checkCasesDueSoon(profile.id);
      localStorage.setItem(storageKey, TODAY);
    })();
  }, [profile]);
}

// ─── WVL fällig heute ────────────────────────────────────────────────────────

async function checkWvlDueToday(userId: string) {
  const { data } = await supabase
    .from('cases')
    .select('id, title, customer_name')
    .eq('follow_up_date', TODAY)
    .eq('assignee_id', userId)
    .eq('archived', false)
    .neq('status', 'completed');

  if (!data?.length) return;

  const existing = await getExistingNotifTitles(userId, 'follow_up');

  for (const c of data) {
    const title = `WVL fällig: ${c.customer_name ?? c.title}`;
    if (existing.has(title)) continue;
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'follow_up',
      title,
      body: c.title,
      case_id: c.id,
    });
  }
}

// ─── Überfällige Aufgaben ────────────────────────────────────────────────────

async function checkOverdueTasks(userId: string) {
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  const { data } = await supabase
    .from('user_tasks')
    .select('id, title, due_date')
    .eq('user_id', userId)
    .eq('completed', false)
    .lt('due_date', TODAY)
    .not('due_date', 'is', null);

  if (!data?.length) return;

  const existing = await getExistingNotifTitles(userId, 'assignment');

  for (const t of data) {
    const title = `Aufgabe überfällig: ${t.title}`;
    if (existing.has(title)) continue;
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'assignment',
      title,
      body: `Fällig seit ${format(new Date(t.due_date), 'dd.MM.yyyy')}`,
    });
  }
}

// ─── Vorgänge mit Deadline ≤3 Tage & ohne WVL ───────────────────────────────

async function checkCasesDueSoon(userId: string) {
  const in3days = format(new Date(Date.now() + 3 * 86400000), 'yyyy-MM-dd');

  const { data } = await supabase
    .from('cases')
    .select('id, title, customer_name, due_date')
    .eq('assignee_id', userId)
    .eq('archived', false)
    .neq('status', 'completed')
    .is('follow_up_date', null)
    .not('due_date', 'is', null)
    .lte('due_date', in3days)
    .gte('due_date', TODAY);

  if (!data?.length) return;

  const existing = await getExistingNotifTitles(userId, 'system');

  for (const c of data) {
    const title = `Deadline bald: ${c.customer_name ?? c.title}`;
    if (existing.has(title)) continue;
    await supabase.from('notifications').insert({
      user_id: userId,
      type: 'system',
      title,
      body: `Fällig am ${format(new Date(c.due_date), 'dd.MM.yyyy')} – noch keine Wiedervorlage gesetzt`,
      case_id: c.id,
    });
  }
}

// ─── Helper ──────────────────────────────────────────────────────────────────

async function getExistingNotifTitles(userId: string, type: string): Promise<Set<string>> {
  const since = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const { data } = await supabase
    .from('notifications')
    .select('title')
    .eq('user_id', userId)
    .eq('type', type)
    .gte('created_at', since);
  return new Set((data ?? []).map(n => n.title));
}
