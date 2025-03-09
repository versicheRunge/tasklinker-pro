
import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { LoginScreen } from '../auth/LoginScreen';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useUser();
  const navigate = useNavigate();
  
  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    if (!currentUser && window.location.pathname !== '/login') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:w-64 z-30 fixed inset-y-0 left-0 md:relative`}>
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col">
        <TopBar onMenuClick={handleMenuClick} />
        <main className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
