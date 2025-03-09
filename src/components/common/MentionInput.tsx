
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types/case';
import { useUser } from '../../contexts/UserContext';
import { CustomAvatar } from '../ui/CustomAvatar';

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onMention?: (userId: string, text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  maxLength?: number;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  onMention,
  placeholder = 'Schreiben Sie hier...',
  multiline = false,
  maxLength,
  className = '',
  onKeyDown,
}) => {
  const { users, mentionUser, currentUser } = useUser();
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const inputRef = useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setCursorPosition(e.target.selectionStart || 0);
  };

  // Handle user selection from suggestions
  const handleSelectUser = (user: User) => {
    if (mentionStartPos !== null) {
      const beforeMention = value.substring(0, mentionStartPos);
      const afterMention = value.substring(cursorPosition);
      const newValue = `${beforeMention}@${user.name} ${afterMention}`;
      
      onChange(newValue);
      setSuggestions([]);
      setMentionQuery('');
      setMentionStartPos(null);
      
      // Notify about the mention if callback is provided
      if (onMention) {
        onMention(user.id, newValue);
      } else if (mentionUser && currentUser) {
        // Use the mentionUser function from context if no specific callback is provided
        mentionUser(user.id, "", newValue, "case");
      }
      
      // Focus back on input and set cursor position after the inserted mention
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          const newPosition = beforeMention.length + user.name.length + 2; // +2 for @ and space
          inputRef.current.setSelectionRange(newPosition, newPosition);
        }
      }, 0);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Detect @ mentions and show suggestions
  useEffect(() => {
    if (value && cursorPosition > 0) {
      // Look for @ symbol before the current cursor position
      const textBeforeCursor = value.substring(0, cursorPosition);
      const atIndex = textBeforeCursor.lastIndexOf('@');
      
      if (atIndex !== -1 && (atIndex === 0 || /\s/.test(textBeforeCursor[atIndex - 1]))) {
        const query = textBeforeCursor.substring(atIndex + 1);
        // Only show suggestions if we don't have a space after the @ symbol yet
        if (!query.includes(' ')) {
          setMentionQuery(query.toLowerCase());
          setMentionStartPos(atIndex);
          
          // Filter users based on the query
          const filteredUsers = users.filter(user => 
            user.name.toLowerCase().includes(query.toLowerCase())
          );
          
          setSuggestions(filteredUsers);
          setSelectedSuggestionIndex(0); // Reset selection index with new suggestions
          return;
        }
      }
    }
    
    // Reset if no @ is found or if there's a space after @
    setSuggestions([]);
    setMentionQuery('');
    setMentionStartPos(null);
  }, [value, cursorPosition, users]);
  
  // Update cursor position on selection change
  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setCursorPosition(e.currentTarget.selectionStart || 0);
  };

  // Handle key navigation through suggestions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault(); // Prevent cursor movement in input
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : 0);
      } else if (e.key === 'Enter' && suggestions.length > 0) {
        e.preventDefault(); // Prevent form submission
        handleSelectUser(suggestions[selectedSuggestionIndex]);
      } else if (e.key === 'Escape') {
        setSuggestions([]);
      } else if (e.key === 'Tab' && suggestions.length > 0) {
        e.preventDefault(); // Prevent focus change
        handleSelectUser(suggestions[selectedSuggestionIndex]);
      }
    }
    
    // Call the external onKeyDown handler if provided
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          value={value}
          onChange={handleChange}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full p-2 border rounded-md ${className}`}
          rows={3}
        />
      ) : (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type="text"
          value={value}
          onChange={handleChange}
          onSelect={handleSelect}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full p-2 border rounded-md ${className}`}
        />
      )}
      
      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-card border border-border rounded-md shadow-lg"
        >
          {suggestions.map((user, index) => (
            <div
              key={user.id}
              className={`flex items-center gap-2 p-2 cursor-pointer ${
                index === selectedSuggestionIndex 
                  ? 'bg-accent text-accent-foreground' 
                  : 'hover:bg-accent/50'
              }`}
              onClick={() => handleSelectUser(user)}
            >
              <CustomAvatar name={user.name} imageSrc={user.avatar} size="sm" />
              <span>{user.name}</span>
              <span className="text-xs text-muted-foreground">({user.role || user.userRole})</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
