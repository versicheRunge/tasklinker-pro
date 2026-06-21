
import React, { useRef, useEffect } from 'react';
import { MessageItem } from './MessageItem';
import { Message, User } from '../../../types/chat';
import { Skeleton } from '../../ui/skeleton';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  users: User[];
  currentUser: User | null | undefined;
  isAdmin?: boolean;
  formatMessageWithMentions: (text: string) => { formattedText: string; mentions: string[] };
  typingUsers: string[];
  getUserById: (userId: string) => User | undefined;
  onEditMessage?: (messageId: string, newText: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  users,
  currentUser,
  isAdmin,
  formatMessageWithMentions,
  typingUsers,
  getUserById,
  onEditMessage,
  onDeleteMessage
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-20 w-[300px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Noch keine Nachrichten. Starten Sie die Unterhaltung!</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {messages.map((message, index) => {
        const sender = getUserById(message.userId);
        const isCurrentUser = currentUser?.id === message.userId;

        const canDelete = isCurrentUser || isAdmin;

        return (
          <MessageItem
            key={message.id}
            message={message}
            index={index}
            allMessages={messages}
            isCurrentUser={isCurrentUser}
            isAdmin={isAdmin}
            sender={sender}
            formatMessageWithMentions={formatMessageWithMentions}
            onEditMessage={isCurrentUser ? onEditMessage : undefined}
            onDeleteMessage={canDelete ? onDeleteMessage : undefined}
          />
        );
      })}
      
      {typingUsers.length > 0 && (
        <div className="pl-12 text-sm text-muted-foreground italic">
          {typingUsers.map(userId => {
            const typingUser = getUserById(userId);
            return typingUser?.name || 'Jemand';
          }).join(', ')} 
          {typingUsers.length === 1 ? ' tippt...' : ' tippen...'}
        </div>
      )}
      
      {/* Invisible div to scroll to */}
      <div ref={messagesEndRef} />
    </div>
  );
};
