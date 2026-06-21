import { useState, useEffect, useRef } from 'react';
import { Message } from '../types/chat';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from './use-toast';

interface UseMessagesProps {
  groupId?: string;
}

const rowToMessage = (row: any): Message => ({
  id: row.id,
  userId: row.user_id,
  text: row.text,
  timestamp: row.created_at,
  mentions: row.mentions ?? [],
  isEdited: row.is_edited ?? false,
});

export const useMessages = ({ groupId = 'global' }: UseMessagesProps = {}) => {
  const { currentUser } = useUser();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const channelRef = useRef<any>(null);

  const ensureChannel = async () => {
    if (!profile) return null;
    const { data: existing } = await supabase.from('chat_channels').select('id').eq('name', groupId).maybeSingle();
    if (existing) return existing.id;
    const { data: created } = await supabase.from('chat_channels').insert({
      name: groupId, type: 'channel', created_by: profile.id,
    }).select('id').single();
    return created?.id ?? null;
  };

  const loadMessages = async () => {
    if (!profile) return;
    setIsLoading(true);
    const channelId = await ensureChannel();
    if (!channelId) { setIsLoading(false); return; }
    const { data } = await supabase.from('chat_messages').select('*').eq('channel_id', channelId).order('created_at');
    if (data) setMessages(data.map(rowToMessage));
    setIsLoading(false);
  };

  useEffect(() => {
    if (!profile) return;
    loadMessages();

    const sub = supabase.channel(`chat:${groupId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages(prev => {
          if (prev.find(m => m.id === payload.new.id)) return prev;
          const newMsg = rowToMessage(payload.new);
          if (currentUser && newMsg.userId !== currentUser.id) setUnreadMessages(u => u + 1);
          return [...prev, newMsg];
        });
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages(prev => prev.map(m => m.id === payload.new.id ? rowToMessage(payload.new) : m));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
      })
      .subscribe();

    channelRef.current = sub;
    return () => { supabase.removeChannel(sub); };
  }, [profile, groupId]);

  const editMessage = async (messageId: string, newText: string) => {
    const { error } = await supabase.from('chat_messages').update({ text: newText, is_edited: true }).eq('id', messageId);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Nachricht bearbeitet' });
  };

  const deleteMessage = async (messageId: string) => {
    const { error } = await supabase.from('chat_messages').delete().eq('id', messageId);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Nachricht gelöscht' });
  };

  return { messages, setMessages, isLoading, unreadMessages, editMessage, deleteMessage };
};
