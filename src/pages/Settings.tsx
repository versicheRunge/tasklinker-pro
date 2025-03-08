import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { User, Shield, Bell, Eye, Database, Lock, Upload, Sun, Moon, Download, Trash2 } from 'lucide-react';
import { CustomAvatar } from '../components/ui/CustomAvatar';
import { toast } from "../hooks/use-toast";
import { useTheme } from '../contexts/ThemeContext';
import { useUser } from '../contexts/UserContext';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { currentUser, updateUser, isAdmin } = useUser();
  const { theme, setTheme, fontSize, setFontSize } = useTheme();
  
  const [userData, setUserData] = useState({
    name: currentUser?.name || 'Max Schmidt',
    email: currentUser?.email || 'max.schmidt@beispiel.de',
    role: currentUser?.role || 'Administrator',
    department: 'Leitung',
  });
  
  useEffect(() => {
    if (currentUser) {
      setUserData({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        department: 'Leitung',
      });
      if (currentUser.avatar) {
        setProfileImage(currentUser.avatar);
      }
    }
  }, [currentUser]);
  
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: false,
    inApp: true,
    updates: false,
    marketing: false,
  });
  
  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: theme,
    fontSize: fontSize,
    animations: true,
    highContrast: false,
  });
  
  useEffect(() => {
    setAppearanceSettings(prev => ({
      ...prev,
      theme,
      fontSize
    }));
  }, [theme, fontSize]);
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactor: false,
    sessionTimeout: '30',
    lastLogin: new Date().toLocaleDateString('de-DE'),
  });
  
  const [storageUsage, setStorageUsage] = useState({
    used: 2.4,
    total: 5,
    files: 34,
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    dataCollection: true,
    improvementData: true,
    cookies: true,
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const imageData = e.target.result as string;
          setProfileImage(imageData);
          if (currentUser) {
            updateUser(currentUser.id, { avatar: imageData });
          }
          toast({
            title: "Profilbild aktualisiert",
            description: "Ihr Profilbild wurde erfolgreich aktualisiert.",
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (currentUser) {
      updateUser(currentUser.id, { 
        name: userData.name,
        email: userData.email,
        role: userData.role
      });
    }
    toast({
      title: "Profil gespeichert",
      description: "Ihre Profiländerungen wurden erfolgreich gespeichert.",
    });
  };
  
  const handleChangeNotifications = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => {
      const updated = { ...prev, [setting]: !prev[setting] };
      toast({
        title: "Benachrichtigungseinstellungen aktualisiert",
        description: `${setting} ist jetzt ${updated[setting] ? 'aktiviert' : 'deaktiviert'}.`,
      });
      return updated;
    });
  };
  
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    setAppearanceSettings(prev => ({ ...prev, theme: newTheme }));
    toast({
      title: "Design geändert",
      description: `Design wurde auf ${newTheme === 'light' ? 'Hell' : 'Dunkel'} umgestellt.`,
    });
  };
  
  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const size = parseInt(e.target.value) as 1 | 2 | 3;
    setFontSize(size);
    setAppearanceSettings(prev => ({ ...prev, fontSize: size }));
  };

  const handleToggleAnimations = () => {
    setAppearanceSettings(prev => {
      const updated = { ...prev, animations: !prev.animations };
      toast({
        title: "Animationen",
        description: `Animationen wurden ${updated.animations ? 'aktiviert' : 'deaktiviert'}.`,
      });
      return updated;
    });
  };
  
  const handleToggleHighContrast = () => {
    setAppearanceSettings(prev => {
      const updated = { ...prev, highContrast: !prev.highContrast };
      toast({
        title: "Hoher Kontrast",
        description: `Hoher Kontrast wurde ${updated.highContrast ? 'aktiviert' : 'deaktiviert'}.`,
      });
      return updated;
    });
  };
  
  const handleSecurityChange = (setting: keyof typeof securitySettings, value: any) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
    if (setting === 'twoFactor') {
      toast({
        title: "Zwei-Faktor-Authentifizierung",
        description: `Zwei-Faktor-Authentifizierung wurde ${value ? 'aktiviert' : 'deaktiviert'}.`,
      });
    }
  };
  
  const handlePasswordChange = () => {
    toast({
      title: "Passwort geändert",
      description: "Ihr Passwort wurde erfolgreich geändert.",
    });
  };
  
  const handleDataExport = () => {
    toast({
      title: "Datenexport gestartet",
      description: "Ihre Daten werden vorbereitet und stehen bald zum Download bereit.",
    });
  };
  
  const handleDataDeletion = () => {
    toast({
      title: "Achtung",
      description: "Möchten Sie wirklich alle Ihre Daten löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
      variant: "destructive",
    });
  };
  
  const handlePrivacyToggle = (setting: keyof typeof privacySettings) => {
    setPrivacySettings(prev => {
      const updated = { ...prev, [setting]: !prev[setting] };
      toast({
        title: "Datenschutzeinstellungen aktualisiert",
        description: `${setting} ist jetzt ${updated[setting] ? 'aktiviert' : 'deaktiviert'}.`,
      });
      return updated;
    });
  };

  const navigationItems = [
    { id: 'profile', icon: User, label: 'Profil' },
    { id: 'notifications', icon: Bell, label: 'Benachrichtigungen' },
    { id: 'appearance', icon: Eye, label: 'Darstellung' },
    { id: 'security', icon: Shield, label: 'Sicherheit' },
    { id: 'data', icon: Database, label: 'Daten & Speicher' },
    { id: 'privacy', icon: Lock, label: 'Datenschutz' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-4">
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <CustomAvatar name={userData.name} imageSrc={profileImage || undefined} size="lg" />
                <div>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span>Profilbild hochladen</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full p-2 rounded-md border border-input"
                value={userData.name}
                onChange={(e) => setUserData({...userData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-2 rounded-md border border-input"
                value={userData.email}
                onChange={(e) => setUserData({...userData, email: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="role">
                Rolle
              </label>
              <select 
                id="role" 
                className="w-full p-2 rounded-md border border-input"
                value={userData.role}
                onChange={(e) => setUserData({...userData, role: e.target.value})}
              >
                <option>Administrator</option>
                <option>Team-Leiter</option>
                <option>Mitarbeiter</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="department">
                Abteilung
              </label>
              <select 
                id="department" 
                className="w-full p-2 rounded-md border border-input"
                value={userData.department}
                onChange={(e) => setUserData({...userData, department: e.target.value})}
              >
                <option>Leitung</option>
                <option>Schaden</option>
                <option>Vertrag</option>
                <option>Kundenservice</option>
              </select>
            </div>
            
            <div className="pt-4">
              <button 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                onClick={handleSaveProfile}
              >
                Speichern
              </button>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Benachrichtigungen</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                <div>
                  <span className="font-medium">E-Mail Benachrichtigungen</span>
                  <p className="text-sm text-muted-foreground">Erhalte wichtige Updates per E-Mail</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notificationSettings.email}
                    onChange={() => handleChangeNotifications('email')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                <div>
                  <span className="font-medium">Push-Benachrichtigungen</span>
                  <p className="text-sm text-muted-foreground">Erhalte Benachrichtigungen direkt auf deinem Gerät</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notificationSettings.push}
                    onChange={() => handleChangeNotifications('push')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                <div>
                  <span className="font-medium">In-App Benachrichtigungen</span>
                  <p className="text-sm text-muted-foreground">Zeige Benachrichtigungen innerhalb der Anwendung an</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notificationSettings.inApp}
                    onChange={() => handleChangeNotifications('inApp')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                <div>
                  <span className="font-medium">System-Updates</span>
                  <p className="text-sm text-muted-foreground">Benachrichtigungen über neue Funktionen</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notificationSettings.updates}
                    onChange={() => handleChangeNotifications('updates')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                <div>
                  <span className="font-medium">Marketing-E-Mails</span>
                  <p className="text-sm text-muted-foreground">Erhalte Angebote und Neuigkeiten</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={notificationSettings.marketing}
                    onChange={() => handleChangeNotifications('marketing')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="pt-4">
                <button 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  onClick={() => toast({
                    title: "Einstellungen gespeichert",
                    description: "Ihre Benachrichtigungseinstellungen wurden erfolgreich aktualisiert.",
                  })}
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Darstellung</h2>
            <div className="space-y-6">
              <div>
                <p className="mb-3 font-medium">Farbmodus</p>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    className={`p-4 border rounded-lg flex flex-col items-center cursor-pointer transition-all ${
                      appearanceSettings.theme === 'light' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-input hover:border-primary/50'
                    }`}
                    onClick={() => handleThemeChange('light')}
                  >
                    <div className="w-16 h-16 bg-white border border-gray-200 rounded-md mb-2 flex items-center justify-center">
                      <Sun className="text-amber-500" />
                    </div>
                    <span>Hell</span>
                  </div>
                  <div 
                    className={`p-4 border rounded-lg flex flex-col items-center cursor-pointer transition-all ${
                      appearanceSettings.theme === 'dark' 
                        ? 'border-primary bg-primary/5' 
                        : 'border-input hover:border-primary/50'
                    }`}
                    onClick={() => handleThemeChange('dark')}
                  >
                    <div className="w-16 h-16 bg-gray-900 rounded-md mb-2 flex items-center justify-center">
                      <Moon className="text-gray-200" />
                    </div>
                    <span>Dunkel</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <p className="font-medium">Schriftgröße</p>
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                    {appearanceSettings.fontSize === 1 ? 'Klein' : appearanceSettings.fontSize === 2 ? 'Mittel' : 'Groß'}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  value={appearanceSettings.fontSize}
                  onChange={handleFontSizeChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary" 
                />
                <div className="flex justify-between text-sm text-muted-foreground mt-1">
                  <span>Klein</span>
                  <span>Mittel</span>
                  <span>Groß</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                  <div>
                    <span className="font-medium">Animationen</span>
                    <p className="text-sm text-muted-foreground">Aktiviere Übergangsanimationen</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={appearanceSettings.animations}
                      onChange={handleToggleAnimations}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                  <div>
                    <span className="font-medium">Hoher Kontrast</span>
                    <p className="text-sm text-muted-foreground">Verbessert die Lesbarkeit</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={appearanceSettings.highContrast}
                      onChange={handleToggleHighContrast}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
              
              <div className="pt-4">
                <button 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  onClick={() => toast({
                    title: "Darstellung aktualisiert",
                    description: "Ihre Darstellungseinstellungen wurden erfolgreich gespeichert.",
                  })}
                >
                  Änderungen speichern
                </button>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Sicherheit</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                <div>
                  <span className="font-medium">Zwei-Faktor-Authentifizierung</span>
                  <p className="text-sm text-muted-foreground">Erhöht die Sicherheit Ihres Kontos</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={securitySettings.twoFactor}
                    onChange={(e) => handleSecurityChange('twoFactor', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div>
                <p className="font-medium mb-2">Automatische Abmeldung nach</p>
                <select 
                  className="w-full p-2 rounded-md border border-input"
                  value={securitySettings.sessionTimeout}
                  onChange={(e) => handleSecurityChange('sessionTimeout', e.target.value)}
                >
                  <option value="15">15 Minuten</option>
                  <option value="30">30 Minuten</option>
                  <option value="60">1 Stunde</option>
                  <option value="120">2 Stunden</option>
                  <option value="never">Nie (nicht empfohlen)</option>
                </select>
              </div>
              
              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="font-medium">Letzte Anmeldung</p>
                <p className="text-sm">{securitySettings.lastLogin} um 14:32 Uhr • Berlin</p>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-input">
                <h3 className="font-medium pt-2">Passwort ändern</h3>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="currentPassword">
                    Aktuelles Passwort
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    className="w-full p-2 rounded-md border border-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="newPassword">
                    Neues Passwort
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    className="w-full p-2 rounded-md border border-input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
                    Passwort bestätigen
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    className="w-full p-2 rounded-md border border-input"
                  />
                </div>
                <div className="pt-4">
                  <button 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    onClick={handlePasswordChange}
                  >
                    Passwort ändern
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'data':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Daten & Speicher</h2>
            <div className="space-y-6">
              <div className="p-4 border border-input rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Datenspeicher</span>
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                    {storageUsage.used.toFixed(1)} GB von {storageUsage.total} GB
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${(storageUsage.used / storageUsage.total) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{storageUsage.files} Dateien</span>
                  <span>{Math.round((storageUsage.used / storageUsage.total) * 100)}% belegt</span>
                </div>
              </div>
              
              <div className="p-4 border border-input rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium mb-1">Daten herunterladen</h3>
                    <p className="text-sm text-muted-foreground mb-3">Sie können eine Kopie aller Ihrer Daten herunterladen.</p>
                  </div>
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                    onClick={handleDataExport}
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportieren</span>
                  </button>
                </div>
              </div>
              
              <div className="p-4 border border-input rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium mb-1 text-red-600">Daten löschen</h3>
                    <p className="text-sm text-muted-foreground mb-3">Löscht alle Ihre Daten unwiderruflich aus unserem System.</p>
                  </div>
                  <button 
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    onClick={handleDataDeletion}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Löschen</span>
                  </button>
                </div>
              </div>
              
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
                <h3 className="font-medium text-amber-800 mb-1">Temporäre Dateien</h3>
                <p className="text-sm text-amber-700 mb-3">
                  {(storageUsage.used * 0.2).toFixed(1)} GB an temporären Dateien können bereinigt werden.
                </p>
                <button 
                  className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
                  onClick={() => {
                    toast({
                      title: "Cache geleert",
                      description: "Temporäre Dateien wurden erfolgreich gelöscht.",
                    });
                  }}
                >
                  Cache leeren
                </button>
              </div>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Datenschutz</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                <div>
                  <span className="font-medium">Daten für personalisierte Empfehlungen verwenden</span>
                  <p className="text-sm text-muted-foreground">Verbessert Ihr Nutzungserlebnis durch personalisierte Inhalte</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={privacySettings.dataCollection}
                    onChange={() => handlePrivacyToggle('dataCollection')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                <div>
                  <span className="font-medium">Nutzungsdaten für Verbesserungen teilen</span>
                  <p className="text-sm text-muted-foreground">Hilft uns, die Anwendung zu verbessern</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={privacySettings.improvementData}
                    onChange={() => handlePrivacyToggle('improvementData')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-input rounded-lg">
                <div>
                  <span className="font-medium">Tracking-Cookies akzeptieren</span>
                  <p className="text-sm text-muted-foreground">Ermöglicht das Tracking Ihrer Aktivitäten</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={privacySettings.cookies}
                    onChange={() => handlePrivacyToggle('cookies')}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="p-4 border border-input rounded-lg">
                <h3 className="font-medium mb-2">Datenschutzerklärung</h3>
                <p className="text-sm text-muted-foreground mb-3">Lesen Sie unsere vollständige Datenschutzerklärung.</p>
                <button 
                  className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  onClick={() => {
                    toast({
                      title: "Datenschutzerklärung",
                      description: "Die Datenschutzerklärung wurde in einem neuen Tab geöffnet.",
                    });
                  }}
                >
                  Datenschutzerklärung anzeigen
                </button>
              </div>
              
              <div className="pt-4">
                <button 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  onClick={() => toast({
                    title: "Datenschutzeinstellungen gespeichert",
                    description: "Ihre Datenschutzeinstellungen wurden erfolgreich aktualisiert.",
                  })}
                >
                  Einstellungen speichern
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Wählen Sie eine Option aus dem Menü.</div>;
    }
  };

  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Einstellungen</h1>
            <p className="text-muted-foreground">Verwalte deine persönlichen Einstellungen.</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Eingeschränkter Zugriff</h2>
          <p className="text-muted-foreground">
            Sie haben keinen Administratorzugriff. Bitte kontaktieren Sie Ihren Administrator, um Änderungen an den Systemeinstellungen vorzunehmen.
          </p>
          <div className="mt-6">
            <button 
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              onClick={() => window.history.back()}
            >
              Zurück
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Einstellungen</h1>
          <p className="text-muted-foreground">Verwalte deine persönlichen und Anwendungseinstellungen.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-primary' : 'text-foreground/70'}`} />
                <span>{item.label}</span>
                {activeTab === item.id && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 bg-card rounded-xl border border-border p-6">
          {renderContent()}
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
