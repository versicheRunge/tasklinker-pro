
import React, { useState } from 'react';
import { Button } from '../../ui/button';
import { Check, X } from 'lucide-react';

interface MessageContentProps {
  text: string;
  isCurrentUser: boolean;
  formatMessageWithMentions: (text: string) => { formattedText: string; mentions: string[] };
  isEditing: boolean;
  editText: string;
  setEditText: (text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

export const MessageContent: React.FC<MessageContentProps> = ({
  text,
  isCurrentUser,
  formatMessageWithMentions,
  isEditing,
  editText,
  setEditText,
  onSaveEdit,
  onCancelEdit,
  handleKeyDown
}) => {
  return (
    <div 
      className={`rounded-lg p-3 ${
        isCurrentUser 
          ? 'bg-primary text-primary-foreground rounded-tr-none' 
          : 'bg-muted rounded-tl-none'
      }`}
    >
      {isEditing ? (
        <MessageEditor
          editText={editText}
          setEditText={setEditText}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          handleKeyDown={handleKeyDown}
        />
      ) : (
        <div 
          className="whitespace-pre-wrap break-words"
          dangerouslySetInnerHTML={{ 
            __html: formatMessageWithMentions(text).formattedText 
          }}
        />
      )}
    </div>
  );
};

interface MessageEditorProps {
  editText: string;
  setEditText: (text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
}

export const MessageEditor: React.FC<MessageEditorProps> = ({
  editText,
  setEditText,
  onSaveEdit,
  onCancelEdit,
  handleKeyDown
}) => {
  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        onKeyDown={handleKeyDown}
        className="w-full bg-background text-foreground p-2 rounded border border-input text-sm min-h-[80px] focus:outline-none focus:ring-1"
        autoFocus
      />
      <div className="flex justify-end gap-2">
        <Button 
          onClick={onCancelEdit} 
          size="sm" 
          variant="ghost"
          className="h-7 px-2 text-xs"
        >
          <X className="h-3.5 w-3.5 mr-1" /> Abbrechen
        </Button>
        <Button 
          onClick={onSaveEdit} 
          size="sm"
          className="h-7 px-2 text-xs"
        >
          <Check className="h-3.5 w-3.5 mr-1" /> Speichern
        </Button>
      </div>
    </div>
  );
};
