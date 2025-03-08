
import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { User, Shield, Bell, Eye, Database, Lock, Upload } from 'lucide-react';
import { CustomAvatar } from '../components/ui/CustomAvatar';
import { toast } from "../hooks/use-toast";

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    name: 'Max Schmidt',
    email: 'max.schmidt@beispiel.de',
    role: 'Administrator',
    department: 'Leitung',
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setProfileImage(e.target.result as string);
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
    toast({
      title: "Profil gespeichert",
      description: "Ihre Profiländerungen wurden erfolgreich gespeichert.",
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
              {['E-Mail Benachrichtigungen', 'Push-Benachrichtigungen', 'In-App Benachrichtigungen'].map((notification, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-input rounded-lg">
                  <span>{notification}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Darstellung</h2>
            <div className="space-y-4">
              <div>
                <p className="mb-2 font-medium">Farbmodus</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 border border-primary rounded-lg flex flex-col items-center">
                    <div className="w-16 h-16 bg-white border border-gray-200 rounded-md mb-2"></div>
                    <span>Hell</span>
                  </div>
                  <div className="p-4 border border-input rounded-lg flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-900 rounded-md mb-2"></div>
                    <span>Dunkel</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-2 font-medium">Schriftgröße</p>
                <input type="range" min="1" max="3" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Sicherheit</h2>
            <div className="space-y-4">
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
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  Passwort ändern
                </button>
              </div>
            </div>
          </div>
        );
      case 'data':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Daten & Speicher</h2>
            <div className="space-y-4">
              <div className="p-4 border border-input rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Datenspeicher</span>
                  <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">2.4 GB von 5 GB</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-primary h-2.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div className="p-4 border border-input rounded-lg">
                <h3 className="font-medium mb-2">Daten herunterladen</h3>
                <p className="text-sm text-muted-foreground mb-3">Sie können eine Kopie aller Ihrer Daten herunterladen.</p>
                <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                  Daten exportieren
                </button>
              </div>
              <div className="p-4 border border-input rounded-lg">
                <h3 className="font-medium mb-2 text-red-600">Daten löschen</h3>
                <p className="text-sm text-muted-foreground mb-3">Löscht alle Ihre Daten unwiderruflich aus unserem System.</p>
                <button className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors">
                  Daten löschen
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
              {['Daten für personalisierte Empfehlungen verwenden', 'Nutzungsdaten für Verbesserungen teilen', 'Tracking-Cookies akzeptieren'].map((option, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-input rounded-lg">
                  <span>{option}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={index === 0} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
              <div className="p-4 border border-input rounded-lg">
                <h3 className="font-medium mb-2">Datenschutzerklärung</h3>
                <p className="text-sm text-muted-foreground mb-3">Lesen Sie unsere vollständige Datenschutzerklärung.</p>
                <button className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
                  Datenschutzerklärung anzeigen
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return <div>Wählen Sie eine Option aus dem Menü.</div>;
    }
  };

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
