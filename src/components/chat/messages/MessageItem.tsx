
import React, { useState } from 'react';
import { Message, User } from '../../../types/chat';
import { MessageAvatar, MessageHeader } from './MessageHeader';
import { MessageContent } from './MessageContent';
import { MessageActions } from './MessageActions';
import { DateSeparator } from './DateSeparator';

interface MessageItemProps {
  message: Message;
  index: number;
  allMessages: Message[];
  isCurrentUser: boolean;
  sender: User | undefined;
  formatMessageWithMentions: (text: string) => { formattedText: string; mentions: string[] };
  onEditMessage?: (messageId: string, newText: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  index,
  allMessages,
  isCurrentUser,
  sender,
  formatMessageWithMentions,
  onEditMessage,
  onDeleteMessage
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  
  const isConsecutive = index > 0 && allMessages[index - 1].userId === message.userId;
  const showDateHeader = index === 0 || 
    new Date(message.timestamp).toDateString() !== new Date(allMessages[index - 1].timestamp).toDateString();

  const handleSaveEdit = () => {
    if (onEditMessage && editText.trim()) {
      onEditMessage(message.id, editText);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(message.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <>
      {showDateHeader && <DateSeparator date={message.timestamp} />}
      
      <div 
        className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
      >
        <div className={`flex items-start gap-3 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
          {(!isConsecutive || showDateHeader) && <MessageAvatar sender={sender} />}
          
          <div className={`space-y-1 ${isConsecutive && !showDateHeader ? (isCurrentUser ? 'mr-10' : 'ml-10') : ''}`}>
            {(!isConsecutive || showDateHeader) && (
              <MessageHeader 
                sender={sender} 
                timestamp={message.timestamp} 
                isEdited={message.isEdited}
                isCurrentUser={isCurrentUser}
              />
            )}
            
            <MessageContent 
              text={message.text}
              isCurrentUser={isCurrentUser}
              formatMessageWithMentions={formatMessageWithMentions}
              isEditing={isEditing}
              editText={editText}
              setEditText={setEditText}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              handleKeyDown={handleKeyDown}
            />
            
            {isCurrentUser && !isEditing && (
              <MessageActions 
                onEdit={() => setIsEditing(true)}
                onDelete={() => onDeleteMessage && onDeleteMessage(message.id)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
