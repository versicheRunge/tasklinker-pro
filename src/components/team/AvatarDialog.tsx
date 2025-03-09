
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";

interface AvatarDialogProps {
  avatarUrl: string;
  setAvatarUrl: React.Dispatch<React.SetStateAction<string>>;
  onCancel: () => void;
  onSave: () => void;
  onGenerateRandom: () => void;
}

export const AvatarDialog: React.FC<AvatarDialogProps> = ({
  avatarUrl,
  setAvatarUrl,
  onCancel,
  onSave,
  onGenerateRandom
}) => {
  return (
    <DialogContent className="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>Profilbild ändern</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="flex justify-center">
          <img 
            src={avatarUrl || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
            alt="Avatar Vorschau" 
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="avatar-url">
            Bild-URL
          </label>
          <input
            id="avatar-url"
            className="w-full p-2 rounded-md border border-input"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <button
          className="w-full px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors"
          onClick={onGenerateRandom}
        >
          Zufälliges Bild generieren
        </button>
      </div>
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
    </DialogContent>
  );
};
