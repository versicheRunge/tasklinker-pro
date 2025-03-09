import { useState, useEffect } from 'react';
import { User } from '../types/case';
import { CalendarEvent } from '../types/calendar';
import { useUser } from '../contexts/UserContext';
import { toast } from "./use-toast";
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
  const [isVacationDialogOpen, setIsVacationDialogOpen] = useState(false);
  const [userForVacation, setUserForVacation] = useState<User | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const storedEvents = localStorage.getItem('calendarEvents');
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
        const eventsWithDates = parsedEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date),
          endDate: event.endDate ? new Date(event.endDate) : undefined
        }));
        setCalendarEvents(eventsWithDates);
      } catch (e) {
        console.error('Error parsing stored events:', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'calendarEvents' && e.newValue) {
        try {
          const parsedEvents = JSON.parse(e.newValue);
          const eventsWithDates = parsedEvents.map((event: any) => ({
            ...event,
            date: new Date(event.date),
            endDate: event.endDate ? new Date(event.endDate) : undefined
          }));
          setCalendarEvents(eventsWithDates);
        } catch (e) {
          console.error('Error parsing stored events:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
      updatedBadges.splice(badgeIndex, 1);
    } else {
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

  const handleOpenVacationDialog = (user: User) => {
    setUserForVacation(user);
    setIsVacationDialogOpen(true);
  };

  const handleSaveVacation = () => {
    setIsVacationDialogOpen(false);
    
    toast({
      title: "Urlaubsanspruch aktualisiert",
      description: "Der Urlaubsanspruch wurde erfolgreich aktualisiert."
    });
  };

  const generateRandomAvatar = () => {
    const gender = Math.random() > 0.5 ? 'men' : 'women';
    const number = Math.floor(Math.random() * 100);
    const url = `https://randomuser.me/api/portraits/${gender}/${number}.jpg`;
    setAvatarUrl(url);
  };

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
    calendarEvents,
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
    isVacationDialogOpen,
    setIsVacationDialogOpen,
    userForVacation,
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
    handleOpenVacationDialog,
    handleSaveVacation,
    generateRandomAvatar
  };
};
