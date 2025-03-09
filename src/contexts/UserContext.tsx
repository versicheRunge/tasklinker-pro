
import React, { createContext, useContext, useState, useEffect } from 'react';
import { users as initialUsers } from '../data/mockData';
import { User } from '../types/case';
import { UserRole } from './UserTypes';
import { Notification } from '../types/chat';
import { useNotifications } from '../hooks/useNotifications';
import { useUserUtilities } from '../hooks/useUserUtilities';

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
  
  const { 
    notifications, 
    addNotification, 
    markNotificationAsRead, 
    markNotificationsAsRead, 
    clearNotifications,
    mentionUser
  } = useNotifications(currentUser);
  
  const {
    validatePassword,
    changePassword
  } = useUserUtilities(allUsers, setAllUsers);
  
  // Initialize app settings
  useEffect(() => {
    // Set default app settings if not already in localStorage
    if (!localStorage.getItem('appName')) {
      localStorage.setItem('appName', 'TruTeam');
    }
    
    if (!localStorage.getItem('appLogo')) {
      localStorage.setItem('appLogo', 'TR');
    }
  }, []);

  // Load current user on mount
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

// Helper function moved from the main component
function getInitialUsers() {
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
}
