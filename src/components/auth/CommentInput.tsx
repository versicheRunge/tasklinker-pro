
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

interface CommentInputProps {
  onSubmit: (comment: string, mentions: string[]) => void;
  placeholder?: string;
}

export const CommentInput: React.FC<CommentInputProps> = ({ 
  onSubmit, 
  placeholder = "Kommentar hinzufügen..." 
}) => {
  const { users } = useUser();
  const [comment, setComment] = useState('');
  const [mentions, setMentions] = useState<string[]>([]);
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setComment(value);
    
    const cursorPos = e.target.selectionStart || 0;
    setCursorPosition(cursorPos);
    
    // Check if we're in a mention context
    const textBeforeCursor = value.substring(0, cursorPos);
    const atSignIndex = textBeforeCursor.lastIndexOf('@');
    
    if (atSignIndex !== -1 && (atSignIndex === 0 || /\s/.test(textBeforeCursor[atSignIndex - 1]))) {
      // Extract the potential mention query
      const query = textBeforeCursor.substring(atSignIndex + 1);
      
      // If there's a space after the query, it's not a mention anymore
      if (query.includes(' ')) {
        setShowMentionSuggestions(false);
      } else {
        setMentionQuery(query.toLowerCase());
        setShowMentionSuggestions(true);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(mentionQuery)
  ).slice(0, 5); // Limit to 5 suggestions
  
  const insertMention = (user: { id: string, name: string }) => {
    if (!inputRef.current) return;
    
    const textBeforeCursor = comment.substring(0, cursorPosition);
    const textAfterCursor = comment.substring(cursorPosition);
    
    const atSignIndex = textBeforeCursor.lastIndexOf('@');
    
    // Create the new text with the mention
    const newText = textBeforeCursor.substring(0, atSignIndex) + 
                  `@${user.name} ` + 
                  textAfterCursor;
    
    setComment(newText);
    setShowMentionSuggestions(false);
    
    // Add this user to the mentions array if not already included
    if (!mentions.includes(user.id)) {
      setMentions([...mentions, user.id]);
    }
    
    // Set focus back to the input
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        const newCursorPos = atSignIndex + user.name.length + 2; // +2 for @ and space
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  };
  
  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit(comment, mentions);
      setComment('');
      setMentions([]);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    
    // Handle navigation in mentions dropdown
    if (showMentionSuggestions && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Tab') {
        e.preventDefault();
        // We could implement keyboard navigation here
      } else if (e.key === 'Escape') {
        setShowMentionSuggestions(false);
      }
    }
  };
  
  return (
    <div className="relative">
      <div className="flex items-start border border-input rounded-md focus-within:ring-1 focus-within:ring-primary">
        <textarea
          ref={inputRef}
          value={comment}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 p-2 bg-transparent outline-none resize-none min-h-[80px]"
        />
        <button
          onClick={handleSubmit}
          className="p-2 text-primary hover:text-primary/80 transition-colors self-end"
          aria-label="Kommentar senden"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      
      {showMentionSuggestions && filteredUsers.length > 0 && (
        <div className="absolute z-10 mt-1 w-full max-w-[300px] bg-card shadow-md rounded-md border border-border overflow-hidden">
          <ul className="max-h-[200px] overflow-y-auto py-1">
            {filteredUsers.map(user => (
              <li
                key={user.id}
                onClick={() => insertMention(user)}
                className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center gap-2"
              >
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.role}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
