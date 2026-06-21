import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface AppNotification {
  id: string;
  type: 'mention' | 'assignment' | 'follow_up' | 'system';
  title: string;
  body?: string;
  caseId?: string;
  read: boolean;
  createdAt: string;
}

export const useNotifications = () => {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const load = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(30);
    if (data) setNotifications(data.map(row => ({
      id: row.id, type: row.type, title: row.title, body: row.body,
      caseId: row.case_id, read: row.read, createdAt: row.created_at,
    })));
  }, [profile]);

  useEffect(() => { load(); }, [load]);

  // Realtime
  useEffect(() => {
    if (!profile) return;
    const ch = supabase.channel('notifications-realtime')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${profile.id}`,
      }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profile, load]);

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = async () => {
    if (!profile) return;
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).eq('read', false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markRead, markAllRead, reload: load };
};

export const insertNotification = async (
  userId: string,
  type: AppNotification['type'],
  title: string,
  body?: string,
  caseId?: string,
) => {
  await supabase.from('notifications').insert({ user_id: userId, type, title, body, case_id: caseId ?? null });
};
