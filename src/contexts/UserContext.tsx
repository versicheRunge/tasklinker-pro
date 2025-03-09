import React, { createContext, useContext, useState, useEffect } from 'react';
import { users as initialUsers } from '../data/mockData';
import { User } from '../types/case';
import { Notification } from '../types/chat';
import { toast } from "../hooks/use-toast";

export type UserRole = 'admin' | 'staff';

interface UserWithPassword extends User {
  password: string;
}

type UserContextType = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAdmin: boolean;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markNotificationsAsRead: (ids: string[]) => void;
  clearNotifications: () => void;
  mentionUser: (userId: string, caseId: string, message: string, type?: 'chat' | 'case' | 'system') => void;
  validatePassword: (userId: string, password: string) => boolean;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => boolean;
};

const getInitialUsers = () => {
  const storedUsers = localStorage.getItem('users');
  if (storedUsers) {
    try {
      const parsedUsers = JSON.parse(storedUsers);
      
      const validatedUsers = parsedUsers.map((user: any) => {
        if (!user.password) {
          return { ...user, password: 'password123' };
        }
        return user;
      });
      
      return validatedUsers;
    } catch (e) {
      console.error('Error parsing stored users:', e);
    }
  }
  
  console.log('Creating default users with passwords');
  return initialUsers.map((user, index) => ({
    ...user,
    ...(user.email ? {} : { email: `${user.name.toLowerCase().replace(' ', '.')}@beispiel.de` }),
    userRole: index === 0 ? 'admin' : 'staff',
    department: user.department || 'Allgemein',
    phone: user.phone || '',
    password: 'password123',
    stats: user.stats || {
      casesHandled: 0,
      completed: 0,
      inProgress: 0
    }
  }));
};

const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  isAdmin: false,
  users: [],
  addUser: () => {},
  updateUser: () => {},
  deleteUser: () => {},
  notifications: [],
  addNotification: () => {},
  markNotificationAsRead: () => {},
  markNotificationsAsRead: () => {},
  clearNotifications: () => {},
  mentionUser: () => {},
  validatePassword: () => false,
  changePassword: () => false,
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserWithPassword[]>(getInitialUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId');
    if (savedUserId) {
      const user = allUsers.find(u => u.id === savedUserId);
      if (user) {
        const { password, ...userWithoutPassword } = user;
        setCurrentUser(userWithoutPassword);
      }
    }
  }, [allUsers]);
  
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUserId', currentUser.id);
    } else {
      localStorage.removeItem('currentUserId');
    }
  }, [currentUser]);
  
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(allUsers));
  }, [allUsers]);
  
  useEffect(() => {
    if (currentUser) {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        try {
          const allNotifications = JSON.parse(storedNotifications);
          const userNotifications = allNotifications[currentUser.id] || [];
          setNotifications(userNotifications);
        } catch (error) {
          console.error('Error parsing notifications:', error);
          setNotifications([]);
        }
      }
    }
  }, [currentUser]);
  
  const isAdmin = currentUser?.userRole === 'admin';
  
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser = {
      ...userData,
      id: `user-${Date.now()}`,
      password: 'password123'
    };
    setAllUsers(prev => [...prev, newUser as UserWithPassword]);
  };
  
  const updateUser = (id: string, userData: Partial<User>) => {
    setAllUsers(prev => 
      prev.map(user => user.id === id ? { ...user, ...userData } : user)
    );
    
    if (currentUser?.id === id) {
      const { password, ...updatedUserData } = userData as any;
      setCurrentUser(prev => prev ? { ...prev, ...updatedUserData } : prev);
    }
  };
  
  const deleteUser = (id: string) => {
    setAllUsers(prev => prev.filter(user => user.id !== id));
  };
  
  const validatePassword = (userId: string, password: string) => {
    console.log('Validating password for user ID:', userId);
    console.log('Provided password:', password);
    
    const user = allUsers.find(u => u.id === userId);
    console.log('User found:', user ? 'yes' : 'no');
    
    if (user) {
      console.log('Stored password:', user.password);
      const isValid = user.password === password;
      console.log('Password match:', isValid ? 'yes' : 'no');
      return isValid;
    }
    return false;
  };
  
  const changePassword = (userId: string, currentPassword: string, newPassword: string) => {
    const userIndex = allUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;
    
    const user = allUsers[userIndex];
    if (user.password !== currentPassword) return false;
    
    const updatedUsers = [...allUsers];
    updatedUsers[userIndex] = { ...user, password: newPassword };
    setAllUsers(updatedUsers);
    
    return true;
  };
  
  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (!currentUser) return;
    
    const newNotification: Notification = {
      ...notificationData,
      id: `notification-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    try {
      const storedNotifications = localStorage.getItem('notifications') || '{}';
      const allNotifications = JSON.parse(storedNotifications);
      
      const userId = notificationData.targetUserId || currentUser.id;
      const userNotifications = allNotifications[userId] || [];
      allNotifications[userId] = [newNotification, ...userNotifications];
      
      localStorage.setItem('notifications', JSON.stringify(allNotifications));
      
      if (userId === currentUser.id) {
        setNotifications(prev => [newNotification, ...prev]);
      }
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  };
  
  const markNotificationAsRead = (notificationId: string) => {
    if (!currentUser) return;
    
    try {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        const allNotifications = JSON.parse(storedNotifications);
        const userNotifications = allNotifications[currentUser.id] || [];
        
        const updatedUserNotifications = userNotifications.map((notification: Notification) => 
          notification.id === notificationId ? { ...notification, read: true } : notification
        );
        
        allNotifications[currentUser.id] = updatedUserNotifications;
        localStorage.setItem('notifications', JSON.stringify(allNotifications));
        
        setNotifications(updatedUserNotifications);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const markNotificationsAsRead = (notificationIds: string[]) => {
    if (!currentUser) return;
    
    try {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        const allNotifications = JSON.parse(storedNotifications);
        const userNotifications = allNotifications[currentUser.id] || [];
        
        const updatedUserNotifications = userNotifications.map((notification: Notification) => 
          notificationIds.includes(notification.id) ? { ...notification, read: true } : notification
        );
        
        allNotifications[currentUser.id] = updatedUserNotifications;
        localStorage.setItem('notifications', JSON.stringify(allNotifications));
        
        setNotifications(updatedUserNotifications);
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };
  
  const clearNotifications = () => {
    if (!currentUser) return;
    
    try {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        const allNotifications = JSON.parse(storedNotifications);
        allNotifications[currentUser.id] = [];
        localStorage.setItem('notifications', JSON.stringify(allNotifications));
        
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };
  
  const mentionUser = (userId: string, caseId: string, message: string, type: 'chat' | 'case' | 'system' = 'case') => {
    if (!currentUser) return;
    
    const mentionedUser = allUsers.find(user => user.id === userId);
    if (!mentionedUser) {
      console.log(`User with ID ${userId} not found for mention`);
      return;
    }
    
    const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
      title: `Erwähnung in einem Kommentar`,
      message: `${currentUser.name} hat Sie in einem Kommentar erwähnt: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
      caseId,
      targetUserId: userId,
      type
    };
    
    try {
      const storedNotifications = localStorage.getItem('notifications') || '{}';
      const allNotifications = JSON.parse(storedNotifications);
      
      const userNotifications = allNotifications[userId] || [];
      const newNotification: Notification = {
        ...notification,
        id: `notification-${Date.now()}`,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      allNotifications[userId] = [newNotification, ...userNotifications];
      localStorage.setItem('notifications', JSON.stringify(allNotifications));
      
      console.log(`Benachrichtigung an ${mentionedUser.name} für Erwähnung in Vorgang ${caseId} gesendet`);
      
      toast({
        title: "Benutzer erwähnt",
        description: `${mentionedUser.name} wurde in Ihrem Kommentar erwähnt und benachrichtigt.`
      });
    } catch (error) {
      console.error('Error creating mention notification:', error);
    }
  };
  
  const usersWithoutPasswords = allUsers.map(({ password, ...user }) => user);
  
  return (
    <UserContext.Provider 
      value={{ 
        currentUser, 
        setCurrentUser, 
        isAdmin, 
        users: usersWithoutPasswords, 
        addUser, 
        updateUser, 
        deleteUser,
        notifications,
        addNotification,
        markNotificationAsRead,
        markNotificationsAsRead,
        clearNotifications,
        mentionUser,
        validatePassword,
        changePassword
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
