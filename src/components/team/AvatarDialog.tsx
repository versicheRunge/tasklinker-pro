
import React, { useRef, useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Upload, Loader2 } from 'lucide-react';

interface AvatarDialogProps {
  avatarUrl: string;
  setAvatarUrl: React.Dispatch<React.SetStateAction<string>>;
  onCancel: () => void;
  onSave: () => void;
  onGenerateRandom: () => void;
}

export const AvatarDialog: React.FC<AvatarDialogProps> = ({
  avatarUrl, setAvatarUrl, onCancel, onSave, onGenerateRandom
}) => {
  const { profile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    if (file.size > 2 * 1024 * 1024) { setUploadError('Maximal 2 MB erlaubt.'); return; }
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setUploadError('Nur JPEG, PNG, WebP oder GIF erlaubt.'); return;
    }
    setUploading(true); setUploadError(null);
    const ext = file.name.split('.').pop();
    const path = `${profile.id}/avatar.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) {
      setUploadError(error.message);
    } else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path);
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    }
    setUploading(false);
  };

  const preview = avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${profile?.full_name ?? 'U'}`;

  return (
    <DialogContent className="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>Profilbild ändern</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="flex flex-col items-center gap-3">
          <img src={preview} alt="Vorschau" className="w-24 h-24 rounded-full object-cover border border-border" />
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploading ? 'Wird hochgeladen…' : 'Bild hochladen'}
          </button>
          <p className="text-xs text-muted-foreground">JPEG, PNG oder WebP · max. 2 MB</p>
          {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">oder URL angeben</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div>
          <input
            className="w-full p-2 rounded-md border border-input text-sm"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/bild.jpg"
          />
        </div>
      </div>
      <DialogFooter>
        <button className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors" onClick={onCancel}>
          Abbrechen
        </button>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          onClick={onSave}
          disabled={uploading}
        >
          Speichern
        </button>
      </DialogFooter>
    </DialogContent>
  );
};
