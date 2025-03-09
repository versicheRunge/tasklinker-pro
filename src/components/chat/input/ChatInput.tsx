
import React, { useRef } from 'react';
import { Button } from '../../ui/button';
import { Send, Smile, Paperclip, Image } from 'lucide-react';
import { MentionInput } from '../../common/MentionInput';
import { toast } from '../../../hooks/use-toast';
import { User } from '../../../types/chat';

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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !currentUser) return;
    
    toast({
      title: "Datei ausgewählt",
      description: `${files[0].name} wird hochgeladen...`
    });
    
    // Simulate file upload
    setTimeout(() => {
      const fileType = files[0].type.startsWith('image/') ? 'image' : 'file';
      const fakeUrl = `${fileType === 'image' ? '/placeholder.svg' : '#'}`;
      
      // This part will now be handled by the parent component through props
      const newMessage = {
        id: `msg-${Date.now()}`,
        userId: currentUser.id,
        text: `Hat eine Datei geteilt: ${files[0].name}`,
        timestamp: new Date().toISOString(),
        mentions: [],
        attachments: [{
          type: fileType,
          url: fakeUrl,
          name: files[0].name
        }]
      };
      
      // Parent will handle this via props
      // setMessages(prev => [...prev, newMessage]);
      
      toast({
        title: "Datei hochgeladen",
        description: `${files[0].name} wurde erfolgreich hochgeladen.`
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 1500);
  };

  return (
    <div className="p-4 border-t mt-auto">
      <div className="flex flex-col">
        <div className="rounded-xl border bg-background overflow-hidden">
          <MentionInput
            value={inputValue}
            onChange={setInputValue}
            onMention={(userId, text) => console.log('Mentioned user:', userId, text)}
            placeholder="Schreiben Sie eine Nachricht... (@Benutzer für Erwähnung)"
            multiline={true}
            className="min-h-[80px] max-h-[120px] bg-background border-none focus:ring-0 py-3"
          />
          
          <div className="flex items-center justify-between px-3 py-2 bg-muted/20 border-t">
            <div className="flex items-center gap-1">
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 rounded-full p-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 rounded-full p-0"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 rounded-full p-0"
              >
                <Smile className="h-4 w-4" />
              </Button>
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
