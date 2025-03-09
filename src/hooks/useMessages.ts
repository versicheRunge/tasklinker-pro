
import { useState, useEffect } from 'react';
import { Message } from '../types/chat';
import { useUser } from '../contexts/UserContext';
import { toast } from './use-toast';

interface UseMessagesProps {
  groupId?: string;
}

export const useMessages = ({ groupId = 'global' }: UseMessagesProps = {}) => {
  const { currentUser } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSeenTimestamp, setLastSeenTimestamp] = useState<string>('');
  const [unreadMessages, setUnreadMessages] = useState<number>(0);

  // Nachrichten laden
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
  
  // Ungelesene Nachrichten aktualisieren
  useEffect(() => {
    if (!isLoading && currentUser && messages.length > 0) {
      const lastMessageTimestamp = messages[messages.length - 1].timestamp;
      const lastSeenKey = `lastSeen_${groupId}_${currentUser.id}`;
      
      localStorage.setItem(lastSeenKey, lastMessageTimestamp);
      setLastSeenTimestamp(lastMessageTimestamp);
      setUnreadMessages(0);
    }
  }, [messages, isLoading, currentUser, groupId]);
  
  // Nachrichten speichern
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const storageKey = `chatMessages_${groupId}`;
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, isLoading, groupId]);

  const editMessage = (messageId: string, newText: string) => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        return {
          ...msg,
          text: newText,
          isEdited: true
        };
      }
      return msg;
    });
    
    setMessages(updatedMessages);
    toast({
      title: "Nachricht bearbeitet",
      description: "Ihre Nachricht wurde erfolgreich bearbeitet."
    });
  };
  
  const deleteMessage = (messageId: string) => {
    const updatedMessages = messages.filter(msg => msg.id !== messageId);
    setMessages(updatedMessages);
    
    toast({
      title: "Nachricht gelöscht",
      description: "Ihre Nachricht wurde erfolgreich gelöscht."
    });
  };

  return {
    messages,
    setMessages,
    isLoading,
    unreadMessages,
    editMessage,
    deleteMessage
  };
};
