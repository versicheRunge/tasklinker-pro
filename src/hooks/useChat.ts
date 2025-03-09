
import { useState, useEffect } from 'react';
import { Message, User, ChatChannel } from '../types/chat';
import { useUser } from '../contexts/UserContext';
import { toast } from '../hooks/use-toast';

interface UseChatProps {
  groupId?: string;
}

export const useChat = ({ groupId = 'global' }: UseChatProps = {}) => {
  const { users, currentUser, mentionUser, addNotification } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<string>('');
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  // Check if this is a direct message by checking the groupId format
  const isDirect = groupId.startsWith('dm-');
  // Extract the recipient ID if it's a direct message
  const recipientId = isDirect ? groupId.replace('dm-', '') : undefined;

  useEffect(() => {
    const loadMessages = () => {
      try {
        const storageKey = `chatMessages_${groupId}`;
        const storedMessages = localStorage.getItem(storageKey);
        
        const lastSeenKey = `lastSeen_${groupId}_${currentUser?.id}`;
        const storedLastSeen = localStorage.getItem(lastSeenKey);
        
        if (storedLastSeen) {
          setLastSeenTimestamp(storedLastSeen);
        }
        
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages);
          setMessages(parsedMessages);
          
          if (storedLastSeen && currentUser) {
            const unread = parsedMessages.filter(
              (msg: Message) => 
                msg.timestamp > storedLastSeen && 
                msg.userId !== currentUser.id
            ).length;
            setUnreadMessages(unread);
          }
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
  }, [groupId, currentUser]);
  
  useEffect(() => {
    if (!isLoading && currentUser && messages.length > 0) {
      const lastMessageTimestamp = messages[messages.length - 1].timestamp;
      const lastSeenKey = `lastSeen_${groupId}_${currentUser.id}`;
      
      localStorage.setItem(lastSeenKey, lastMessageTimestamp);
      setLastSeenTimestamp(lastMessageTimestamp);
      setUnreadMessages(0);
    }
  }, [messages, isLoading, currentUser, groupId]);
  
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
    
    const lastSeenKey = `lastSeen_${groupId}_${currentUser.id}`;
    localStorage.setItem(lastSeenKey, newMessage.timestamp);
    setLastSeenTimestamp(newMessage.timestamp);
    
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
    
    // For direct messages, only notify the recipient
    if (isDirect && recipientId) {
      const recipientUser = users.find(u => u.id === recipientId);
      if (recipientUser && recipientUser.id !== currentUser.id) {
        // Create a notification for the direct message
        addNotification({
          title: `Neue Nachricht von ${currentUser.name}`,
          message: inputValue.substring(0, 50) + (inputValue.length > 50 ? "..." : ""),
          targetUserId: recipientUser.id,
          type: "chat",
          caseId: groupId
        });
        
        // Show a toast to confirm the message was sent
        toast({
          title: "Nachricht gesendet",
          description: `Direktnachricht an ${recipientUser.name} gesendet`
        });
      }
    } 
    // For channel messages, notify all users except the sender
    else {
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
    }
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

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    typingUsers,
    unreadMessages,
    formatMessageWithMentions,
    sendMessage,
    handleKeyDown,
    getUserById
  };
};
