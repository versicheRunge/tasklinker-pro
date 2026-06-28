
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, CheckSquare, FileText, Users, Settings, BarChart3, MessageSquare, Target, Calendar, RefreshCw, ClipboardList, BookUser } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { Badge } from '../ui/badge';
import { useWvlCount } from '../../hooks/useWvlCount';
import { useAgencyName } from '../../hooks/useAgencyName';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { notifications, isAdmin } = useUser();
  const wvlCount = useWvlCount();
  const agencyName = useAgencyName();

  const chatNotifications = notifications.filter(n => n.type === 'chat' && !n.read).length;
  
  type NavItem = { name: string; path: string; icon: any; badge?: number; badgeAmber?: boolean };
  let navItems: NavItem[] = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Vorgänge', path: '/cases', icon: FileText },
    { name: 'Wiedervorlagen', path: '/wiedervorlagen', icon: RefreshCw, badge: wvlCount, badgeAmber: true },
    { name: 'Kunden', path: '/customers', icon: BookUser },
    { name: 'Aufgaben', path: '/tasks', icon: ClipboardList },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Kalender', path: '/calendar', icon: Calendar },
    { name: 'Chat', path: '/chat', icon: MessageSquare, badge: chatNotifications },
    { name: 'Ziele', path: '/goals', icon: Target },
    { name: 'Berichte', path: '/reports', icon: BarChart3 },
    { name: 'Einstellungen', path: '/settings', icon: Settings },
  ];

  // Add Checklists only for admin users
  if (isAdmin) {
    navItems.splice(2, 0, { name: 'Checklisten', path: '/checklists', icon: CheckSquare });
  }

  const isActive = (path: string) => location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

  return (
    <aside className="w-64 bg-sidebar border-r border-border h-screen sticky top-0 shrink-0">
      <div className="px-6 py-8">
        <div className="flex items-center space-x-2 mb-8">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">{agencyName.slice(0,2).toUpperCase()}</span>
          </div>
          <h1 className="text-base font-semibold truncate" title={agencyName}>{agencyName}</h1>
        </div>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary'
                  : 'text-foreground/70 hover:bg-muted hover:text-foreground'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-primary' : 'text-foreground/70'}`} />
              <span>{item.name}</span>
              {item.badge > 0 && (
                <Badge
                  variant={item.badgeAmber ? 'outline' : 'destructive'}
                  className={`ml-auto px-1.5 min-w-5 flex justify-center ${item.badgeAmber ? 'border-amber-400 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : ''}`}
                >
                  {item.badge}
                </Badge>
              )}
              {isActive(item.path) && !item.badge && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};
