
import React, { createContext, useContext, useState } from 'react';
import { users } from '../data/mockData';

export type UserRole = 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  role: string;
  userRole: UserRole;
}

type UserContextType = {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isAdmin: boolean;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
};

// Convert mockData users to our User type with added userRole
const extendedUsers: User[] = users.map((user, index) => ({
  ...user,
  // Only add email if it doesn't exist (now email is optional in the User type)
  ...(user.email ? {} : { email: `${user.name.toLowerCase().replace(' ', '.')}@beispiel.de` }),
  userRole: index === 0 ? 'admin' : 'staff'
}));

const UserContext = createContext<UserContextType>({
  currentUser: null,
  setCurrentUser: () => {},
  isAdmin: false,
  users: [],
  addUser: () => {},
  updateUser: () => {},
  deleteUser: () => {},
});

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(extendedUsers);
  const [currentUser, setCurrentUser] = useState<User | null>(extendedUsers[0]); // Default to first user (admin)
  
  const isAdmin = currentUser?.userRole === 'admin';
  
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser = {
      ...userData,
      id: `user-${Date.now()}`
    };
    setAllUsers(prev => [...prev, newUser]);
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
  
  return (
    <UserContext.Provider 
      value={{ 
        currentUser, 
        setCurrentUser, 
        isAdmin, 
        users: allUsers, 
        addUser, 
        updateUser, 
        deleteUser 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
