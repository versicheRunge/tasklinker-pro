
import React, { useState, useEffect } from 'react';
import { Bell, User, X, Sun, Moon, Menu as MenuIcon, LogOut } from 'lucide-react';
import { CustomAvatar } from '../ui/CustomAvatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { User as UserType, Notification } from '../../types/case';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../hooks/use-toast';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { setTheme, theme } = useTheme();
  const { currentUser, setCurrentUser, notifications, markNotificationAsRead, clearNotifications } = useUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    toast({
      title: "Abmeldung erfolgreich",
      description: "Sie wurden erfolgreich abgemeldet.",
    });
    navigate('/login');
  };

  const handleNotificationClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    if (notification.caseId) {
      navigate(`/cases/${notification.caseId}`);
      setShowNotifications(false);
    }
  };

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 md:px-6">
        <button
          className="mr-2 rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground md:hidden"
          onClick={onMenuClick}
        >
          <MenuIcon className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </button>
        <div className="ml-auto flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-accent transition-colors relative"
            >
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 p-3 rounded-md border border-border bg-card shadow-md z-50">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Benachrichtigungen</h3>
                  <div className="flex gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={() => clearNotifications()}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Alle löschen
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-2 mb-1 rounded cursor-pointer ${
                          notification.read
                            ? "hover:bg-muted"
                            : "bg-muted/50 border-l-2 border-primary"
                        }`}
                      >
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.timestamp).toLocaleString('de-DE')}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Keine Benachrichtigungen
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full focus-visible:outline-none">
                <CustomAvatar
                  name={currentUser?.name || "Benutzer"}
                  imageSrc={currentUser?.avatar}
                  size="sm"
                />
                <span className="text-sm font-medium hidden sm:block">
                  {currentUser?.name || "Benutzer"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-3 py-2 text-sm">
                <div className="font-medium">{currentUser?.name}</div>
                <div className="text-muted-foreground text-xs">{currentUser?.email}</div>
                <div className="text-muted-foreground text-xs mt-1">
                  {currentUser?.userRole === 'admin' ? 'Administrator' : 'Mitarbeiter'}
                </div>
              </div>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Abmelden</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
