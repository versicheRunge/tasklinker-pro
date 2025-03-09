
import React, { createContext, useContext, useState, useEffect } from 'react';
import { users as initialUsers } from '../data/mockData';
import { User, Notification } from '../types/case';

export type UserRole = 'admin' | 'staff';

type UserContextType = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAdmin: boolean;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
};

// Convert mockData users to our User type with added userRole
const getInitialUsers = () => {
  const storedUsers = localStorage.getItem('users');
  if (storedUsers) {
    return JSON.parse(storedUsers);
  }
  
  return initialUsers.map((user, index) => ({
    ...user,
    // Only add email if it doesn't exist (now email is optional in the User type)
    ...(user.email ? {} : { email: `${user.name.toLowerCase().replace(' ', '.')}@beispiel.de` }),
    userRole: index === 0 ? 'admin' : 'staff',
    department: user.department || 'Allgemein',
    phone: user.phone || '',
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
  markNotificationAsRead: () => {},
  clearNotifications: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(getInitialUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(getInitialUsers()[0]); // Default to first user (admin)
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Save users to localStorage when they change
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(allUsers));
  }, [allUsers]);
  
  // Check for notifications on mount and when currentUser changes
  useEffect(() => {
    if (currentUser) {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        const allNotifications = JSON.parse(storedNotifications);
        const userNotifications = allNotifications[currentUser.id] || [];
        setNotifications(userNotifications);
      }
    }
  }, [currentUser]);
  
  const isAdmin = currentUser?.userRole === 'admin';
  
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser = {
      ...userData,
      id: `user-${Date.now()}`
    };
    setAllUsers(prev => [...prev, newUser as User]);
  };
  
  const updateUser = (id: string, userData: Partial<User>) => {
    setAllUsers(prev => 
      prev.map(user => user.id === id ? { ...user, ...userData } : user)
    );
    
    // Update current user if it's the one being updated
    if (currentUser?.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...userData } : prev);
    }
  };
  
  const deleteUser = (id: string) => {
    setAllUsers(prev => prev.filter(user => user.id !== id));
  };
  
  const markNotificationAsRead = (notificationId: string) => {
    if (!currentUser) return;
    
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
  };
  
  const clearNotifications = () => {
    if (!currentUser) return;
    
    const storedNotifications = localStorage.getItem('notifications');
    if (storedNotifications) {
      const allNotifications = JSON.parse(storedNotifications);
      allNotifications[currentUser.id] = [];
      localStorage.setItem('notifications', JSON.stringify(allNotifications));
      
      setNotifications([]);
    }
  };
  
  return (
    <UserContext.Provider 
      value={{ 
        currentUser, 
        setCurrentUser, 
        isAdmin, 
        users: allUsers, 
        addUser, 
        updateUser, 
        deleteUser,
        notifications,
        markNotificationAsRead,
        clearNotifications
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
