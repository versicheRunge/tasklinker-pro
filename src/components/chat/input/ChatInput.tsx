
import React from 'react';
import { Button } from '../../ui/button';
import { Send } from 'lucide-react';
import { MentionInput } from '../../common/MentionInput';
import { User } from '../../../types/chat';
import { useUser } from '../../../contexts/UserContext';
import { EmojiPicker } from './EmojiPicker';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  currentUser: User | null;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  sendMessage: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  setInputValue,
  currentUser,
  handleKeyDown,
  sendMessage
}) => {
  const { users } = useUser();

  const handleMention = (userId: string, text: string) => {
    console.log('Benutzer erwähnt:', userId, text);
  };

  const addEmoji = (emoji: string) => {
    setInputValue(inputValue + emoji);
  };

  return (
    <div className="p-4 border-t mt-auto">
      <div className="flex flex-col">
        <div className="rounded-xl border bg-background overflow-hidden">
          <MentionInput
            value={inputValue}
            onChange={setInputValue}
            onMention={handleMention}
            placeholder="Schreiben Sie eine Nachricht... (@Benutzer für Erwähnung)"
            multiline={true}
            className="min-h-[80px] max-h-[120px] bg-background border-none focus:ring-0 py-3"
            onKeyDown={handleKeyDown}
            users={users}
          />
          
          <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-t">
            <div className="flex items-center gap-1">
              <EmojiPicker onEmojiSelect={addEmoji} />
            </div>
            <Button 
              onClick={sendMessage} 
              variant="default" 
              size="sm" 
              className="rounded-full px-4"
              disabled={!inputValue.trim() || !currentUser}
            >
              <Send className="h-4 w-4 mr-1" />
              Senden
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
