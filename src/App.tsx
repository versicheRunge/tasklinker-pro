
import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from './components/ui/toaster';
import { UserProvider } from './contexts/UserContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import Login from './pages/Login';
import Index from './pages/Index';
import Cases from './pages/Cases';
import CaseDetails from './pages/CaseDetails';
import Team from './pages/Team';
import Checklists from './pages/Checklists';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import Chat from './pages/Chat';
import Goals from './pages/Goals';
import Calendar from './pages/Calendar';

// Geschützte Route Komponente
import { useUser } from './contexts/UserContext';

// Initialize AppUtils
import { initializeApp } from './utils/AppInit';

// Protected Route für Admin-Only Seiten
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAdmin, currentUser } = useUser();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient();

function App() {
  // Initialize app data
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Index />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/cases/archived" element={<Cases />} />
              <Route path="/vorgaenge/:id" element={<CaseDetails />} />
              <Route path="/team" element={<Team />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/checklists" element={
                <AdminRoute>
                  <Checklists />
                </AdminRoute>
              } />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/reports" element={
                <AdminRoute>
                  <Reports />
                </AdminRoute>
              } />
              <Route path="/settings" element={<Settings />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Router>
          <Toaster />
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
