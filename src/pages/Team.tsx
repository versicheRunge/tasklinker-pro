
import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Mail, Phone, Award, PlusCircle, Edit2, Trash2, Save, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../components/ui/dialog";
import { toast } from "../hooks/use-toast";
import { useUser } from '../contexts/UserContext';
import { User } from '../types/case';
import { Badge } from '../components/ui/badge';
import { CustomBadge } from '../components/ui/CustomBadge';

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

  // Handle opening email client
  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  // Handle opening WhatsApp
  const handleWhatsAppClick = (phone: string) => {
    // Clean phone number - remove spaces, dashes, etc.
    const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

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
      const selectedBadge = availableBadges.find(badge => badge.id === badgeId);
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

  useEffect(() => {
    localStorage.setItem('teamUsers', JSON.stringify(users));
  }, [users]);

  // Get absence stats for a user
  const getUserAbsenceStats = (userId: string) => {
    const stats = userAbsenceStats.find(stat => stat.userId === userId);
    return stats || { absence: 0, sick: 0 };
  };

  // Categories of badges
  const badgeCategories = [
    { id: 'achievement', name: 'Leistung' },
    { id: 'skill', name: 'Kompetenz' },
    { id: 'tenure', name: 'Zugehörigkeit' },
    { id: 'certification', name: 'Zertifizierung' },
    { id: 'special', name: 'Besondere Auszeichnung' }
  ];

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

  // List of available badges
  const availableBadges = getAvailableBadges();

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team</h1>
          <p className="text-muted-foreground">
            {isAdmin 
              ? "Verwalten Sie Ihr Team und deren Berechtigungen." 
              : "Das ist unser großartiges Team!"}
          </p>
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
      
      {/* Admin Only: Absence Statistics */}
      {isAdmin && (
        <div className="mb-8 bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-bold mb-4">Urlaubsübersicht</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-3 text-left">Mitarbeiter</th>
                  <th className="p-3 text-center">Urlaubstage</th>
                  <th className="p-3 text-center">Krankheitstage</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const stats = getUserAbsenceStats(user.id);
                  return (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/20">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                            alt={user.name} 
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1">
                          <span className="text-blue-500">🏖️</span>
                          {stats.absence}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1">
                          <span className="text-pink-500">🤒</span>
                          {stats.sick}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative group">
                <img 
                  src={user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                  alt={user.name} 
                  className="w-20 h-20 rounded-full object-cover"
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
                <button 
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-700 hover:underline"
                  onClick={() => handleEmailClick(user.email || '')}
                >
                  <span>{user.email}</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <button 
                    className="flex items-center gap-1 text-green-500 hover:text-green-700 hover:underline"
                    onClick={() => handleWhatsAppClick(user.phone || '')}
                  >
                    <span>{user.phone}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
              {user.department && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span>{user.department}</span>
                </div>
              )}
            </div>
            
            {/* Badges section */}
            {user.badges && user.badges.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium">Auszeichnungen</h4>
                  {isAdmin && (
                    <button 
                      className="text-xs text-blue-500 hover:text-blue-700"
                      onClick={() => handleOpenBadgeDialog(user)}
                    >
                      Bearbeiten
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1">
                  {user.badges.map((badge) => (
                    <CustomBadge 
                      key={badge.id}
                      icon={badge.icon}
                      label={badge.name}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Stats section */}
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
            
            {isAdmin && !user.badges?.length && (
              <div className="mt-3 pt-3 border-t border-border">
                <button 
                  className="w-full text-sm text-center text-blue-500 hover:text-blue-700"
                  onClick={() => handleOpenBadgeDialog(user)}
                >
                  Auszeichnungen hinzufügen
                </button>
              </div>
            )}
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

      {/* Badge management dialog */}
      <Dialog open={isBadgeDialogOpen} onOpenChange={setIsBadgeDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Auszeichnungen verwalten</DialogTitle>
            <DialogDescription>
              {userForBadges?.name ? `Auszeichnungen für ${userForBadges.name}` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {badgeCategories.map(category => (
              <div key={category.id} className="mb-6">
                <h3 className="text-lg font-medium mb-3">{category.name}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {availableBadges
                    .filter(badge => badge.category === category.id)
                    .map(badge => {
                      const isActive = userForBadges?.badges?.some(b => b.id === badge.id);
                      return (
                        <button
                          key={badge.id}
                          className={`flex items-center gap-2 p-2 rounded-md border ${
                            isActive 
                              ? 'border-primary bg-primary/10 text-primary' 
                              : 'border-border hover:bg-muted'
                          }`}
                          onClick={() => handleToggleBadge(badge.id)}
                        >
                          <span className="text-xl">{badge.icon}</span>
                          <span className="text-sm">{badge.name}</span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <button
              className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors"
              onClick={() => setIsBadgeDialogOpen(false)}
            >
              Abbrechen
            </button>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              onClick={handleSaveBadges}
            >
              Auszeichnungen speichern
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Team;
