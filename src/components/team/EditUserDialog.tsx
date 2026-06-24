
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { User } from '../../types/case';

interface EditUserDialogProps {
  editingUser: User;
  setEditingUser: React.Dispatch<React.SetStateAction<User>>;
  currentUserId?: string;
  onCancel: () => void;
  onSave: () => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  editingUser,
  setEditingUser,
  currentUserId,
  onCancel,
  onSave
}) => {
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Benutzer bearbeiten</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="edit-name">
            Name*
          </label>
          <input
            id="edit-name"
            className="w-full p-2 rounded-md border border-input"
            value={editingUser.name}
            onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            E-Mail
          </label>
          <input
            type="email"
            className="w-full p-2 rounded-md border border-input bg-muted text-muted-foreground cursor-not-allowed"
            value={editingUser.email}
            readOnly
            title="E-Mail kann nicht geändert werden"
          />
          <p className="text-xs text-muted-foreground mt-1">E-Mail kann nur über Supabase Admin geändert werden.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="edit-department">
              Abteilung
            </label>
            <select
              id="edit-department"
              className="w-full p-2 rounded-md border border-input bg-background"
              value={editingUser.department ?? 'innendienst'}
              onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
            >
              <option value="innendienst">Innendienst</option>
              <option value="aussendienst">Außendienst</option>
              <option value="leitung">Agenturleitung</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="edit-phone">
              Telefon
            </label>
            <input
              id="edit-phone"
              className="w-full p-2 rounded-md border border-input"
              value={editingUser.phone}
              onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
              placeholder="+49123456789"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="edit-user-role">
            Systemrolle
          </label>
          <select
            id="edit-user-role"
            className="w-full p-2 rounded-md border border-input"
            value={editingUser.userRole}
            onChange={(e) => setEditingUser({
              ...editingUser, 
              userRole: e.target.value as 'admin' | 'staff'
            })}
            disabled={editingUser.id === currentUserId}
          >
            <option value="staff">Mitarbeiter (eingeschränkter Zugriff)</option>
            <option value="admin">Administrator (voller Zugriff)</option>
          </select>
        </div>
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
          Änderungen speichern
        </button>
      </DialogFooter>
    </DialogContent>
  );
};
