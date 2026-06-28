import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { useAutoNotifications } from '../../hooks/useAutoNotifications';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  useAutoNotifications();

  // Close sidebar on navigation
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`${sidebarOpen ? 'block' : 'hidden'} md:block md:w-64 z-30 fixed inset-y-0 left-0 md:relative`}>
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 overflow-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
