
import { useState, useEffect } from 'react';
import { User } from '../types/case';
import { useUser } from '../contexts/UserContext';
import { toast } from "../hooks/use-toast";
import { UserBadge } from '../contexts/UserTypes';

export const useTeamManager = () => {
  const { users, addUser, updateUser, deleteUser, currentUser, isAdmin } = useUser();
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

  const [avatarUrl, setAvatarUrl] = useState('');
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [userToChangeAvatar, setUserToChangeAvatar] = useState<User | null>(null);
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [userForBadges, setUserForBadges] = useState<User | null>(null);
  const [userAbsenceStats, setUserAbsenceStats] = useState<{userId: string, absence: number, sick: number}[]>([]);

  // Calculate absence statistics for admin view
  useEffect(() => {
    if (!isAdmin) return;
    
    // Get events from calendar
    const storedEvents = localStorage.getItem('calendarEvents');
    if (!storedEvents) return;
    
    try {
      const events = JSON.parse(storedEvents);
      const stats = users.map(user => {
        // Count absence days
        const absenceDays = events
          .filter((event: any) => 
            event.type === 'absence' && 
            event.userId === user.id
          )
          .reduce((total: number, event: any) => {
            if (!event.endDate) return total + 1;
            
            // Calculate days between dates for multi-day events
            const start = new Date(event.date);
            const end = new Date(event.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            return total + diffDays;
          }, 0);
        
        // Count sick days
        const sickDays = events
          .filter((event: any) => 
            event.type === 'sick' && 
            event.userId === user.id
          )
          .reduce((total: number, event: any) => {
            if (!event.endDate) return total + 1;
            
            // Calculate days between dates for multi-day events
            const start = new Date(event.date);
            const end = new Date(event.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            return total + diffDays;
          }, 0);
        
        return {
          userId: user.id,
          absence: absenceDays,
          sick: sickDays
        };
      });
      
      setUserAbsenceStats(stats);
    } catch (e) {
      console.error('Error calculating absence stats:', e);
    }
  }, [users, isAdmin]);

  useEffect(() => {
    localStorage.setItem('teamUsers', JSON.stringify(users));
  }, [users]);

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

  const handleOpenBadgeDialog = (user: User) => {
    setUserForBadges(user);
    setIsBadgeDialogOpen(true);
  };

  const handleToggleBadge = (badgeId: string) => {
    if (!userForBadges) return;
    
    const updatedBadges = userForBadges.badges || [];
    const badgeIndex = updatedBadges.findIndex(badge => badge.id === badgeId);
    
    if (badgeIndex >= 0) {
      // Remove badge
      updatedBadges.splice(badgeIndex, 1);
    } else {
      // Add badge
      const selectedBadge = getAvailableBadges().find(badge => badge.id === badgeId);
      if (selectedBadge) {
        updatedBadges.push(selectedBadge);
      }
    }
    
    setUserForBadges({
      ...userForBadges,
      badges: updatedBadges
    });
  };

  const handleSaveBadges = () => {
    if (!userForBadges) return;
    
    updateUser(userForBadges.id, { badges: userForBadges.badges });
    setIsBadgeDialogOpen(false);
    
    toast({
      title: "Auszeichnungen aktualisiert",
      description: "Die Auszeichnungen wurden erfolgreich aktualisiert."
    });
  };

  const generateRandomAvatar = () => {
    const gender = Math.random() > 0.5 ? 'men' : 'women';
    const number = Math.floor(Math.random() * 100);
    const url = `https://randomuser.me/api/portraits/${gender}/${number}.jpg`;
    setAvatarUrl(url);
  };

  // Get available badges from localStorage
  const getAvailableBadges = () => {
    const storedBadges = localStorage.getItem('userBadges');
    if (storedBadges) {
      try {
        return JSON.parse(storedBadges);
      } catch (e) {
        console.error('Error parsing badges:', e);
      }
    }
    return [];
  };

  // Categories of badges
  const badgeCategories = [
    { id: 'achievement', name: 'Leistung' },
    { id: 'skill', name: 'Kompetenz' },
    { id: 'tenure', name: 'Zugehörigkeit' },
    { id: 'certification', name: 'Zertifizierung' },
    { id: 'special', name: 'Besondere Auszeichnung' }
  ];

  return {
    users,
    currentUser,
    isAdmin,
    userAbsenceStats,
    isDialogOpen,
    setIsDialogOpen,
    isEditingDialogOpen,
    setIsEditingDialogOpen,
    newUser,
    setNewUser,
    editingUser,
    setEditingUser,
    avatarUrl,
    setAvatarUrl,
    isAvatarDialogOpen,
    setIsAvatarDialogOpen,
    userToChangeAvatar,
    isBadgeDialogOpen,
    setIsBadgeDialogOpen,
    userForBadges,
    badgeCategories,
    availableBadges: getAvailableBadges(),
    handleAddUser,
    handleDeleteUser,
    handleEditUser,
    handleSaveUser,
    handleOpenAvatarDialog,
    handleSaveAvatar,
    handleOpenBadgeDialog,
    handleToggleBadge,
    handleSaveBadges,
    generateRandomAvatar
  };
};
