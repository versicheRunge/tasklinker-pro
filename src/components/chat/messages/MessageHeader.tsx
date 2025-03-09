
import React from 'react';
import { Avatar } from '../../ui/avatar';
import { User } from '../../../types/chat';

interface MessageHeaderProps {
  sender: User | undefined;
  timestamp: string;
  isEdited?: boolean;
  isCurrentUser: boolean;
}

export const MessageHeader: React.FC<MessageHeaderProps> = ({
  sender,
  timestamp,
  isEdited,
  isCurrentUser
}) => {
  return (
    <div className={`flex items-center gap-2 text-xs ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
      <span className="font-medium">{sender?.name || "Unbekannter Benutzer"}</span>
      <span className="text-muted-foreground">
        {new Date(timestamp).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
      </span>
      {isEdited && (
        <span className="text-muted-foreground italic">(bearbeitet)</span>
      )}
    </div>
  );
};

export const MessageAvatar: React.FC<{ sender: User | undefined }> = ({ sender }) => {
  return (
    <Avatar className="h-8 w-8">
      {sender?.avatar ? (
        <img src={sender.avatar} alt={sender?.name || "Benutzer"} />
      ) : (
        <div className="bg-primary/10 h-full w-full flex items-center justify-center text-primary font-medium">
          {sender?.name?.charAt(0) || "?"}
        </div>
      )}
    </Avatar>
  );
};
