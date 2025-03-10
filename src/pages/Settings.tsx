
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AppLayout } from '../components/layout/AppLayout';
import { TitleManager } from '../components/settings/TitleManager';
import { Dialog } from "../components/ui/dialog";
import { MasterPasswordPrompt } from '../components/auth/MasterPasswordPrompt';
import { useUser } from '../contexts/UserContext';
import { toast } from "../hooks/use-toast";
import BadgeTemplatesManager from '../components/team/BadgeTemplatesManager';
import EmailTemplatesManager from '../components/settings/EmailTemplatesManager';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const { isAdmin, currentUser, changePassword } = useUser();
  
  const badgeCategories = [
    { id: 'achievement', name: 'Leistung' },
    { id: 'skill', name: 'Kompetenz' },
    { id: 'tenure', name: 'Zugehörigkeit' },
    { id: 'certification', name: 'Zertifizierung' },
    { id: 'special', name: 'Besondere Auszeichnung' }
  ];

  const handlePasswordChange = (oldPassword: string, newPassword: string) => {
    if (currentUser && changePassword(currentUser.id, oldPassword, newPassword)) {
      setIsPasswordDialogOpen(false);
      toast({
        title: "Passwort geändert",
        description: "Ihr Passwort wurde erfolgreich aktualisiert."
      });
    } else {
      toast({
        title: "Fehler",
        description: "Das aktuelle Passwort ist nicht korrekt.",
        variant: "destructive"
      });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Einstellungen</h1>
        
        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="account">Konto</TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="badges">Auszeichnungen</TabsTrigger>
                <TabsTrigger value="email-templates">E-Mail-Vorlagen</TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="general">
            <div className="space-y-6">
              <div className="grid gap-6">
                <TitleManager />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="account">
            <div className="max-w-md space-y-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-medium mb-4">Passwort ändern</h2>
                <p className="text-muted-foreground mb-4">
                  Ändern Sie Ihr Passwort, um Ihr Konto zu schützen.
                </p>
                <button
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  onClick={() => setIsPasswordDialogOpen(true)}
                >
                  Passwort ändern
                </button>
              </div>
            </div>
          </TabsContent>
          
          {isAdmin && (
            <TabsContent value="badges">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-medium mb-4">Auszeichnungen verwalten</h2>
                <p className="text-muted-foreground mb-4">
                  Hier können Sie die Auszeichnungen verwalten, die Mitarbeitern zugewiesen werden können.
                </p>
                <BadgeTemplatesManager 
                  badgeCategories={badgeCategories}
                  onBadgesUpdated={() => {
                    toast({
                      title: "Auszeichnungen aktualisiert",
                      description: "Die Änderungen wurden gespeichert."
                    });
                  }}
                />
              </div>
            </TabsContent>
          )}
          
          {isAdmin && (
            <TabsContent value="email-templates">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-medium mb-4">E-Mail-Vorlagen verwalten</h2>
                <p className="text-muted-foreground mb-4">
                  Erstellen und bearbeiten Sie E-Mail-Vorlagen für verschiedene Anwendungsfälle.
                </p>
                <EmailTemplatesManager />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
      
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <MasterPasswordPrompt
          onSubmit={handlePasswordChange}
          onCancel={() => setIsPasswordDialogOpen(false)}
          mode="change"
        />
      </Dialog>
    </AppLayout>
  );
};

export default Settings;
