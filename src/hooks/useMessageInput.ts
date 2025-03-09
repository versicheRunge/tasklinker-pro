
import { useState } from 'react';
import { Message, User } from '../types/chat';
import { useUser } from '../contexts/UserContext';

interface UseMessageInputProps {
  groupId?: string;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export const useMessageInput = ({ groupId = 'global', setMessages }: UseMessageInputProps) => {
  const { users, currentUser, mentionUser, addNotification } = useUser();
  const [inputValue, setInputValue] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const formatMessageWithMentions = (text: string) => {
    let formattedText = text;
    
    const mentionRegex = /@(\w+)/g;
    const mentions = text.match(mentionRegex) || [];
    
    users.forEach(user => {
      const userMention = `@${user.name}`;
      if (text.includes(userMention)) {
        formattedText = formattedText.replace(
          new RegExp(userMention, 'g'),
          `<span class="text-primary font-medium">${userMention}</span>`
        );
      }
    });
    
    return { formattedText, mentions: mentions.map(m => m.substring(1)) };
  };

  const simulateUserTyping = (userId: string) => {
    if (!typingUsers.includes(userId)) {
      setTypingUsers(prev => [...prev, userId]);
      
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(id => id !== userId));
      }, 2000);
    }
  };
  
  const sendMessage = () => {
    if (!inputValue.trim() || !currentUser) return;
    
    const { formattedText, mentions } = formatMessageWithMentions(inputValue);
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      text: inputValue,
      timestamp: new Date().toISOString(),
      mentions: mentions
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    
    const lastSeenKey = `lastSeen_${groupId}_${currentUser.id}`;
    localStorage.setItem(lastSeenKey, newMessage.timestamp);
    
    // Handle mentions
    mentions.forEach(mentionedName => {
      const mentionedUser = users.find(u => u.name === mentionedName);
      if (mentionedUser && mentionedUser.id !== currentUser.id) {
        mentionUser(
          mentionedUser.id, 
          groupId, 
          `@${mentionedUser.name} wurde im Chat erwähnt`,
          "chat"
        );
      }
    });
    
    // Notify all users except the sender
    users.forEach(user => {
      if (user.id !== currentUser.id) {
        addNotification({
          title: `Neue Nachricht im Kanal`,
          message: `${currentUser.name}: ${inputValue.substring(0, 40)}${inputValue.length > 40 ? "..." : ""}`,
          targetUserId: user.id,
          type: "chat",
          caseId: groupId
        });
      }
    });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      if (currentUser) {
        simulateUserTyping(currentUser.id);
      }
    }
  };

  return {
    inputValue, 
    setInputValue,
    typingUsers,
    formatMessageWithMentions,
    sendMessage,
    handleKeyDown
  };
};
