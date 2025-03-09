
import { useState, useEffect } from 'react';

export const useAccessControl = (masterPassword = 'admin123') => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  
  // Beim Laden der App prüfen, ob der Zugriff bereits authentifiziert ist
  useEffect(() => {
    const accessGranted = localStorage.getItem('accessGranted');
    if (accessGranted === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  
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
