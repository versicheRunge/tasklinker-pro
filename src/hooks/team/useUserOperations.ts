
import { useState } from 'react';
import { User } from '../../types/case';
import { useUser } from '../../contexts/UserContext';
import { toast } from "../use-toast";

export const useUserOperations = () => {
  const { addUser, updateUser, deleteUser, currentUser, isAdmin } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditingDialogOpen, setIsEditingDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
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
    },
    badges: []
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
    },
    badges: []
  });

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
      },
      badges: []
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
      },
      badges: []
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

  return {
    isAdmin,
    currentUser,
    isDialogOpen,
    setIsDialogOpen,
    isEditingDialogOpen,
    setIsEditingDialogOpen,
    newUser,
    setNewUser,
    editingUser,
    setEditingUser,
    handleAddUser,
    handleDeleteUser,
    handleEditUser,
    handleSaveUser
  };
};
