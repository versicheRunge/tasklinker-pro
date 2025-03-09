import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from '../ui/avatar';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useUser } from '../../contexts/UserContext';
import { Send, Smile, Paperclip, Image } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { MentionInput } from '../common/MentionInput';
import { toast } from '../../hooks/use-toast';

interface Message {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  mentions: string[];
  attachments?: { type: 'image' | 'file', url: string, name: string }[];
}

interface TeamChatProps {
  groupId?: string; // Für zukünftige Erweiterungen mit Chat-Gruppen
}

export const TeamChat: React.FC<TeamChatProps> = ({ groupId = 'global' }) => {
  const { users, currentUser, mentionUser } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const simulateUserTyping = (userId: string) => {
    if (!typingUsers.includes(userId)) {
      setTypingUsers(prev => [...prev, userId]);
      
      setTimeout(() => {
        setTypingUsers(prev => prev.filter(id => id !== userId));
      }, 2000);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !currentUser) return;
    
    toast({
      title: "Datei ausgewählt",
      description: `${files[0].name} wird hochgeladen...`
    });
    
    setTimeout(() => {
      const fileType = files[0].type.startsWith('image/') ? 'image' : 'file';
      const fakeUrl = `${fileType === 'image' ? '/placeholder.svg' : '#'}`;
      
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        userId: currentUser.id,
        text: `Hat eine Datei geteilt: ${files[0].name}`,
        timestamp: new Date().toISOString(),
        mentions: [],
        attachments: [{
          type: fileType,
          url: fakeUrl,
          name: files[0].name
        }]
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      toast({
        title: "Datei hochgeladen",
        description: `${files[0].name} wurde erfolgreich hochgeladen.`
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 1500);
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
  
  const renderMessage = (message: Message, index: number, allMessages: Message[]) => {
    const sender = getUserById(message.userId);
    const isCurrentUser = message.userId === currentUser?.id;
    const isConsecutive = index > 0 && allMessages[index - 1].userId === message.userId;
    
    const showDateHeader = index === 0 || 
      new Date(message.timestamp).toDateString() !== new Date(allMessages[index - 1].timestamp).toDateString();
    
    return (
      <React.Fragment key={message.id}>
        {showDateHeader && (
          <div className="flex justify-center my-4">
            <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
              {new Date(message.timestamp).toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        )}
        
        <div 
          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
        >
          <div className={`flex items-start gap-3 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
            {(!isConsecutive || showDateHeader) && (
              <Avatar className="h-8 w-8">
                {sender?.avatar ? (
                  <img src={sender.avatar} alt={sender?.name || "Benutzer"} />
                ) : (
                  <div className="bg-primary/10 h-full w-full flex items-center justify-center text-primary font-medium">
                    {sender?.name?.charAt(0) || "?"}
                  </div>
                )}
              </Avatar>
            )}
            <div className={`space-y-1 ${isConsecutive && !showDateHeader ? (isCurrentUser ? 'mr-10' : 'ml-10') : ''}`}>
              {(!isConsecutive || showDateHeader) && (
                <div className={`flex items-center gap-2 text-xs ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                  <span className="font-medium">{sender?.name || "Unbekannter Benutzer"}</span>
                  <span className="text-muted-foreground">
                    {new Date(message.timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              
              <div 
                className={`rounded-lg p-3 ${
                  isCurrentUser 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-muted rounded-tl-none'
                }`}
              >
                <div 
                  className="whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMessageWithMentions(message.text).formattedText 
                  }}
                />
                
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2">
                    {message.attachments.map((attachment, i) => (
                      attachment.type === 'image' ? (
                        <div key={i} className="mt-2 rounded-md overflow-hidden">
                          <img 
                            src={attachment.url} 
                            alt={attachment.name} 
                            className="max-w-full max-h-[200px] object-contain"
                          />
                        </div>
                      ) : (
                        <div key={i} className="mt-2 flex items-center gap-2 p-2 bg-background/80 rounded-md">
                          <Paperclip className="h-4 w-4" />
                          <span className="text-sm truncate max-w-[200px]">{attachment.name}</span>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="font-medium text-lg">Team-Chat</h2>
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            <Skeleton className="h-4 w-1/2" />
          ) : (
            `${users.length} Mitglieder - Kommunizieren Sie mit Ihrem Team in Echtzeit`
          )}
        </p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
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
          messages.map((message, index, allMessages) => renderMessage(message, index, allMessages))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Noch keine Nachrichten. Starte die Unterhaltung!</p>
          </div>
        )}
        
        {typingUsers.length > 0 && typingUsers[0] !== currentUser?.id && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-100"></div>
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-200"></div>
            </div>
            <span>
              {getUserById(typingUsers[0])?.name || "Jemand"} schreibt...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t mt-auto">
        <div className="flex flex-col">
          <div className="rounded-xl border bg-background overflow-hidden">
            <MentionInput
              value={inputValue}
              onChange={setInputValue}
              onMention={(userId, text) => console.log('Mentioned user:', userId, text)}
              placeholder="Schreiben Sie eine Nachricht... (@Benutzer für Erwähnung)"
              multiline={true}
              className="min-h-[80px] max-h-[120px] bg-background border-none focus:ring-0 py-3"
            />
            
            <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-t">
              <div className="flex items-center gap-1">
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 rounded-full p-0"
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                onClick={sendMessage} 
                variant="default" 
                size="sm" 
                className="rounded-full px-4"
                disabled={!inputValue.trim() || !currentUser}
              >
                <Send className="h-4 w-4 mr-1" />
                Senden
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
