
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { ChatChannel } from '../../../types/chat';

interface AddChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelName: string;
  setChannelName: (name: string) => void;
  onConfirm: () => void;
  title: string;
  confirmLabel: string;
}

export const AddEditChannelDialog: React.FC<AddChannelDialogProps> = ({
  open,
  onOpenChange,
  channelName,
  setChannelName,
  onConfirm,
  title,
  confirmLabel
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="channel-name">Kanalname</Label>
          <Input
            id="channel-name"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Kanalname"
            className="mt-2"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeleteChannelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelToDelete: ChatChannel | null;
  onConfirm: () => void;
}

export const DeleteChannelDialog: React.FC<DeleteChannelDialogProps> = ({
  open,
  onOpenChange,
  channelToDelete,
  onConfirm
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kanal löschen</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          Möchten Sie den Kanal "{channelToDelete?.name}" wirklich löschen?
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button variant="destructive" onClick={onConfirm}>Löschen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
