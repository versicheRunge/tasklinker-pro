
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginScreen } from '../components/auth/LoginScreen';
import { useUser } from '../contexts/UserContext';

const Login: React.FC = () => {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  
  // Wenn der Benutzer bereits angemeldet ist, direkt zur Startseite weiterleiten
  useEffect(() => {
    if (currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <LoginScreen />
    </div>
  );
};

export default Login;
