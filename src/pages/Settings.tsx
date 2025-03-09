
import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';
import { TitleManager } from '../components/settings/TitleManager';
import { EmailSignature } from '../components/settings/EmailSignature';

// Import icons
import { Moon, Sun, Type, Check, LucideProps } from 'lucide-react';

const Settings: React.FC = () => {
  const { currentUser, isAdmin } = useUser();
  const { theme, setTheme, fontSize, setFontSize, highContrast, setHighContrast } = useTheme();
  const [appName, setAppName] = useState('');
  const [appLogo, setAppLogo] = useState('');
  
  useEffect(() => {
    // Load app name and logo from localStorage
    const storedName = localStorage.getItem('appName');
    const storedLogo = localStorage.getItem('appLogo');
    
    if (storedName) setAppName(storedName);
    if (storedLogo) setAppLogo(storedLogo);
  }, []);
  
  // Font size options
  const fontSizeOptions = [
    { value: 1, label: 'Klein', icon: (props: LucideProps) => <Type {...props} size={16} /> },
    { value: 2, label: 'Normal', icon: (props: LucideProps) => <Type {...props} size={20} /> },
    { value: 3, label: 'Groß', icon: (props: LucideProps) => <Type {...props} size={24} /> }
  ];
  
  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        <h1 className="text-3xl font-bold mb-6">Einstellungen</h1>
        
        <div className="grid gap-8">
          {/* Appearance Settings */}
          <div className="bg-card p-6 rounded-lg border border-border shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Darstellung</h2>
            
            <div className="grid gap-6">
              {/* Theme Selector */}
              <div>
                <h3 className="text-base font-medium mb-2">Design</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border ${
                      theme === 'light' 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background border-border hover:bg-muted/50'
                    }`}
                  >
                    <Sun size={18} />
                    <span>Hell</span>
                    {theme === 'light' && <Check size={16} className="ml-1" />}
                  </button>
                  
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border ${
                      theme === 'dark' 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background border-border hover:bg-muted/50'
                    }`}
                  >
                    <Moon size={18} />
                    <span>Dunkel</span>
                    {theme === 'dark' && <Check size={16} className="ml-1" />}
                  </button>
                </div>
              </div>
              
              {/* Font Size Selector */}
              <div>
                <h3 className="text-base font-medium mb-2">Schriftgröße</h3>
                <div className="flex flex-wrap gap-4">
                  {fontSizeOptions.map(option => (
                    <button
                      key={option.value}
                      onClick={() => setFontSize(option.value as 1 | 2 | 3)}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border ${
                        fontSize === option.value 
                          ? 'bg-primary text-primary-foreground border-primary' 
                          : 'bg-background border-border hover:bg-muted/50'
                      }`}
                    >
                      {option.icon({ className: "mr-1" })}
                      <span>{option.label}</span>
                      {fontSize === option.value && <Check size={16} className="ml-1" />}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* High Contrast Mode */}
              <div>
                <h3 className="text-base font-medium mb-2">Kontrast</h3>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => setHighContrast(false)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border ${
                      !highContrast 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background border-border hover:bg-muted/50'
                    }`}
                  >
                    <span>Standard</span>
                    {!highContrast && <Check size={16} className="ml-1" />}
                  </button>
                  
                  <button
                    onClick={() => setHighContrast(true)}
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border ${
                      highContrast 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background border-border hover:bg-muted/50'
                    }`}
                  >
                    <span>Hoher Kontrast</span>
                    {highContrast && <Check size={16} className="ml-1" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Email Signature */}
          <EmailSignature />
          
          {/* Team Branding (Admin Only) */}
          {isAdmin && (
            <TitleManager />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
