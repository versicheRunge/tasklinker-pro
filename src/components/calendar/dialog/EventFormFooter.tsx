
import React from 'react';
import { DialogFooter } from "../../ui/dialog";

interface EventFormFooterProps {
  onCancel: () => void;
  onSave: () => void;
}

export const EventFormFooter: React.FC<EventFormFooterProps> = ({
  onCancel,
  onSave
}) => {
  return (
    <DialogFooter>
      <button
        className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors"
        onClick={onCancel}
      >
        Abbrechen
      </button>
      <button
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        onClick={onSave}
      >
        Speichern
      </button>
    </DialogFooter>
  );
};
