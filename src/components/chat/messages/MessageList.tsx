
import React, { useRef, useEffect } from 'react';
import { Skeleton } from '../../ui/skeleton';
import { Message, User } from '../../../types/chat';
import { MessageItem } from './MessageItem';
import { Paperclip } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  users: User[];
  currentUser: User | null;
  formatMessageWithMentions: (text: string) => { formattedText: string; mentions: string[] };
  typingUsers: string[];
  getUserById: (userId: string) => User | undefined;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  users,
  currentUser,
  formatMessageWithMentions,
  typingUsers,
  getUserById
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 mb-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-16 w-64" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Noch keine Nachrichten. Starte die Unterhaltung!</p>
      </div>
    );
  }

  return (
    <>
      {messages.map((message, index, allMessages) => {
        const sender = getUserById(message.userId);
        const isCurrentUser = message.userId === currentUser?.id;
        
        return (
          <MessageItem
            key={message.id}
            message={message}
            index={index}
            allMessages={allMessages}
            isCurrentUser={isCurrentUser}
            sender={sender}
            formatMessageWithMentions={formatMessageWithMentions}
          />
        );
      })}
      
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
    </>
  );
};
