import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { AppLayout } from '../components/layout/AppLayout';
import { TitleManager } from '../components/settings/TitleManager';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from "../hooks/use-toast";
import BadgeTemplatesManager from '../components/team/BadgeTemplatesManager';
import EmailTemplatesManager from '../components/settings/EmailTemplatesManager';
import { AgencySettings } from '../components/settings/AgencySettings';
import { AdminBoard } from '../components/admin/AdminBoard';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '../components/ui/button';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { isAdmin, user } = useAuth();

  // Passwort ändern
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const badgeCategories = [
    { id: 'achievement', name: 'Leistung' },
    { id: 'skill', name: 'Kompetenz' },
    { id: 'tenure', name: 'Zugehörigkeit' },
    { id: 'certification', name: 'Zertifizierung' },
    { id: 'special', name: 'Besondere Auszeichnung' }
  ];

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw !== confirmPw) { toast({ title: 'Fehler', description: 'Passwörter stimmen nicht überein.', variant: 'destructive' }); return; }
    if (newPw.length < 8) { toast({ title: 'Fehler', description: 'Mindestens 8 Zeichen.', variant: 'destructive' }); return; }
    setPwLoading(true);

    // Aktuelles Passwort prüfen
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: user?.email ?? '', password: currentPw });
    if (signInError) { toast({ title: 'Fehler', description: 'Aktuelles Passwort ist falsch.', variant: 'destructive' }); setPwLoading(false); return; }

    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); }
    else { toast({ title: 'Passwort geändert', description: 'Ihr Passwort wurde aktualisiert.' }); setCurrentPw(''); setNewPw(''); setConfirmPw(''); }
    setPwLoading(false);
  };

  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Einstellungen</h1>

        <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 flex-wrap">
            <TabsTrigger value="general">Allgemein</TabsTrigger>
            <TabsTrigger value="account">Konto</TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="agency">Agentur</TabsTrigger>
                <TabsTrigger value="admin">Admin-Board</TabsTrigger>
                <TabsTrigger value="badges">Auszeichnungen</TabsTrigger>
                <TabsTrigger value="email-templates">E-Mail-Vorlagen</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="general">
            <div className="grid gap-6">
              <TitleManager />
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="agency">
              <AgencySettings />
            </TabsContent>
          )}

          <TabsContent value="account">
            <div className="max-w-md">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-medium mb-4">Passwort ändern</h2>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  {[
                    { label: 'Aktuelles Passwort', value: currentPw, setter: setCurrentPw },
                    { label: 'Neues Passwort', value: newPw, setter: setNewPw },
                    { label: 'Passwort bestätigen', value: confirmPw, setter: setConfirmPw },
                  ].map(({ label, value, setter }) => (
                    <div key={label}>
                      <label className="text-sm font-medium mb-1 block">{label}</label>
                      <div className="relative">
                        <input
                          type={showPw ? 'text' : 'password'}
                          value={value}
                          onChange={e => setter(e.target.value)}
                          className="w-full pl-10 pr-10 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background text-sm"
                          required
                        />
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => setShowPw(!showPw)} className="text-sm text-muted-foreground flex items-center gap-1">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showPw ? 'Passwörter verbergen' : 'Passwörter anzeigen'}
                  </button>
                  <Button type="submit" disabled={pwLoading} className="w-full">
                    {pwLoading ? 'Wird gespeichert...' : 'Passwort ändern'}
                  </Button>
                </form>
              </div>
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="admin">
              <div className="bg-card rounded-lg border border-border p-6">
                <AdminBoard />
              </div>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="badges">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-medium mb-4">Auszeichnungen verwalten</h2>
                <BadgeTemplatesManager
                  badgeCategories={badgeCategories}
                  onBadgesUpdated={() => toast({ title: 'Auszeichnungen aktualisiert', description: 'Die Änderungen wurden gespeichert.' })}
                />
              </div>
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="email-templates">
              <div className="bg-card rounded-lg border border-border p-6">
                <h2 className="text-lg font-medium mb-4">E-Mail-Vorlagen verwalten</h2>
                <EmailTemplatesManager />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Settings;
