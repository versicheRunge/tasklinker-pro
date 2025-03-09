
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import { 
  Users, 
  Home, 
  FolderOpen, 
  MessagesSquare, 
  BarChart3, 
  CheckSquare, 
  Archive,
  Settings,
  Goal,
  Calendar,
  Mail
} from 'lucide-react';

interface SidebarProps {
  isMobile?: boolean;
  closeMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isMobile = false, 
  closeMobileMenu
}) => {
  const { isAdmin } = useUser();
  const appName = localStorage.getItem('appName') || 'TruTeam';
  const appLogo = localStorage.getItem('appLogo') || 'TR';
  
  // Helper function to manage mobile menu closing
  const handleClick = () => {
    if (isMobile && closeMobileMenu) {
      closeMobileMenu();
    }
  };
  
  const linkClass = "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-primary/10 transition-colors";
  const activeLinkClass = "bg-primary/10 text-primary font-medium";
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center h-8 w-8 rounded bg-primary text-primary-foreground font-bold text-sm">
            {appLogo}
          </div>
          <span className="font-semibold text-lg">{appName}</span>
        </div>
      </div>
      
      <nav className="flex-1 p-2 space-y-1">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `${linkClass} ${isActive ? activeLinkClass : ''}`
          }
          onClick={handleClick}
        >
          <Home size={18} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink 
          to="/cases" 
          className={({ isActive }) => 
            `${linkClass} ${isActive || window.location.pathname.includes('/vorgaenge/') ? activeLinkClass : ''}`
          }
          onClick={handleClick}
        >
          <FolderOpen size={18} />
          <span>Vorgänge</span>
        </NavLink>

        <NavLink 
          to="/cases/archived" 
          className={({ isActive }) => 
            `${linkClass} ${isActive ? activeLinkClass : ''}`
          }
          onClick={handleClick}
        >
          <Archive size={18} />
          <span>Archiv</span>
        </NavLink>
        
        <NavLink 
          to="/chat" 
          className={({ isActive }) => 
            `${linkClass} ${isActive ? activeLinkClass : ''}`
          }
          onClick={handleClick}
        >
          <MessagesSquare size={18} />
          <span>Chat</span>
        </NavLink>

        <NavLink 
          to="/calendar" 
          className={({ isActive }) => 
            `${linkClass} ${isActive ? activeLinkClass : ''}`
          }
          onClick={handleClick}
        >
          <Calendar size={18} />
          <span>Kalender</span>
        </NavLink>
        
        <NavLink 
          to="/team" 
          className={({ isActive }) => 
            `${linkClass} ${isActive ? activeLinkClass : ''}`
          }
          onClick={handleClick}
        >
          <Users size={18} />
          <span>Team</span>
        </NavLink>
        
        <NavLink 
          to="/goals" 
          className={({ isActive }) => 
            `${linkClass} ${isActive ? activeLinkClass : ''}`
          }
          onClick={handleClick}
        >
          <Goal size={18} />
          <span>Ziele</span>
        </NavLink>
        
        {isAdmin && (
          <>
            <NavLink 
              to="/checklists" 
              className={({ isActive }) => 
                `${linkClass} ${isActive ? activeLinkClass : ''}`
              }
              onClick={handleClick}
            >
              <CheckSquare size={18} />
              <span>Checklisten</span>
            </NavLink>
            
            <NavLink 
              to="/reports" 
              className={({ isActive }) => 
                `${linkClass} ${isActive ? activeLinkClass : ''}`
              }
              onClick={handleClick}
            >
              <BarChart3 size={18} />
              <span>Berichte</span>
            </NavLink>
            
            <NavLink 
              to="/email-templates" 
              className={({ isActive }) => 
                `${linkClass} ${isActive ? activeLinkClass : ''}`
              }
              onClick={handleClick}
            >
              <Mail size={18} />
              <span>E-Mail-Vorlagen</span>
            </NavLink>
          </>
        )}
      </nav>
      
      <div className="p-2 mt-auto">
        <NavLink 
          to="/settings" 
          className={({ isActive }) => 
            `${linkClass} ${isActive ? activeLinkClass : ''}`
          }
          onClick={handleClick}
        >
          <Settings size={18} />
          <span>Einstellungen</span>
        </NavLink>
      </div>
    </div>
  );
};
