
import React from 'react';
import { Skeleton } from '../../ui/skeleton';
import { Badge } from '../../ui/badge';

interface ChatHeaderProps {
  isLoading: boolean;
  userCount: number;
  unreadMessages?: number;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ isLoading, userCount, unreadMessages = 0 }) => {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-lg">Team-Vorgang</h2>
        {unreadMessages > 0 && (
          <Badge variant="destructive" className="animate-pulse">
            {unreadMessages} neue Nachrichten
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {isLoading ? (
          <Skeleton className="h-4 w-1/2" />
        ) : (
          `${userCount} Mitglieder - Kommunizieren Sie mit Ihrem Team in Echtzeit`
        )}
      </p>
    </div>
  );
};
