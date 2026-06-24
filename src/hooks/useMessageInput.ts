import { useState } from 'react';
import { Message } from '../types/chat';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface UseMessageInputProps {
  groupId?: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const useMessageInput = ({ groupId = 'global', setMessages }: UseMessageInputProps) => {
  const { users, currentUser, mentionUser, addNotification } = useUser();
  const { profile } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const formatMessageWithMentions = (text: string) => {
    let formattedText = text;
    // Escape HTML to prevent XSS, then re-insert mention spans
    const escapeHtml = (s: string) => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    formattedText = escapeHtml(formattedText);
    const mentionedUsers: string[] = [];
    // Sort by longest name first to avoid partial replacements
    [...users].sort((a, b) => b.name.length - a.name.length).forEach(user => {
      const tag = `@${user.name}`;
      const escaped = escapeHtml(tag);
      if (formattedText.includes(escaped)) {
        mentionedUsers.push(user.name);
        // Use inline styles so mention is visible on both light and dark bubbles
        formattedText = formattedText.split(escaped).join(
          `<span style="background:rgba(255,255,255,0.25);border-radius:4px;padding:1px 4px;font-weight:600;">${escaped}</span>`
        );
      }
    });
    return { formattedText, mentions: mentionedUsers };
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !profile) return;
    const { mentions } = formatMessageWithMentions(inputValue);
    const mentionedUserIds = mentions.map(name => users.find(u => u.name === name)?.id).filter(Boolean) as string[];

    const { data: channel } = await supabase.from('chat_channels').select('id').eq('name', groupId).maybeSingle();
    let channelId = channel?.id;

    if (!channelId) {
      const { data: created } = await supabase.from('chat_channels').insert({ name: groupId, type: 'channel', created_by: profile.id }).select('id').single();
      channelId = created?.id;
    }
    if (!channelId) return;

    const { error } = await supabase.from('chat_messages').insert({
      channel_id: channelId, user_id: profile.id, text: inputValue, mentions: mentionedUserIds,
    });
    if (error) { console.error('Chat-Fehler:', error.message); return; }
    setInputValue('');

    // Only notify mentioned users
    for (const uid of mentionedUserIds) {
      if (uid !== profile.id) {
        await supabase.from('notifications').insert({
          user_id: uid,
          type: 'mention',
          title: `${currentUser?.name ?? 'Jemand'} hat Sie erwähnt`,
          body: inputValue.substring(0, 80),
        });
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return { inputValue, setInputValue, typingUsers, formatMessageWithMentions, sendMessage, handleKeyDown };
};
