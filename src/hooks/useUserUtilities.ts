
import { Dispatch, SetStateAction } from 'react';
import { User } from '../types/case';

interface UserWithPassword extends User {
  password: string;
}

export function useUserUtilities(
  allUsers: UserWithPassword[],
  setAllUsers: Dispatch<SetStateAction<UserWithPassword[]>>
) {
  
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
  
  return {
    validatePassword,
    changePassword
  };
}
