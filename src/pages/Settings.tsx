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
import { Lock, Eye, EyeOff, Download, CheckCircle2, FolderOpen, MonitorDown, Info, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { GoogleCalendarSettings } from '../components/settings/GoogleCalendarSettings';
import { useHints } from '../hooks/useHints';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { isAdmin, user } = useAuth();
  const { hintsEnabled, toggleHints } = useHints();

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
            <TabsTrigger value="integrations">Integrationen</TabsTrigger>
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

              {/* Benutzereinstellungen */}
              <div className="bg-card rounded-lg border border-border p-6 space-y-4">
                <h2 className="text-base font-semibold">Anzeigeoptionen</h2>

                {/* Hints toggle */}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Hilfe-Hinweise anzeigen</p>
                      <p className="text-xs text-muted-foreground">Info-Buttons und Erklärungstexte in der App</p>
                    </div>
                  </div>
                  <button
                    onClick={toggleHints}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${hintsEnabled ? 'bg-primary' : 'bg-muted'}`}
                    role="switch" aria-checked={hintsEnabled}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${hintsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Onboarding reset */}
                <div className="flex items-center justify-between py-2 border-t border-border/50">
                  <div className="flex items-center gap-3">
                    <RotateCcw className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">Erste-Schritte-Checkliste</p>
                      <p className="text-xs text-muted-foreground">Onboarding-Checkliste auf dem Dashboard wieder einblenden</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    localStorage.removeItem('onboarding_dismissed');
                    localStorage.removeItem('onboarding_progress');
                    toast({ title: 'Checkliste zurückgesetzt', description: 'Beim nächsten Dashboard-Besuch wieder sichtbar.' });
                  }}>
                    Einblenden
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value="agency">
              <AgencySettings />
            </TabsContent>
          )}

          <TabsContent value="integrations">
            <div className="space-y-6 max-w-xl">
              <div className="bg-card rounded-lg border border-border p-6">
                <GoogleCalendarSettings />
              </div>

              {/* Windows Explorer Protokoll */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                    <MonitorDown className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold">Explorer-Links (Windows)</h2>
                    <p className="text-sm text-muted-foreground">Datei- und Ordner-Verweise direkt per Klick öffnen</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-5">
                  Einmalige Installation pro Windows-PC. Danach öffnet ein Klick auf "Öffnen" bei jedem
                  Datei-Verweis direkt den Windows Explorer — kein Kopieren und Einfügen mehr.
                </p>

                <ol className="space-y-4 mb-6">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">1</span>
                    <div>
                      <p className="text-sm font-medium">Hilfsskript herunterladen und nach <code className="bg-muted px-1 py-0.5 rounded text-xs">C:\</code> speichern</p>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-2">Wichtig: direkt auf <code className="bg-muted px-1 py-0.5 rounded text-xs">C:\tasklinker-open.vbs</code> speichern, nicht in Downloads!</p>
                      <a href="/tasklinker-open.vbs" download className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 border border-border rounded-lg text-sm transition-colors">
                        <Download className="w-4 h-4" /> tasklinker-open.vbs
                      </a>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">2</span>
                    <div>
                      <p className="text-sm font-medium">Registry-Eintrag installieren</p>
                      <p className="text-xs text-muted-foreground mt-0.5 mb-2">Herunterladen und doppelklicken → Windows fragt "Möchten Sie fortfahren?" → <strong>Ja</strong></p>
                      <a href="/tasklinker-install.reg" download className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 border border-border rounded-lg text-sm transition-colors">
                        <Download className="w-4 h-4" /> tasklinker-install.reg
                      </a>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">Fertig — Browser neu starten</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Ab jetzt öffnet der "Öffnen"-Button in Vorgängen und Kundenstamm direkt den Explorer.</p>
                    </div>
                  </li>
                </ol>

                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                  <FolderOpen className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Muss auf <strong>jedem Windows-PC</strong> einmalig ausgeführt werden. Kein Admin-Recht nötig. Funktioniert in Chrome und Edge.</span>
                </div>

                <div className="mt-5 pt-5 border-t border-border">
                  <p className="text-sm font-medium mb-1">Mac-Version</p>
                  <p className="text-xs text-muted-foreground mb-3">Für macOS: Script herunterladen und per Doppelklick ausführen (Terminal öffnet sich kurz).</p>
                  <a href="/tasklinker-mac-install.command" download
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 border border-border rounded-lg text-sm transition-colors">
                    <Download className="w-4 h-4" /> tasklinker-mac-install.command
                  </a>
                  <p className="text-xs text-muted-foreground mt-2">Beim ersten Ausführen: Rechtsklick → Öffnen → Öffnen bestätigen (Gatekeeper-Schutz).</p>
                </div>
              </div>
            </div>
          </TabsContent>

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
