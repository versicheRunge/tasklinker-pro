
import { useState, useEffect } from 'react';
import { Message, User } from '../types/chat';
import { useUser } from '../contexts/UserContext';

interface UseChatProps {
  groupId?: string;
}

export const useChat = ({ groupId = 'global' }: UseChatProps = {}) => {
  const { users, currentUser, mentionUser } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  useEffect(() => {
    const loadMessages = () => {
      try {
        const storageKey = `chatMessages_${groupId}`;
        const storedMessages = localStorage.getItem(storageKey);
        
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
        
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Fehler beim Laden der Nachrichten:', error);
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, [groupId]);
  
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const storageKey = `chatMessages_${groupId}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, isLoading, groupId]);

  const simulateUserTyping = (userId: string) => {
    if (!typingUsers.includes(userId)) {
      setTypingUsers(prev => [...prev, userId]);
      
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(id => id !== userId));
      }, 2000);
    }
  };

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
    
    mentions.forEach(mentionedName => {
      const mentionedUser = users.find(u => u.name === mentionedName);
      if (mentionedUser && mentionedUser.id !== currentUser.id) {
        mentionUser(mentionedUser.id, "", `@${mentionedUser.name} wurde im Team-Chat erwähnt`);
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
  
  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const addFileMessage = (fileName: string, fileType: 'image' | 'file', fileUrl: string) => {
    if (!currentUser) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      text: `Hat eine Datei geteilt: ${fileName}`,
      timestamp: new Date().toISOString(),
      mentions: [],
      attachments: [{
        type: fileType,
        url: fileUrl,
        name: fileName
      }]
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    typingUsers,
    formatMessageWithMentions,
    sendMessage,
    handleKeyDown,
    getUserById,
    addFileMessage
  };
};
