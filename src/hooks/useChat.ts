
import { useMessages } from './useMessages';
import { useMessageInput } from './useMessageInput';
import { useUser } from '../contexts/UserContext';

interface UseChatProps {
  groupId?: string;
}

export const useChat = ({ groupId = 'global' }: UseChatProps = {}) => {
  const { users } = useUser();
  const { 
    messages, 
    setMessages,
    isLoading,
    unreadMessages,
    editMessage,
    deleteMessage
  } = useMessages({ groupId });

  const {
    inputValue,
    setInputValue,
    typingUsers,
    formatMessageWithMentions,
    sendMessage,
    handleKeyDown
  } = useMessageInput({ groupId, setMessages });

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    typingUsers,
    unreadMessages,
    formatMessageWithMentions,
    sendMessage,
    handleKeyDown,
    editMessage,
    deleteMessage,
    getUserById
  };
};
