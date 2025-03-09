
import React, { useState } from 'react';
import { Avatar } from '../../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Message, User } from '../../../types/chat';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '../../ui/button';

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
                {message.isEdited && (
                  <span className="text-muted-foreground italic">(bearbeitet)</span>
                )}
              </div>
            )}
            
            <div 
              className={`rounded-lg p-3 ${
                isCurrentUser 
                  ? 'bg-primary text-primary-foreground rounded-tr-none' 
                  : 'bg-muted rounded-tl-none'
              }`}
            >
              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-background text-foreground p-2 rounded border border-input text-sm min-h-[80px] focus:outline-none focus:ring-1"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <Button 
                      onClick={handleCancelEdit} 
                      size="sm" 
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                    >
                      <X className="h-3.5 w-3.5 mr-1" /> Abbrechen
                    </Button>
                    <Button 
                      onClick={handleSaveEdit} 
                      size="sm"
                      className="h-7 px-2 text-xs"
                    >
                      <Check className="h-3.5 w-3.5 mr-1" /> Speichern
                    </Button>
                  </div>
                </div>
              ) : (
                <div 
                  className="whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMessageWithMentions(message.text).formattedText 
                  }}
                />
              )}
            </div>
            
            {isCurrentUser && !isEditing && (
              <div className={`flex gap-1 mt-1 justify-end ${isCurrentUser ? 'ml-auto' : ''}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3 w-3 text-muted-foreground" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onDeleteMessage && onDeleteMessage(message.id)}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
