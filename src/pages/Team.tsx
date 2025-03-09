import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Mail, Phone, Award, PlusCircle, Edit2, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { toast } from "../hooks/use-toast";
import { useUser } from '../contexts/UserContext';
import { User } from '../types/case';

const Team: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser, isAdmin } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditingDialogOpen, setIsEditingDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    role: '',
    email: '',
    department: '',
    phone: '',
    avatar: '',
    userRole: 'staff' as 'admin' | 'staff',
    stats: {
      casesHandled: 0,
      completed: 0,
      inProgress: 0
    }
  });

  const [editingUser, setEditingUser] = useState<User>({
    id: '',
    name: '',
    role: '',
    email: '',
    department: '',
    phone: '',
    avatar: '',
    userRole: 'staff',
    stats: {
      casesHandled: 0,
      completed: 0,
      inProgress: 0
    }
  });

  const [avatarUrl, setAvatarUrl] = useState('');
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [userToChangeAvatar, setUserToChangeAvatar] = useState<User | null>(null);

  const handleAddUser = () => {
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.role.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle erforderlichen Felder aus.",
        variant: "destructive"
      });
      return;
    }

    addUser({
      name: newUser.name,
      role: newUser.role,
      email: newUser.email,
      department: newUser.department || 'Allgemein',
      phone: newUser.phone || '',
      avatar: newUser.avatar || `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 100)}.jpg`,
      userRole: newUser.userRole,
      stats: {
        casesHandled: 0,
        completed: 0,
        inProgress: 0
      }
    });

    setIsDialogOpen(false);
    setNewUser({
      name: '',
      role: '',
      email: '',
      department: '',
      phone: '',
      avatar: '',
      userRole: 'staff',
      stats: {
        casesHandled: 0,
        completed: 0,
        inProgress: 0
      }
    });

    toast({
      title: "Benutzer hinzugefügt",
      description: "Der neue Benutzer wurde erfolgreich angelegt."
    });
  };

  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
      toast({
        title: "Fehler",
        description: "Sie können Ihren eigenen Benutzer nicht löschen.",
        variant: "destructive"
      });
      return;
    }

    deleteUser(id);

    toast({
      title: "Benutzer gelöscht",
      description: "Der Benutzer wurde erfolgreich gelöscht."
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setIsEditingDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!editingUser.name.trim() || !editingUser.email.trim() || !editingUser.role.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle erforderlichen Felder aus.",
        variant: "destructive"
      });
      return;
    }

    updateUser(editingUser.id, editingUser);
    setIsEditingDialogOpen(false);

    toast({
      title: "Benutzer aktualisiert",
      description: "Die Benutzerdaten wurden erfolgreich aktualisiert."
    });
  };

  const handleOpenAvatarDialog = (user: User) => {
    setUserToChangeAvatar(user);
    setAvatarUrl(user.avatar || '');
    setIsAvatarDialogOpen(true);
  };

  const handleSaveAvatar = () => {
    if (!userToChangeAvatar) return;
    
    updateUser(userToChangeAvatar.id, { avatar: avatarUrl });
    setIsAvatarDialogOpen(false);
    setUserToChangeAvatar(null);
    
    toast({
      title: "Avatar aktualisiert",
      description: "Das Profilbild wurde erfolgreich aktualisiert."
    });
  };

  const generateRandomAvatar = () => {
    const gender = Math.random() > 0.5 ? 'men' : 'women';
    const number = Math.floor(Math.random() * 100);
    const url = `https://randomuser.me/api/portraits/${gender}/${number}.jpg`;
    setAvatarUrl(url);
  };

  useEffect(() => {
    localStorage.setItem('teamUsers', JSON.stringify(users));
  }, [users]);

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihr Team und deren Berechtigungen.</p>
        </div>
        {isAdmin && (
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            onClick={() => setIsDialogOpen(true)}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Neuer Benutzer</span>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative group">
                <img 
                  src={user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                  alt={user.name} 
                  className="w-16 h-16 rounded-full object-cover"
                />
                {isAdmin && (
                  <button 
                    onClick={() => handleOpenAvatarDialog(user)}
                    className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ImageIcon className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-muted-foreground">{user.role}</p>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <button 
                    className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {user.id !== currentUser?.id && (
                    <button 
                      className="p-2 text-red-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span>{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{user.phone}</span>
                </div>
              )}
              {user.department && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span>{user.department}</span>
                </div>
              )}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold">{user.stats?.casesHandled || 0}</p>
                  <p className="text-xs text-muted-foreground">Vorgänge</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{user.stats?.inProgress || 0}</p>
                  <p className="text-xs text-muted-foreground">In Bearbeitung</p>
                </div>
                <div>
                  <p className="text-xl font-bold">{user.stats?.completed || 0}</p>
                  <p className="text-xs text-muted-foreground">Erledigt</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                  Position*
                </label>
                <input
                  id="role"
                  className="w-full p-2 rounded-md border border-input"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
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
                <input
                  id="department"
                  className="w-full p-2 rounded-md border border-input"
                  value={newUser.department}
                  onChange={(e) => setNewUser({...newUser, department: e.target.value})}
                />
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
              onClick={() => setIsDialogOpen(false)}
            >
              Abbrechen
            </button>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              onClick={handleAddUser}
            >
              Benutzer anlegen
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditingDialogOpen} onOpenChange={setIsEditingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Benutzer bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium mb-1" htmlFor="edit-role">
                  Position*
                </label>
                <input
                  id="edit-role"
                  className="w-full p-2 rounded-md border border-input"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="edit-email">
                E-Mail*
              </label>
              <input
                id="edit-email"
                type="email"
                className="w-full p-2 rounded-md border border-input"
                value={editingUser.email}
                onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-department">
                  Abteilung
                </label>
                <input
                  id="edit-department"
                  className="w-full p-2 rounded-md border border-input"
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                />
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
                disabled={editingUser.id === currentUser?.id}
              >
                <option value="staff">Mitarbeiter (eingeschränkter Zugriff)</option>
                <option value="admin">Administrator (voller Zugriff)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <button
              className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors"
              onClick={() => setIsEditingDialogOpen(false)}
            >
              Abbrechen
            </button>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              onClick={handleSaveUser}
            >
              Änderungen speichern
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
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
              onClick={generateRandomAvatar}
            >
              Zufälliges Bild generieren
            </button>
          </div>
          <DialogFooter>
            <button
              className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors"
              onClick={() => setIsAvatarDialogOpen(false)}
            >
              Abbrechen
            </button>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              onClick={handleSaveAvatar}
            >
              Speichern
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Team;
