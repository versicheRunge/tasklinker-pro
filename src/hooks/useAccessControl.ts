
import { useState, useEffect } from 'react';

export const useAccessControl = (masterPassword = 'admin123') => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  
  // Check if access is already authenticated when the app loads
  useEffect(() => {
    const accessGranted = localStorage.getItem('accessGranted');
    if (accessGranted === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  
  // Function to validate the master password
  const validateAccess = (password: string) => {
    if (password === masterPassword) {
      localStorage.setItem('accessGranted', 'true');
      setIsAuthenticated(true);
      setError('');
      return true;
    } else {
      setError('Falsches Master-Passwort');
      return false;
    }
  };
  
  // Function to revoke access
  const revokeAccess = () => {
    localStorage.removeItem('accessGranted');
    setIsAuthenticated(false);
  };
  
  return {
    isAuthenticated,
    validateAccess,
    revokeAccess,
    error
  };
};
