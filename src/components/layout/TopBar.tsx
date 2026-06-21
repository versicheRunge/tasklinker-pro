
import React, { useState } from 'react';
import { Sun, Moon, Menu as MenuIcon, LogOut } from 'lucide-react';
import { CustomAvatar } from '../ui/CustomAvatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useTheme } from '../../contexts/ThemeContext';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../hooks/use-toast';
import { NotificationBell } from './NotificationBell';

interface TopBarProps {
  onMenuClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onMenuClick }) => {
  const { setTheme, theme } = useTheme();
  const { currentUser, setCurrentUser } = useUser();
  const navigate = useNavigate();

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleLogout = () => {
    setCurrentUser(null);
    toast({ title: 'Abmeldung erfolgreich', description: 'Sie wurden erfolgreich abgemeldet.' });
    navigate('/login');
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
          
          <NotificationBell />
          
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
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
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
