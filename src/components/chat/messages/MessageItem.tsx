
import React from 'react';
import { Avatar } from '../../ui/avatar';
import { Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { Message, User } from '../../../types/chat';

interface MessageItemProps {
  message: Message;
  index: number;
  allMessages: Message[];
  isCurrentUser: boolean;
  sender: User | undefined;
  formatMessageWithMentions: (text: string) => { formattedText: string; mentions: string[] };
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  index,
  allMessages,
  isCurrentUser,
  sender,
  formatMessageWithMentions
}) => {
  const isConsecutive = index > 0 && allMessages[index - 1].userId === message.userId;
  const showDateHeader = index === 0 || 
    new Date(message.timestamp).toDateString() !== new Date(allMessages[index - 1].timestamp).toDateString();

  return (
    <React.Fragment>
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
