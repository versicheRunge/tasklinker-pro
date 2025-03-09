
import React from 'react';
import { User, MessageSquare } from 'lucide-react';
import { cn } from '../../../lib/utils';
import { Skeleton } from '../../ui/skeleton';

interface ChatHeaderProps {
  isLoading: boolean;
  userCount: number;
  unreadMessages: number;
  recipientName?: string;
  isDirect?: boolean;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  isLoading, 
  userCount, 
  unreadMessages,
  recipientName,
  isDirect = false 
}) => {
  return (
    <div className="px-4 py-3 border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-8 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 mb-1" />
              <Skeleton className="h-3 w-24" />
            </div>
          </>
        ) : (
          <>
            <div className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center",
              "bg-primary/10 text-primary"
            )}>
              {isDirect ? <User className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
            </div>
            <div>
              <h3 className="font-medium">
                {isDirect ? `Chat mit ${recipientName}` : "Teamchat"}
              </h3>
              <p className="text-xs text-muted-foreground">
                {isDirect ? 
                  "Direktnachrichten" : 
                  `${userCount} Teilnehmer ${unreadMessages > 0 ? `• ${unreadMessages} ungelesene Nachrichten` : ''}`
                }
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
