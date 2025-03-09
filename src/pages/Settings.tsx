
import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Separator } from "../components/ui/separator";
import { Moon, Sun, UserCog, Eye, Download, LucideIcon, Contrast, Type } from 'lucide-react';
import { toast } from "../hooks/use-toast";
import { useUser } from '../contexts/UserContext';

// Add these types to better structure our settings
type ThemeMode = 'light' | 'dark' | 'system';
type ContrastMode = 'normal' | 'high';
type FontSize = 'small' | 'normal' | 'large';

interface ThemeSetting {
  mode: ThemeMode;
  contrast: ContrastMode;
  fontSize: FontSize;
}

interface SettingOption {
  icon: LucideIcon;
  name: string;
  description: string;
  value: string;
}

const Settings: React.FC = () => {
  const { currentUser, updateUser } = useUser();
  
  const [themeSettings, setThemeSettings] = useState<ThemeSetting>({
    mode: 'light',
    contrast: 'normal',
    fontSize: 'normal'
  });
  
  // Apply theme settings when they change
  useEffect(() => {
    // Apply theme mode
    document.documentElement.classList.remove('light', 'dark');
    if (themeSettings.mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.add(systemTheme);
    } else {
      document.documentElement.classList.add(themeSettings.mode);
    }
    
    // Apply contrast
    document.documentElement.classList.remove('contrast-normal', 'contrast-high');
    document.documentElement.classList.add(`contrast-${themeSettings.contrast}`);
    
    // Apply font size
    document.documentElement.classList.remove('text-small', 'text-normal', 'text-large');
    document.documentElement.classList.add(`text-${themeSettings.fontSize}`);
    
    // Add CSS variables for the different font sizes
    if (themeSettings.fontSize === 'small') {
      document.documentElement.style.setProperty('--font-size-base', '0.875rem');
    } else if (themeSettings.fontSize === 'normal') {
      document.documentElement.style.setProperty('--font-size-base', '1rem');
    } else if (themeSettings.fontSize === 'large') {
      document.documentElement.style.setProperty('--font-size-base', '1.125rem');
    }
    
  }, [themeSettings]);
  
  const modeOptions: SettingOption[] = [
    {
      icon: Sun,
      name: "Hell",
      description: "Helles Design für die Verwendung bei Tageslicht",
      value: "light"
    },
    {
      icon: Moon,
      name: "Dunkel",
      description: "Dunkles Design für die Verwendung bei Nacht",
      value: "dark"
    },
    {
      icon: Sun,
      name: "System",
      description: "Passt sich den Systemeinstellungen an",
      value: "system"
    }
  ];
  
  const contrastOptions: SettingOption[] = [
    {
      icon: Contrast,
      name: "Normal",
      description: "Standard-Kontrast",
      value: "normal"
    },
    {
      icon: Contrast,
      name: "Hoch",
      description: "Erhöhter Kontrast für bessere Lesbarkeit",
      value: "high"
    }
  ];
  
  const fontSizeOptions: SettingOption[] = [
    {
      icon: Type,
      name: "Klein",
      description: "Kleinere Schriftgröße",
      value: "small"
    },
    {
      icon: Type,
      name: "Normal",
      description: "Standard-Schriftgröße",
      value: "normal"
    },
    {
      icon: Type,
      name: "Groß",
      description: "Größere Schriftgröße für bessere Lesbarkeit",
      value: "large"
    }
  ];

  const handleThemeSettingChange = (key: keyof ThemeSetting, value: string) => {
    setThemeSettings(prev => ({ 
      ...prev, 
      [key]: value 
    }));
    
    const settingNames = {
      mode: 'Farbschema',
      contrast: 'Kontrast',
      fontSize: 'Schriftgröße'
    };
    
    toast({
      title: `${settingNames[key]} geändert`,
      description: `Die Einstellung wurde erfolgreich aktualisiert.`
    });
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Einstellungen</h1>
        <p className="text-muted-foreground">Verwalten Sie Ihre Benutzereinstellungen und Voreinstellungen.</p>
      </div>
      
      <Tabs defaultValue="appearance">
        <TabsList className="w-full max-w-md mb-6">
          <TabsTrigger value="appearance" className="flex-1">
            <Eye className="w-4 h-4 mr-2" />
            Darstellung
          </TabsTrigger>
          <TabsTrigger value="account" className="flex-1">
            <UserCog className="w-4 h-4 mr-2" />
            Konto
          </TabsTrigger>
          <TabsTrigger value="export" className="flex-1">
            <Download className="w-4 h-4 mr-2" />
            Datenexport
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="appearance" className="space-y-6">
          <div>
            <h2 className="text-xl font-medium mb-2">Farbschema</h2>
            <p className="text-muted-foreground mb-4">Wählen Sie ein Farbschema für die Benutzeroberfläche.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {modeOptions.map(option => (
                <button
                  key={option.value}
                  className={`flex flex-col items-center text-center p-4 rounded-xl border ${
                    themeSettings.mode === option.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                  }`}
                  onClick={() => handleThemeSettingChange('mode', option.value as ThemeMode)}
                >
                  <option.icon className={`w-8 h-8 mb-2 ${themeSettings.mode === option.value ? 'text-primary' : ''}`} />
                  <h3 className="font-medium">{option.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h2 className="text-xl font-medium mb-2">Kontrast</h2>
            <p className="text-muted-foreground mb-4">Passen Sie den Kontrast für bessere Lesbarkeit an.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contrastOptions.map(option => (
                <button
                  key={option.value}
                  className={`flex flex-col items-center text-center p-4 rounded-xl border ${
                    themeSettings.contrast === option.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                  }`}
                  onClick={() => handleThemeSettingChange('contrast', option.value as ContrastMode)}
                >
                  <option.icon className={`w-8 h-8 mb-2 ${themeSettings.contrast === option.value ? 'text-primary' : ''}`} />
                  <h3 className="font-medium">{option.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h2 className="text-xl font-medium mb-2">Schriftgröße</h2>
            <p className="text-muted-foreground mb-4">Passen Sie die Schriftgröße für bessere Lesbarkeit an.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {fontSizeOptions.map(option => (
                <button
                  key={option.value}
                  className={`flex flex-col items-center text-center p-4 rounded-xl border ${
                    themeSettings.fontSize === option.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                  }`}
                  onClick={() => handleThemeSettingChange('fontSize', option.value as FontSize)}
                >
                  <option.icon className={`w-8 h-8 mb-2 ${themeSettings.fontSize === option.value ? 'text-primary' : ''}`} />
                  <h3 className="font-medium">{option.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-6">
          <div>
            <h2 className="text-xl font-medium mb-2">Benutzerprofil</h2>
            <p className="text-muted-foreground mb-4">Verwalten Sie Ihre persönlichen Informationen.</p>
            
            {currentUser && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="name">
                      Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="w-full p-2 rounded-md border border-input"
                      defaultValue={currentUser.name}
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
                      defaultValue={currentUser.email || ''}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="role">
                    Position
                  </label>
                  <input
                    id="role"
                    type="text"
                    className="w-full p-2 rounded-md border border-input"
                    defaultValue={currentUser.role}
                  />
                </div>
                
                <div className="flex justify-end">
                  <button 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    onClick={() => {
                      const name = (document.getElementById('name') as HTMLInputElement).value;
                      const email = (document.getElementById('email') as HTMLInputElement).value;
                      const role = (document.getElementById('role') as HTMLInputElement).value;
                      
                      if (!name.trim() || !email.trim() || !role.trim()) {
                        toast({
                          title: "Fehler",
                          description: "Bitte füllen Sie alle Felder aus.",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      updateUser(currentUser.id, { name, email, role });
                      
                      toast({
                        title: "Profil aktualisiert",
                        description: "Ihre Profilinformationen wurden erfolgreich aktualisiert."
                      });
                    }}
                  >
                    Änderungen speichern
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h2 className="text-xl font-medium mb-2">Passwort ändern</h2>
            <p className="text-muted-foreground mb-4">Aktualisieren Sie Ihr Passwort für mehr Sicherheit.</p>
            
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>
              
              <div className="flex justify-end">
                <button 
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  onClick={() => {
                    toast({
                      title: "Passwort aktualisiert",
                      description: "Ihr Passwort wurde erfolgreich geändert."
                    });
                    
                    // Clear the password fields
                    const passwordFields = document.querySelectorAll('input[type="password"]');
                    passwordFields.forEach(field => (field as HTMLInputElement).value = '');
                  }}
                >
                  Passwort ändern
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-6">
          <div>
            <h2 className="text-xl font-medium mb-2">Datenexport</h2>
            <p className="text-muted-foreground mb-4">Exportieren Sie Ihre Daten in verschiedenen Formaten.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-medium mb-2">Alle Vorgänge</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Exportieren Sie alle Ihre Vorgänge als CSV- oder JSON-Datei.
                </p>
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    onClick={() => {
                      toast({
                        title: "Export gestartet",
                        description: "Der Export aller Vorgänge wurde gestartet. Die Datei wird in Kürze heruntergeladen."
                      });
                      
                      // Simulate download after a short delay
                      setTimeout(() => {
                        // Create a fake CSV data string
                        const csvData = "data:text/csv;charset=utf-8,ID,Title,Status,CreatedAt\n" +
                          "case-1,Schadenmeldung Auto,new,2023-01-01\n" +
                          "case-2,eVB Anfrage,completed,2023-01-02";
                          
                        const encodedUri = encodeURI(csvData);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "alle_vorgaenge.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }, 1000);
                    }}
                  >
                    CSV-Export
                  </button>
                  <button 
                    className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                    onClick={() => {
                      toast({
                        title: "Export gestartet",
                        description: "Der Export aller Vorgänge wurde gestartet. Die Datei wird in Kürze heruntergeladen."
                      });
                      
                      // Simulate download after a short delay
                      setTimeout(() => {
                        // Create a fake JSON data
                        const jsonData = "data:text/json;charset=utf-8," + 
                          encodeURIComponent(JSON.stringify([
                            { id: "case-1", title: "Schadenmeldung Auto", status: "new", createdAt: "2023-01-01" },
                            { id: "case-2", title: "eVB Anfrage", status: "completed", createdAt: "2023-01-02" }
                          ]));
                          
                        const link = document.createElement("a");
                        link.setAttribute("href", jsonData);
                        link.setAttribute("download", "alle_vorgaenge.json");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }, 1000);
                    }}
                  >
                    JSON-Export
                  </button>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-medium mb-2">Abgeschlossene Vorgänge</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Exportieren Sie nur abgeschlossene Vorgänge als CSV- oder JSON-Datei.
                </p>
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    onClick={() => {
                      toast({
                        title: "Export gestartet",
                        description: "Der Export der abgeschlossenen Vorgänge wurde gestartet. Die Datei wird in Kürze heruntergeladen."
                      });
                      
                      // Simulate download after a short delay
                      setTimeout(() => {
                        // Create a fake CSV data string for completed cases
                        const csvData = "data:text/csv;charset=utf-8,ID,Title,Status,CompletedAt\n" +
                          "case-2,eVB Anfrage,completed,2023-01-05\n" +
                          "case-4,Vertragsänderung,completed,2023-01-07";
                          
                        const encodedUri = encodeURI(csvData);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "abgeschlossene_vorgaenge.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }, 1000);
                    }}
                  >
                    CSV-Export
                  </button>
                  <button 
                    className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                    onClick={() => {
                      toast({
                        title: "Export gestartet",
                        description: "Der Export der abgeschlossenen Vorgänge wurde gestartet. Die Datei wird in Kürze heruntergeladen."
                      });
                      
                      // Simulate download after a short delay
                      setTimeout(() => {
                        // Create a fake JSON data for completed cases
                        const jsonData = "data:text/json;charset=utf-8," + 
                          encodeURIComponent(JSON.stringify([
                            { id: "case-2", title: "eVB Anfrage", status: "completed", completedAt: "2023-01-05" },
                            { id: "case-4", title: "Vertragsänderung", status: "completed", completedAt: "2023-01-07" }
                          ]));
                          
                        const link = document.createElement("a");
                        link.setAttribute("href", jsonData);
                        link.setAttribute("download", "abgeschlossene_vorgaenge.json");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }, 1000);
                    }}
                  >
                    JSON-Export
                  </button>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-medium mb-2">Archivierte Vorgänge</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Exportieren Sie archivierte Vorgänge als CSV- oder JSON-Datei.
                </p>
                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    onClick={() => {
                      toast({
                        title: "Export gestartet",
                        description: "Der Export der archivierten Vorgänge wurde gestartet. Die Datei wird in Kürze heruntergeladen."
                      });
                      
                      // Simulate download after a short delay
                      setTimeout(() => {
                        // Create a fake CSV data string for archived cases
                        const csvData = "data:text/csv;charset=utf-8,ID,Title,Status,ArchivedAt\n" +
                          "case-5,Alte Schadenmeldung,completed,2022-11-05\n" +
                          "case-6,Alter Vertrag,completed,2022-10-07";
                          
                        const encodedUri = encodeURI(csvData);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "archivierte_vorgaenge.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }, 1000);
                    }}
                  >
                    CSV-Export
                  </button>
                  <button 
                    className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
                    onClick={() => {
                      toast({
                        title: "Export gestartet",
                        description: "Der Export der archivierten Vorgänge wurde gestartet. Die Datei wird in Kürze heruntergeladen."
                      });
                      
                      // Simulate download after a short delay
                      setTimeout(() => {
                        // Create a fake JSON data for archived cases
                        const jsonData = "data:text/json;charset=utf-8," + 
                          encodeURIComponent(JSON.stringify([
                            { id: "case-5", title: "Alte Schadenmeldung", status: "completed", archivedAt: "2022-11-05" },
                            { id: "case-6", title: "Alter Vertrag", status: "completed", archivedAt: "2022-10-07" }
                          ]));
                          
                        const link = document.createElement("a");
                        link.setAttribute("href", jsonData);
                        link.setAttribute("download", "archivierte_vorgaenge.json");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }, 1000);
                    }}
                  >
                    JSON-Export
                  </button>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-lg font-medium mb-2">Einzelner Vorgang</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Exportieren Sie einen einzelnen Vorgang als PDF-Dokument.
                </p>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="caseId">
                    Vorgangs-ID
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="caseId"
                      type="text"
                      className="flex-1 p-2 rounded-md border border-input"
                      placeholder="z.B. case-1"
                    />
                    <button 
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      onClick={() => {
                        const caseId = (document.getElementById('caseId') as HTMLInputElement).value;
                        
                        if (!caseId.trim()) {
                          toast({
                            title: "Fehler",
                            description: "Bitte geben Sie eine Vorgangs-ID ein.",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        toast({
                          title: "Export gestartet",
                          description: `Der Export des Vorgangs ${caseId} wurde gestartet. Das PDF wird in Kürze erstellt.`
                        });
                        
                        // Simulate PDF creation after a short delay
                        setTimeout(() => {
                          toast({
                            title: "PDF erstellt",
                            description: `Das PDF für den Vorgang ${caseId} wurde erfolgreich erstellt und wird heruntergeladen.`
                          });
                          
                          // In a real app, this would generate a PDF and download it
                          // For this demo, we'll just show a mock PDF generation
                          alert(`PDF für Vorgang ${caseId} würde jetzt heruntergeladen werden.`);
                        }, 1500);
                      }}
                    >
                      PDF exportieren
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
