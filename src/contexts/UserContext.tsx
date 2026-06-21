import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth, Profile } from './AuthContext';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { User } from '../types/case';
import { toast } from '../hooks/use-toast';
import { Notification } from '../types/chat';

const profileToUser = (p: Profile): User => {
  let displayRole: string;
  if (p.role === 'admin') {
    displayRole = 'Administrator';
  } else if (p.department === 'aussendienst') {
    displayRole = 'Außendienst';
  } else if (p.department === 'leitung') {
    displayRole = 'Agenturleitung';
  } else {
    displayRole = 'Innendienst';
  }
  return {
    id: p.id,
    name: p.full_name,
    email: p.email,
    phone: p.phone,
    role: displayRole,
    department: p.department,
    avatar: p.avatar_url,
    userRole: p.role === 'admin' ? 'admin' : 'staff',
    stats: { casesHandled: 0, inProgress: 0, completed: 0 },
    badges: p.badges ?? [],
  };
};

type UserContextType = {
  currentUser: User | null;
  isAdmin: boolean;
  users: User[];
  notifications: Notification[];
  addNotification: (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markNotificationsAsRead: (ids: string[]) => void;
  clearNotifications: () => void;
  mentionUser: (userId: string, caseId: string, message: string, type?: 'chat' | 'case' | 'system') => void;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  validatePassword: (userId: string, password: string) => boolean;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => boolean;
  setCurrentUser: (user: User | null) => void;
};

const UserContext = createContext<UserContextType>({
  currentUser: null,
  isAdmin: false,
  users: [],
  notifications: [],
  addNotification: () => {},
  markNotificationAsRead: () => {},
  markNotificationsAsRead: () => {},
  clearNotifications: () => {},
  mentionUser: () => {},
  addUser: () => {},
  updateUser: () => {},
  deleteUser: () => {},
  validatePassword: () => false,
  changePassword: () => false,
  setCurrentUser: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const currentUser = profile ? profileToUser(profile) : null;

  useEffect(() => {
    if (!profile) return;
    supabase.from('profiles').select('*').eq('is_active', true).then(({ data }) => {
      if (data) setUsers((data as Profile[]).map(profileToUser));
    });
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setNotifications(data.map((n: any) => ({
          id: n.id,
          title: n.title,
          message: n.body ?? '',
          timestamp: n.created_at,
          read: n.read,
          type: n.type,
          caseId: n.case_id,
          targetUserId: n.user_id,
        })));
      });
  }, [profile]);

  const addNotification = async (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!n.targetUserId) return;
    const { data } = await supabase.from('notifications').insert({
      user_id: n.targetUserId,
      title: n.title,
      body: n.message ?? null,
      type: n.type,
      case_id: n.caseId ?? null,
      read: false,
    }).select().single();
    if (data && n.targetUserId === profile?.id) {
      setNotifications(prev => [{
        id: data.id, title: data.title, message: data.body,
        timestamp: data.created_at, read: false, type: data.type,
        caseId: data.case_id, targetUserId: data.user_id,
      }, ...prev]);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markNotificationsAsRead = async (ids: string[]) => {
    await supabase.from('notifications').update({ read: true }).in('id', ids);
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, read: true } : n));
  };

  const clearNotifications = async () => {
    if (!profile) return;
    await supabase.from('notifications').delete().eq('user_id', profile.id);
    setNotifications([]);
  };

  const mentionUser = (userId: string, caseId: string, message: string, type: 'chat' | 'case' | 'system' = 'case') => {
    addNotification({ title: 'Sie wurden erwähnt', message, type, caseId, targetUserId: userId });
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      isAdmin,
      users,
      notifications,
      addNotification,
      markNotificationAsRead,
      markNotificationsAsRead,
      clearNotifications,
      mentionUser,
      addUser: async (userData: Omit<User, 'id'>) => {
        if (!supabaseAdmin) {
          toast({ title: 'Konfigurationsfehler', description: 'VITE_SUPABASE_SERVICE_KEY fehlt.', variant: 'destructive' });
          return;
        }
        // Generate a random temp password — user should reset via email
        const tempPassword = Math.random().toString(36).slice(-12) + 'Aa1!';
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userData.email ?? '',
          password: tempPassword,
          email_confirm: true,
        });
        if (authError || !authData.user) {
          toast({ title: 'Fehler beim Anlegen', description: authError?.message ?? 'Unbekannt', variant: 'destructive' });
          return;
        }
        // Upsert profile (trigger may already have created it)
        await supabaseAdmin.from('profiles').upsert({
          id: authData.user.id,
          email: userData.email ?? '',
          full_name: userData.name,
          phone: userData.phone ?? null,
          avatar_url: userData.avatar ?? null,
          department: userData.department ?? 'innendienst',
          role: userData.userRole === 'admin' ? 'admin' : 'staff',
          is_active: true,
        });
        const { data } = await supabase.from('profiles').select('*').eq('is_active', true);
        if (data) setUsers((data as Profile[]).map(profileToUser));
        toast({ title: 'Benutzer angelegt', description: `${userData.name} wurde erfolgreich hinzugefügt.` });
      },
      updateUser: async (id: string, userData: Partial<User>) => {
        const update: Record<string, any> = {};
        if (userData.name !== undefined)      update.full_name   = userData.name;
        if (userData.phone !== undefined)     update.phone       = userData.phone;
        if (userData.avatar !== undefined)    update.avatar_url  = userData.avatar;
        if (userData.department !== undefined)update.department  = userData.department;
        if (userData.badges !== undefined)    update.badges      = userData.badges;
        if (userData.userRole !== undefined) update.role = userData.userRole === 'admin' ? 'admin' : 'staff';
        if (userData.role !== undefined && !userData.userRole) update.role = userData.role;
        if (Object.keys(update).length > 0) {
          await supabase.from('profiles').update(update).eq('id', id);
          const { data } = await supabase.from('profiles').select('*').eq('is_active', true);
          if (data) setUsers((data as Profile[]).map(profileToUser));
        }
      },
      deleteUser: async (id: string) => {
        if (!supabaseAdmin) return;
        await supabase.from('profiles').update({ is_active: false }).eq('id', id);
        const { data } = await supabase.from('profiles').select('*').eq('is_active', true);
        if (data) setUsers((data as Profile[]).map(profileToUser));
      },
      validatePassword: () => false,
      changePassword: () => false,
      setCurrentUser: () => {},
    }}>
      {children}
    </UserContext.Provider>
  );
};
