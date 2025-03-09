
import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Mail, Phone, Award, PlusCircle, Edit2, Trash2, Save } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { toast } from "../hooks/use-toast";
import { useUser } from '../contexts/UserContext';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { User } from '../types/case';

const Team: React.FC = () => {
  const { users, currentUser, addUser, updateUser, deleteUser, isAdmin } = useUser();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState<Omit<User, 'id'>>({
    name: '',
    email: '',
    role: 'Mitarbeiter',
    department: 'Kundenservice',
    phone: '',
    userRole: 'staff'
  });

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCreateUser = () => {
    if (!newUserData.name.trim() || !newUserData.email?.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive"
      });
      return;
    }

    addUser({
      ...newUserData,
      stats: {
        casesHandled: 0,
        completing: 0,
        completed: 0
      }
    });

    setIsCreateDialogOpen(false);
    setNewUserData({
      name: '',
      email: '',
      role: 'Mitarbeiter',
      department: 'Kundenservice',
      phone: '',
      userRole: 'staff'
    });

    toast({
      title: "Benutzer erstellt",
      description: "Der neue Mitarbeiter wurde erfolgreich hinzugefügt."
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (!editingUser || !editingUser.name.trim() || !editingUser.email?.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte füllen Sie alle Pflichtfelder aus.",
        variant: "destructive"
      });
      return;
    }

    updateUser(editingUser.id, editingUser);
    setIsEditDialogOpen(false);
    setEditingUser(null);

    toast({
      title: "Benutzer aktualisiert",
      description: "Die Mitarbeiterdaten wurden erfolgreich aktualisiert."
    });
  };

  const handleDeleteUser = (id: string) => {
    // Don't allow deleting yourself
    if (id === currentUser?.id) {
      toast({
        title: "Fehler",
        description: "Sie können Ihren eigenen Account nicht löschen.",
        variant: "destructive"
      });
      return;
    }

    deleteUser(id);
    toast({
      title: "Benutzer gelöscht",
      description: "Der Mitarbeiter wurde erfolgreich entfernt."
    });
  };

  // Extended user data with more details
  const extendedUsers = users.map(user => ({
    ...user,
    department: user.department || 'Kundenservice',
    phone: user.phone || '+49 123 456789',
    stats: user.stats || {
      casesHandled: Math.floor(Math.random() * 100),
      completing: Math.floor(Math.random() * 20),
      completed: Math.floor(Math.random() * 60)
    }
  }));

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team</h1>
          <p className="text-muted-foreground">Übersicht aller Teammitglieder und deren Aktivitäten.</p>
        </div>
        {isAdmin && (
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Teammitglied hinzufügen</span>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {extendedUsers.map(user => (
          <div key={user.id} className="bg-card rounded-xl border border-border overflow-hidden animate-scale-in">
            <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5"></div>
            <div className="p-6 pt-0 -mt-12">
              <Avatar className="h-20 w-20 border-4 border-background">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                )}
              </Avatar>
              
              <h2 className="text-xl font-semibold mt-4 mb-1">{user.name}</h2>
              <p className="text-muted-foreground text-sm">{user.role}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.phone}</span>
                </div>
              </div>
              
              <div className="mt-5 pt-5 border-t border-border">
                <div className="flex justify-between mb-3">
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{user.stats.casesHandled}</p>
                    <p className="text-xs text-muted-foreground">Vorgänge</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{user.stats.completing}</p>
                    <p className="text-xs text-muted-foreground">In Bearbeitung</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{user.stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Abgeschlossen</p>
                  </div>
                </div>
                
                {isAdmin && (
                  <div className="flex justify-between mt-3 pt-3 border-t border-border">
                    <button 
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      onClick={() => handleEditUser(user)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Bearbeiten
                    </button>
                    
                    {user.id !== currentUser?.id && (
                      <button 
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Entfernen
                      </button>
                    )}
                  </div>
                )}
                
                {user.id === '3' && (
                  <div className="flex items-center gap-2 p-2 bg-amber-50 text-amber-700 rounded-lg text-xs mt-4">
                    <Award className="w-4 h-4" />
                    <span>Top-Performer des Monats</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Neuen Mitarbeiter hinzufügen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="new-name">
                Name *
              </label>
              <input
                id="new-name"
                className="w-full p-2 rounded-md border border-input"
                value={newUserData.name}
                onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                placeholder="Name des Mitarbeiters"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="new-email">
                E-Mail *
              </label>
              <input
                id="new-email"
                className="w-full p-2 rounded-md border border-input"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                placeholder="E-Mail-Adresse"
                type="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="new-phone">
                Telefon
              </label>
              <input
                id="new-phone"
                className="w-full p-2 rounded-md border border-input"
                value={newUserData.phone}
                onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                placeholder="Telefonnummer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="new-role">
                Position
              </label>
              <input
                id="new-role"
                className="w-full p-2 rounded-md border border-input"
                value={newUserData.role}
                onChange={(e) => setNewUserData({...newUserData, role: e.target.value})}
                placeholder="Position im Unternehmen"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="new-department">
                Abteilung
              </label>
              <select
                id="new-department"
                className="w-full p-2 rounded-md border border-input"
                value={newUserData.department}
                onChange={(e) => setNewUserData({...newUserData, department: e.target.value})}
              >
                <option value="Kundenservice">Kundenservice</option>
                <option value="Vertrag">Vertrag</option>
                <option value="Schaden">Schaden</option>
                <option value="Leitung">Leitung</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="new-user-role">
                Systemrolle
              </label>
              <select
                id="new-user-role"
                className="w-full p-2 rounded-md border border-input"
                value={newUserData.userRole}
                onChange={(e) => setNewUserData({...newUserData, userRole: e.target.value as 'admin' | 'staff'})}
              >
                <option value="staff">Mitarbeiter (eingeschränkter Zugriff)</option>
                <option value="admin">Administrator (voller Zugriff)</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleCreateUser}>
              Mitarbeiter hinzufügen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      {editingUser && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Mitarbeiter bearbeiten</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-name">
                  Name *
                </label>
                <input
                  id="edit-name"
                  className="w-full p-2 rounded-md border border-input"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-email">
                  E-Mail *
                </label>
                <input
                  id="edit-email"
                  className="w-full p-2 rounded-md border border-input"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  type="email"
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
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-role">
                  Position
                </label>
                <input
                  id="edit-role"
                  className="w-full p-2 rounded-md border border-input"
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-department">
                  Abteilung
                </label>
                <select
                  id="edit-department"
                  className="w-full p-2 rounded-md border border-input"
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
                >
                  <option value="Kundenservice">Kundenservice</option>
                  <option value="Vertrag">Vertrag</option>
                  <option value="Schaden">Schaden</option>
                  <option value="Leitung">Leitung</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="edit-user-role">
                  Systemrolle
                </label>
                <select
                  id="edit-user-role"
                  className="w-full p-2 rounded-md border border-input"
                  value={editingUser.userRole}
                  onChange={(e) => setEditingUser({...editingUser, userRole: e.target.value})}
                  disabled={editingUser.id === currentUser?.id}
                >
                  <option value="staff">Mitarbeiter (eingeschränkter Zugriff)</option>
                  <option value="admin">Administrator (voller Zugriff)</option>
                </select>
                {editingUser.id === currentUser?.id && (
                  <p className="text-xs text-muted-foreground mt-1">Sie können Ihre eigene Rolle nicht ändern.</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleSaveUser}>
                <Save className="w-4 h-4 mr-2" />
                Speichern
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
};

export default Team;
