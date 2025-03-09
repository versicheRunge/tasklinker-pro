
import React, { useState, useEffect } from 'react';
import { AppLayout } from "../components/layout/AppLayout";
import { TitleManager } from "../components/settings/TitleManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { toast } from '../hooks/use-toast';

const Settings = () => {
  const [teamName, setTeamName] = useState('');
  const [teamLogo, setTeamLogo] = useState('');
  
  useEffect(() => {
    // Load current settings
    const savedAppName = localStorage.getItem('appName') || 'TruTeam';
    const savedAppLogo = localStorage.getItem('appLogo') || 'TR';
    
    setTeamName(savedAppName);
    setTeamLogo(savedAppLogo);
  }, []);
  
  const handleSaveSettings = () => {
    // Save to localStorage
    localStorage.setItem('appName', teamName);
    localStorage.setItem('appLogo', teamLogo);
    
    toast({
      title: "Einstellungen gespeichert",
      description: "Team-Name und Logo wurden erfolgreich aktualisiert. Die Änderungen sind sofort sichtbar."
    });
    
    // Force a page reload to apply changes immediately
    window.location.reload();
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-8">Einstellungen</h1>
        
        <Tabs defaultValue="general">
          <TabsList className="mb-6">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="display">Darstellung</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <TitleManager />
          </TabsContent>
          
          <TabsContent value="branding">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Team Branding</CardTitle>
                <CardDescription>
                  Passen Sie den Namen und das Logo Ihres Teams an
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Name</label>
                  <Input
                    placeholder="Firmenname eingeben"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Team Logo (Initialen, max. 2 Zeichen)</label>
                  <Input
                    placeholder="Logo (Initialen)"
                    value={teamLogo}
                    onChange={(e) => {
                      // Limit to 2 characters
                      if (e.target.value.length <= 2) {
                        setTeamLogo(e.target.value);
                      }
                    }}
                    maxLength={2}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings}>Einstellungen speichern</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="display">
            <Card>
              <CardHeader>
                <CardTitle>Darstellungsoptionen</CardTitle>
                <CardDescription>
                  Passen Sie die visuelle Darstellung der Anwendung an
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Darstellungsoptionen werden in einer zukünftigen Version verfügbar sein.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
