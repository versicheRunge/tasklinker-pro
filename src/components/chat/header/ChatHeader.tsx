
import React from 'react';
import { Skeleton } from '../../ui/skeleton';

interface ChatHeaderProps {
  isLoading: boolean;
  userCount: number;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ isLoading, userCount }) => {
  return (
    <div className="p-4 border-b">
      <h2 className="font-medium text-lg">Team-Chat</h2>
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
