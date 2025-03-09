
import React, { useState, useEffect, useRef } from 'react';
import { User, Send } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { MentionInput } from '../common/MentionInput';
import { CustomAvatar } from '../ui/CustomAvatar';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

interface Message {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  mentions: string[];
}

export const ChatInterface: React.FC = () => {
  const { users, currentUser, mentionUser } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialisiere den Chat-Verlauf aus dem localStorage
  useEffect(() => {
    const loadMessages = () => {
      try {
        const storedMessages = localStorage.getItem('chatMessages');
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
        
        // Simuliere Ladezeit für bessere UX
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      } catch (error) {
        console.error('Fehler beim Laden der Nachrichten:', error);
        setIsLoading(false);
      }
    };
    
    loadMessages();
  }, []);
  
  // Speichere Nachrichten im localStorage
  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages, isLoading]);
  
  // Scrolle automatisch zum Ende des Chats
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Formatiere Erwähnungen in der Nachricht
  const formatMessageWithMentions = (text: string) => {
    let formattedText = text;
    
    // Suche nach @Username im Text
    const mentionRegex = /@(\w+)/g;
    const mentions = text.match(mentionRegex) || [];
    
    // Ersetze @Username mit formatiertem Username
    users.forEach(user => {
      const userMention = `@${user.name}`;
      if (text.includes(userMention)) {
        formattedText = formattedText.replaceAll(
          userMention,
          `<span class="text-primary font-medium">${userMention}</span>`
        );
      }
    });
    
    return { formattedText, mentions: mentions.map(m => m.substring(1)) };
  };
  
  // Sende eine Nachricht
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
    
    // Benachrichtige erwähnte Benutzer
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
    }
  };
  
  // Finde Benutzer anhand der ID
  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-medium text-lg">Team-Chat</h2>
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            <Skeleton className="h-4 w-1/2" />
          ) : (
            `${users.length} Mitglieder - Keine wichtigen Nachrichten`
          )}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          // Lade-Zustand
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 mb-4">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-16 w-64" />
              </div>
            </div>
          ))
        ) : messages.length > 0 ? (
          // Chat-Nachrichten
          messages.map(message => {
            const sender = getUserById(message.userId);
            const isCurrentUser = message.userId === currentUser?.id;
            
            return (
              <div 
                key={message.id} 
                className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}
              >
                <CustomAvatar 
                  name={sender?.name || "Benutzer"} 
                  imageSrc={sender?.avatar} 
                  size="sm" 
                />
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    isCurrentUser 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-muted rounded-tl-none'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-medium ${isCurrentUser ? 'text-primary-foreground/80' : 'text-foreground/80'}`}>
                      {sender?.name || "Unbekannter Benutzer"}
                    </span>
                    <span className={`text-xs ${isCurrentUser ? 'text-primary-foreground/60' : 'text-foreground/60'}`}>
                      {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true, locale: de })}
                    </span>
                  </div>
                  <div 
                    className="whitespace-pre-wrap break-words"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessageWithMentions(message.text).formattedText 
                    }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          // Keine Nachrichten
          <div className="text-center py-8 text-muted-foreground">
            <p>Noch keine Nachrichten. Starte die Unterhaltung!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <MentionInput
              value={inputValue}
              onChange={setInputValue}
              onMention={(userId, text) => console.log('Mentioned user:', userId, text)}
              placeholder="Schreiben Sie eine Nachricht... (@Benutzer für Erwähnung)"
              multiline={true}
              className="min-h-[80px] max-h-[120px] bg-background focus:ring-primary"
            />
          </div>
          <Button 
            onClick={sendMessage} 
            variant="default" 
            size="icon" 
            className="h-10 w-10"
            disabled={!inputValue.trim() || !currentUser}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
