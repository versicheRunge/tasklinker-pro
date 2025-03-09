
import React from 'react';
import { Button } from '../../ui/button';
import { Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';

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

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
                      onEmojiSelect(emoji);
                      setIsOpen(false);
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
  );
};
