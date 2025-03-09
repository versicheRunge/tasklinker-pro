import React, { createContext, useContext, useState, useEffect } from 'react';
import { users as initialUsers } from '../data/mockData';
import { User, Notification } from '../types/case';

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
  clearNotifications: () => void;
  mentionUser: (userId: string, caseId: string, message: string) => void;
  validatePassword: (userId: string, password: string) => boolean;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => boolean;
};

// Convert mockData users to our User type with added userRole and default password
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
    password: 'password123', // Default password for all users
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
  clearNotifications: () => {},
  mentionUser: () => {},
  validatePassword: () => false,
  changePassword: () => false,
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<UserWithPassword[]>(getInitialUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(null); // Start with no logged in user
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
      id: `user-${Date.now()}`,
      password: 'password123' // Default password for new users
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
      return user.password === password;
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
    
    const storedNotifications = localStorage.getItem('notifications') || '{}';
    const allNotifications = JSON.parse(storedNotifications);
    
    const userId = notificationData.targetUserId || currentUser.id;
    const userNotifications = allNotifications[userId] || [];
    allNotifications[userId] = [newNotification, ...userNotifications];
    
    localStorage.setItem('notifications', JSON.stringify(allNotifications));
    
    if (userId === currentUser.id) {
      setNotifications(prev => [newNotification, ...prev]);
    }
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
  
  const mentionUser = (userId: string, caseId: string, message: string) => {
    const mentionedUser = allUsers.find(user => user.id === userId);
    if (!mentionedUser || !currentUser) return;
    
    const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
      title: `Erwähnung in einem Kommentar`,
      message: `${currentUser.name} hat Sie in einem Kommentar erwähnt: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`,
      caseId,
      targetUserId: userId
    };
    
    addNotification(notification);
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
