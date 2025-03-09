
import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/button';
import { toast } from "../hooks/use-toast";
import { TitleManager } from '../components/settings/TitleManager';
import { Shield, RefreshCw, Image, AlertTriangle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription,
  DialogClose
} from "../components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Input } from "../components/ui/input";

const Settings = () => {
  const { currentUser, isAdmin, changePassword } = useUser();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Hidden admin functionality
  const [adminClickCount, setAdminClickCount] = useState(0);
  const [showAdminAuth, setShowAdminAuth] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showLogoChange, setShowLogoChange] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newLogoText, setNewLogoText] = useState('');

  const handleAdminButtonClick = () => {
    const newCount = adminClickCount + 1;
    setAdminClickCount(newCount);
    
    if (newCount === 5) {
      setShowAdminAuth(true);
    }
  };
  
  const handleAdminAuth = () => {
    if (adminPassword === 'Life1s2good!') {
      setShowAdminPanel(true);
      setShowAdminAuth(false);
      setAdminClickCount(0);
      setAdminPassword('');
    } else {
      toast({
        title: "Fehler",
        description: "Falsches Passwort eingegeben.",
        variant: "destructive"
      });
    }
  };
  
  const resetAllData = () => {
    // Clear all localStorage data
    localStorage.clear();
    
    toast({
      title: "Daten zurückgesetzt",
      description: "Alle Daten wurden erfolgreich zurückgesetzt. Die Anwendung wird neu geladen."
    });
    
    // Reload the application after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
    
    setShowResetConfirm(false);
    setShowAdminPanel(false);
  };
  
  const changeAppIdentity = () => {
    if (!newAppName && !newLogoText) {
      toast({
        title: "Keine Änderungen",
        description: "Bitte geben Sie mindestens einen neuen Namen oder ein Logo-Kürzel ein."
      });
      return;
    }
    
    if (newAppName) {
      localStorage.setItem('appName', newAppName);
    }
    
    if (newLogoText) {
      localStorage.setItem('appLogo', newLogoText);
    }
    
    toast({
      title: "Anwendung aktualisiert",
      description: "Die Anwendungsidentität wurde erfolgreich aktualisiert. Die Änderungen werden nach einem Neuladen sichtbar."
    });
    
    // Force reload to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 1500);
    
    setShowLogoChange(false);
    setShowAdminPanel(false);
    setNewAppName('');
    setNewLogoText('');
  };

  const handleChangePassword = () => {
    if (!currentUser) return;
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Fehler",
        description: "Die neuen Passwörter stimmen nicht überein.",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword.length < 8) {
      toast({
        title: "Fehler",
        description: "Das neue Passwort muss mindestens 8 Zeichen lang sein.",
        variant: "destructive"
      });
      return;
    }
    
    const success = changePassword(currentUser.id, currentPassword, newPassword);
    
    if (success) {
      toast({
        title: "Passwort geändert",
        description: "Ihr Passwort wurde erfolgreich geändert."
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsDialogOpen(false);
    } else {
      toast({
        title: "Fehler",
        description: "Das aktuelle Passwort ist falsch.",
        variant: "destructive"
      });
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Einstellungen</h1>
        <p className="text-muted-foreground">Verwalten Sie Ihre Kontoeinstellungen und Anwendungspräferenzen.</p>
      </div>
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="account">Konto</TabsTrigger>
          {isAdmin && <TabsTrigger value="system">System</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="account">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Kontoinformationen</h2>
              {currentUser && (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Name</label>
                    <p className="mt-1">{currentUser.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">E-Mail</label>
                    <p className="mt-1">{currentUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Rolle</label>
                    <p className="mt-1">{currentUser.userRole === 'admin' ? 'Administrator' : 'Mitarbeiter'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Abteilung</label>
                    <p className="mt-1">{currentUser.department || 'Nicht angegeben'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Telefon</label>
                    <p className="mt-1">{currentUser.phone || 'Nicht angegeben'}</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-card rounded-lg border border-border p-6">
              <h2 className="text-xl font-bold mb-4">Sicherheit</h2>
              <p className="text-muted-foreground mb-6">
                Hier können Sie Ihre Sicherheitseinstellungen verwalten.
              </p>
              
              <Button onClick={() => setIsDialogOpen(true)}>
                Passwort ändern
              </Button>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Passwort ändern</DialogTitle>
                    <DialogDescription>
                      Geben Sie Ihr aktuelles Passwort und ein neues Passwort ein.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-medium" htmlFor="current-password">
                        Aktuelles Passwort
                      </label>
                      <input 
                        id="current-password"
                        type="password" 
                        className="w-full mt-1 p-2 border rounded-md"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium" htmlFor="new-password">
                        Neues Passwort
                      </label>
                      <input 
                        id="new-password"
                        type="password" 
                        className="w-full mt-1 p-2 border rounded-md"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium" htmlFor="confirm-password">
                        Passwort bestätigen
                      </label>
                      <input 
                        id="confirm-password"
                        type="password" 
                        className="w-full mt-1 p-2 border rounded-md"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Abbrechen
                    </Button>
                    <Button onClick={handleChangePassword}>
                      Passwort ändern
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </TabsContent>
        
        {isAdmin && (
          <TabsContent value="system">
            <div className="grid grid-cols-1 gap-6">
              {/* Titel Manager (nur für Admins) */}
              <TitleManager />
              
              {/* Versteckter Admin-Button */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold mb-2">Systemdiagnose</h2>
                    <p className="text-muted-foreground">
                      Prüfen Sie die Systemintegrität und führen Sie Wartungsaufgaben durch.
                    </p>
                  </div>
                  <button 
                    className="p-2 rounded-full hover:bg-muted transition-colors"
                    onClick={handleAdminButtonClick}
                    aria-label="Systemdiagnose"
                  >
                    <Shield className="w-5 h-5 text-muted-foreground" />
                  </button>
                </div>
                
                {/* Versteckte Funktionalitäten */}
                {/* Admin-Authentifizierung Dialog */}
                <Dialog open={showAdminAuth} onOpenChange={setShowAdminAuth}>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle>Administrator-Zugang</DialogTitle>
                      <DialogDescription>
                        Bitte geben Sie das Administrator-Passwort ein.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Input
                        type="password"
                        placeholder="Administrator-Passwort"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setShowAdminAuth(false);
                        setAdminClickCount(0);
                        setAdminPassword('');
                      }}>
                        Abbrechen
                      </Button>
                      <Button onClick={handleAdminAuth}>
                        Bestätigen
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Admin-Panel Dialog */}
                <Dialog open={showAdminPanel} onOpenChange={setShowAdminPanel}>
                  <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                      <DialogTitle>Administrator-Funktionen</DialogTitle>
                      <DialogDescription>
                        Erweiterte Systemfunktionen für Administratoren.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <Button 
                        variant="destructive" 
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => setShowResetConfirm(true)}
                      >
                        <RefreshCw className="w-4 h-4" />
                        Alle Daten zurücksetzen
                      </Button>
                      
                      <Button 
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => setShowLogoChange(true)}
                      >
                        <Image className="w-4 h-4" />
                        Logo und Namen ändern
                      </Button>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowAdminPanel(false)}>
                        Schließen
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Reset-Bestätigung Dialog */}
                <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
                  <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="w-5 h-5" />
                        Daten zurücksetzen
                      </DialogTitle>
                      <DialogDescription>
                        Sind Sie sicher, dass Sie alle Daten zurücksetzen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="font-bold text-center">Sind Sie wirklich sicher?</p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
                        Abbrechen
                      </Button>
                      <Button variant="destructive" onClick={resetAllData}>
                        Ja, alle Daten zurücksetzen
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                {/* Logo und Namen ändern Dialog */}
                <Dialog open={showLogoChange} onOpenChange={setShowLogoChange}>
                  <DialogContent className="sm:max-w-[450px]">
                    <DialogHeader>
                      <DialogTitle>Logo und Namen ändern</DialogTitle>
                      <DialogDescription>
                        Passen Sie das Erscheinungsbild der Anwendung an.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium" htmlFor="app-name">
                          Anwendungsname
                        </label>
                        <Input
                          id="app-name"
                          placeholder="Neuer Anwendungsname"
                          value={newAppName}
                          onChange={(e) => setNewAppName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium" htmlFor="logo-text">
                          Logo-Kürzel (max. 2 Zeichen)
                        </label>
                        <Input
                          id="logo-text"
                          placeholder="Kürzel (z.B. TR)"
                          value={newLogoText}
                          onChange={(e) => setNewLogoText(e.target.value.slice(0, 2))}
                          maxLength={2}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowLogoChange(false)}>
                        Abbrechen
                      </Button>
                      <Button onClick={changeAppIdentity}>
                        Anwenden
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
