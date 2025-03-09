
import React from 'react';
import { Button } from '../../ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface MessageActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({ onEdit, onDelete }) => {
  return (
    <div className="flex gap-1 mt-1 justify-end">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onEdit}
      >
        <Pencil className="h-3 w-3 text-muted-foreground" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3 text-muted-foreground" />
      </Button>
    </div>
  );
};
