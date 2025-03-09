
import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Send, Smile } from 'lucide-react';
import { MentionInput } from '../../common/MentionInput';
import { User } from '../../../types/chat';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { useUser } from '../../../contexts/UserContext';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  currentUser: User | null;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  sendMessage: () => void;
}

// Eine Auswahl häufiger und lustiger Emojis mit deutschen Kategorienamen
const emojiGroups = [
  {
    category: "Gesichter",
    emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", "😍", "🥰", "😘"]
  },
  {
    category: "Gesten",
    emojis: ["👍", "👎", "👌", "✌️", "🤞", "🤝", "🙏", "🤲", "👐", "🙌", "👏", "👋", "🤚", "🖐️", "✋", "👆"]
  },
  {
    category: "Arbeit",
    emojis: ["💼", "📁", "📂", "📊", "📈", "📉", "📝", "📑", "🗒️", "🗓️", "📆", "📅", "📇", "🗃️", "🗄️", "📌"]
  },
  {
    category: "Objekte",
    emojis: ["💡", "🔍", "📱", "💻", "⌨️", "🖥️", "🖨️", "🗂️", "📔", "📕", "📖", "📗", "📘", "📙", "📚", "📋"]
  },
  {
    category: "Spaß",
    emojis: ["🎉", "🎊", "🎈", "🎂", "🍕", "🍔", "🍟", "🍩", "🍦", "🍭", "🍫", "🍿", "🎮", "🎯", "🎲", "🎭"]
  }
];

export const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  setInputValue,
  currentUser,
  handleKeyDown,
  sendMessage
}) => {
  const { users } = useUser();
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);

  const addEmoji = (emoji: string) => {
    setInputValue(inputValue + emoji);
  };

  const handleMention = (userId: string, text: string) => {
    console.log('Benutzer erwähnt:', userId, text);
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
              <Popover open={isEmojiPickerOpen} onOpenChange={setIsEmojiPickerOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 rounded-full p-0"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <div className="p-2 border-b">
                    <h3 className="font-medium text-sm">Emojis</h3>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2">
                    {emojiGroups.map((group) => (
                      <div key={group.category} className="mb-3">
                        <h4 className="text-xs font-medium text-muted-foreground mb-1">{group.category}</h4>
                        <div className="grid grid-cols-8 gap-1">
                          {group.emojis.map((emoji) => (
                            <button
                              key={emoji}
                              className="h-8 w-8 flex items-center justify-center rounded hover:bg-accent text-lg"
                              onClick={() => {
                                addEmoji(emoji);
                                setIsEmojiPickerOpen(false);
                              }}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
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
