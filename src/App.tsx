
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

// Create an Error Boundary component to catch rendering errors
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Etwas ist schiefgelaufen</h2>
          <p className="mb-4">Es gab ein Problem beim Laden dieser Seite.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-primary text-white rounded-md"
          >
            Seite neu laden
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

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
          <ErrorBoundary>
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
          </ErrorBoundary>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
