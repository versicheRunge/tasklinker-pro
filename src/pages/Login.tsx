
import React from 'react';
import { LoginScreen } from '../components/auth/LoginScreen';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <LoginScreen />
    </div>
  );
};

export default Login;
