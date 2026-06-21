
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { User } from '../../types/case';

interface AddUserDialogProps {
  newUser: Omit<User, 'id'>;
  setNewUser: React.Dispatch<React.SetStateAction<Omit<User, 'id'>>>;
  onCancel: () => void;
  onAddUser: () => void;
}

export const AddUserDialog: React.FC<AddUserDialogProps> = ({
  newUser,
  setNewUser,
  onCancel,
  onAddUser
}) => {
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Neuen Benutzer anlegen</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Name*
            </label>
            <input
              id="name"
              className="w-full p-2 rounded-md border border-input"
              value={newUser.name}
              onChange={(e) => setNewUser({...newUser, name: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="role">
              Position
            </label>
            <input
              id="role"
              className="w-full p-2 rounded-md border border-input"
              value={newUser.role}
              onChange={(e) => setNewUser({...newUser, role: e.target.value})}
              placeholder="z.B. Versicherungskaufmann"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            E-Mail*
          </label>
          <input
            id="email"
            type="email"
            className="w-full p-2 rounded-md border border-input"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="department">
              Abteilung
            </label>
            <select
              id="department"
              className="w-full p-2 rounded-md border border-input bg-background"
              value={newUser.department ?? 'innendienst'}
              onChange={(e) => setNewUser({...newUser, department: e.target.value})}
            >
              <option value="innendienst">Innendienst</option>
              <option value="aussendienst">Außendienst</option>
              <option value="leitung">Agenturleitung</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="phone">
              Telefon
            </label>
            <input
              id="phone"
              className="w-full p-2 rounded-md border border-input"
              value={newUser.phone}
              onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
              placeholder="+49123456789"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="user-role">
            Systemrolle
          </label>
          <select
            id="user-role"
            className="w-full p-2 rounded-md border border-input"
            value={newUser.userRole}
            onChange={(e) => setNewUser({...newUser, userRole: e.target.value as 'admin' | 'staff'})}
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
          onClick={onAddUser}
        >
          Benutzer anlegen
        </button>
      </DialogFooter>
    </DialogContent>
  );
};
