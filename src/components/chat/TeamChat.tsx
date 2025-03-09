
import React, { useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useUser } from '../../contexts/UserContext';
import { ChatHeader } from './header/ChatHeader';
import { MessageList } from './messages/MessageList';
import { ChatInput } from './input/ChatInput';
import { toast } from '../../hooks/use-toast';

interface TeamChatProps {
  groupId?: string; // Für zukünftige Erweiterungen mit Chat-Gruppen
}

export const TeamChat: React.FC<TeamChatProps> = ({ groupId = 'global' }) => {
  const { users, currentUser, notifications, markNotificationsAsRead } = useUser();
  const {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    typingUsers,
    formatMessageWithMentions,
    sendMessage,
    handleKeyDown,
    getUserById,
    unreadMessages
  } = useChat({ groupId });
  
  // Mark chat notifications as read when viewing the chat
  useEffect(() => {
    if (!isLoading) {
      const chatNotificationIds = notifications
        .filter(notification => notification.type === 'chat' && !notification.read)
        .map(notification => notification.id);
        
      if (chatNotificationIds.length > 0) {
        markNotificationsAsRead(chatNotificationIds);
        
        // Show toast for new messages
        if (unreadMessages > 0) {
          toast({
            title: "Neue Nachrichten",
            description: `Sie haben ${unreadMessages} neue Nachrichten.`,
            variant: "default"
          });
        }
      }
    }
  }, [isLoading, notifications, markNotificationsAsRead, unreadMessages]);
  
  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        isLoading={isLoading} 
        userCount={users.length} 
        unreadMessages={unreadMessages}
      />
      
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList 
          messages={messages}
          isLoading={isLoading}
          users={users}
          currentUser={currentUser}
          formatMessageWithMentions={formatMessageWithMentions}
          typingUsers={typingUsers}
          getUserById={getUserById}
        />
      </div>
      
      <ChatInput
        inputValue={inputValue}
        setInputValue={setInputValue}
        currentUser={currentUser}
        handleKeyDown={handleKeyDown}
        sendMessage={sendMessage}
      />
    </div>
  );
};
