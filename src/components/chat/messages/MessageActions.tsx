
import React from 'react';
import { Button } from '../../ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface MessageActionsProps {
  onEdit?: () => void;
  onDelete: () => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({ onEdit, onDelete }) => {
  return (
    <div className="flex gap-1 mt-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
      {onEdit && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onEdit} title="Bearbeiten">
          <Pencil className="h-3 w-3 text-muted-foreground" />
        </Button>
      )}
      <Button variant="ghost" size="icon" className="h-6 w-6 hover:text-destructive" onClick={onDelete} title="Löschen">
        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
      </Button>
    </div>
  );
};
