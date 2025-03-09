
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Cases from './pages/Cases';
import CaseDetails from './pages/CaseDetails';
import Team from './pages/Team';
import Checklists from './pages/Checklists';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import { Toaster } from "./components/ui/toaster";
import Login from './pages/Login';

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:id" element={<CaseDetails />} />
            <Route path="/team" element={<Team />} />
            <Route path="/checklists" element={<Checklists />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
