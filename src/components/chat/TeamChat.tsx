
import React, { useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import { useUser } from '../../contexts/UserContext';
import { ChatHeader } from './header/ChatHeader';
import { MessageList } from './messages/MessageList';
import { ChatInput } from './input/ChatInput';
import { toast } from '../../hooks/use-toast';

interface TeamChatProps {
  groupId?: string; // Für Kanäle und Direktnachrichten
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
    if (!isLoading && currentUser && unreadMessages > 0) {
      // Find notifications related to this chat channel/DM
      const chatNotifications = notifications.filter(
        n => n.type === 'chat' && n.caseId === groupId && !n.read
      );
      
      if (chatNotifications.length > 0) {
        // Mark these notifications as read
        markNotificationsAsRead(chatNotifications.map(n => n.id));
        
        // Show toast for unread messages
        toast({
          title: "Neue Nachrichten",
          description: `Sie haben ${unreadMessages} neue Nachrichten in diesem Chat.`,
          variant: "default"
        });
      }
    }
  }, [isLoading, unreadMessages, currentUser, groupId, notifications, markNotificationsAsRead]);
  
  // Determine if this is a direct message
  const isDirect = groupId.startsWith('dm-');
  
  // Extract the recipient ID if it's a direct message
  const recipientId = isDirect ? groupId.replace('dm-', '') : undefined;
  
  // Get the recipient user if it's a direct message
  const recipientUser = recipientId ? getUserById(recipientId) : undefined;
  
  // Custom onMention handler for chat
  const handleMention = (userId: string, text: string) => {
    console.log('Benutzer erwähnt:', userId);
  };
  
  return (
    <div className="flex flex-col h-full">
      <ChatHeader 
        isLoading={isLoading} 
        userCount={isDirect ? 2 : users.length} 
        unreadMessages={unreadMessages}
        recipientName={recipientUser?.name}
        isDirect={isDirect}
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
