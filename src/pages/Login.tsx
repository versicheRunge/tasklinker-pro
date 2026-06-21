import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginScreen } from '../components/auth/LoginScreen';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const { session, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && session) {
      navigate('/');
    }
  }, [session, isLoading, navigate]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <LoginScreen />
    </div>
  );
};

export default Login;
