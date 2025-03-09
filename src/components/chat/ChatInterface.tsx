
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { MentionInput } from '../common/MentionInput';
import { useUser } from '../../contexts/UserContext';
import { User } from '../../types/case';
import { CustomAvatar } from '../ui/CustomAvatar';
import { Send, RefreshCw } from 'lucide-react';
import { toast } from "../../hooks/use-toast";

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  timestamp: string;
  isRead: boolean;
}

export const ChatInterface: React.FC = () => {
  const { currentUser, users } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | 'all'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load messages from localStorage on component mount
  useEffect(() => {
    if (!currentUser) return;
    
    const storedMessages = localStorage.getItem('chatMessages');
    if (storedMessages) {
      try {
        const parsedMessages = JSON.parse(storedMessages);
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error parsing stored messages:', error);
      }
    }
  }, [currentUser]);
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(messages));
    }
  }, [messages]);
  
  // Auto-scroll to newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Mark messages as read when they're viewed
  useEffect(() => {
    if (!currentUser) return;
    
    const unreadMessages = messages.filter(msg => 
      !msg.isRead && 
      msg.senderId !== currentUser.id && 
      (selectedUser === 'all' || msg.senderId === selectedUser || 
        (selectedUser !== 'all' && getDirectMessageParticipants(msg).includes(selectedUser)))
    );
    
    if (unreadMessages.length > 0) {
      const updatedMessages = messages.map(msg => 
        unreadMessages.some(unread => unread.id === msg.id) 
          ? { ...msg, isRead: true } 
          : msg
      );
      setMessages(updatedMessages);
    }
  }, [messages, selectedUser, currentUser]);
  
  const handleSendMessage = () => {
    if (!currentUser || !newMessage.trim()) return;
    
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      senderId: currentUser.id,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    
    // Notify mentioned users
    const mentionedUsers = extractMentions(newMessage);
    mentionedUsers.forEach(userId => {
      const { addNotification } = useUser();
      const mentionedUser = users.find(u => u.id === userId);
      if (mentionedUser) {
        addNotification({
          title: "Erwähnung im Chat",
          message: `${currentUser.name} hat Sie im Chat erwähnt: "${newMessage.substring(0, 50)}${newMessage.length > 50 ? '...' : ''}"`,
          targetUserId: userId
        });
      }
    });
    
    toast({
      title: "Nachricht gesendet",
      description: selectedUser === 'all' ? "Nachricht an alle gesendet" : "Nachricht gesendet"
    });
  };
  
  const extractMentions = (text: string): string[] => {
    const mentions: string[] = [];
    const mentionRegex = /@([a-zA-Z\s]+)/g;
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const mentionedName = match[1].trim();
      const mentionedUser = users.find(u => u.name === mentionedName);
      if (mentionedUser) {
        mentions.push(mentionedUser.id);
      }
    }
    
    return mentions;
  };
  
  const getDirectMessageParticipants = (message: ChatMessage): string[] => {
    // For simplicity, we'll just return the sender ID, but in a more complex implementation
    // you'd extract the actual participants from the message or conversation metadata
    return [message.senderId];
  };
  
  const getFilteredMessages = () => {
    if (!currentUser) return [];
    
    if (selectedUser === 'all') {
      // Show all messages
      return messages;
    } else {
      // Show direct messages between current user and selected user
      return messages.filter(msg => 
        (msg.senderId === currentUser.id && getDirectMessageParticipants(msg).includes(selectedUser)) ||
        (msg.senderId === selectedUser && getDirectMessageParticipants(msg).includes(currentUser.id))
      );
    }
  };
  
  const getMessageSender = (senderId: string): User | undefined => {
    return users.find(user => user.id === senderId);
  };
  
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  const filteredMessages = getFilteredMessages();
  
  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold">Team-Chat</h2>
        <div className="flex gap-2">
          <Button 
            variant={selectedUser === 'all' ? "default" : "outline"} 
            onClick={() => setSelectedUser('all')}
          >
            Alle
          </Button>
          {users.filter(user => user.id !== currentUser?.id).map(user => (
            <Button
              key={user.id}
              variant={selectedUser === user.id ? "default" : "outline"}
              onClick={() => setSelectedUser(user.id)}
              className="flex items-center gap-2"
            >
              <CustomAvatar name={user.name} imageSrc={user.avatar} size="xs" />
              <span className="hidden md:inline">{user.name}</span>
            </Button>
          ))}
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => {
              toast({
                title: "Chat aktualisiert",
                description: "Alle Nachrichten wurden neu geladen."
              });
            }}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Keine Nachrichten vorhanden. Starten Sie eine Konversation!</p>
          </div>
        ) : (
          filteredMessages.map(msg => {
            const sender = getMessageSender(msg.senderId);
            const isCurrentUser = msg.senderId === currentUser?.id;
            
            return (
              <div 
                key={msg.id} 
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-2 max-w-[75%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className="flex-shrink-0">
                    <CustomAvatar 
                      name={sender?.name || 'Unbekannt'} 
                      imageSrc={sender?.avatar} 
                      size="sm" 
                    />
                  </div>
                  <div 
                    className={`rounded-lg p-3 ${
                      isCurrentUser 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted border border-border'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">{sender?.name || 'Unbekannt'}</span>
                      <span className="text-xs opacity-70">{formatTimestamp(msg.timestamp)}</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <div className="flex-1">
            <MentionInput
              value={newMessage}
              onChange={setNewMessage}
              placeholder="Schreiben Sie eine Nachricht..."
              multiline={true}
              className="bg-muted"
            />
          </div>
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <Send className="h-4 w-4 mr-2" />
            Senden
          </Button>
        </div>
      </div>
    </div>
  );
};
