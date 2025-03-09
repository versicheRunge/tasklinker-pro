
import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useUser } from '../contexts/UserContext';
import { Button } from '../components/ui/button';
import { toast } from "../hooks/use-toast";
import { TitleManager } from '../components/settings/TitleManager';
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

const Settings = () => {
  const { currentUser, isAdmin, changePassword } = useUser();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

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
            </div>
          </TabsContent>
        )}
      </Tabs>
    </AppLayout>
  );
};

export default Settings;
