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
    const mentionRegex = /@(\w+)/g;
    const mentions = text.match(mentionRegex) || [];
    users.forEach(user => {
      const userMention = `@${user.name}`;
      if (text.includes(userMention)) {
        formattedText = formattedText.replace(new RegExp(userMention, 'g'), `<span class="text-primary font-medium">${userMention}</span>`);
      }
    });
    return { formattedText, mentions: mentions.map(m => m.substring(1)) };
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

    // Mention notifications
    mentionedUserIds.forEach(uid => {
      if (uid !== profile.id) mentionUser(uid, groupId, `@${users.find(u => u.id === uid)?.name} wurde erwähnt`, 'chat');
    });
    // Notify all others
    users.forEach(user => {
      if (user.id !== profile.id) {
        addNotification({ title: 'Neue Nachricht', message: `${profile.full_name}: ${inputValue.substring(0, 40)}${inputValue.length > 40 ? '...' : ''}`, targetUserId: user.id, type: 'chat', caseId: groupId });
      }
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return { inputValue, setInputValue, typingUsers, formatMessageWithMentions, sendMessage, handleKeyDown };
};
