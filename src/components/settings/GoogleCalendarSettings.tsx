import React, { useState, useEffect } from 'react';
import {
  Calendar, CheckCircle2, XCircle, RefreshCw, ExternalLink,
  Eye, EyeOff, Save, Info, Copy, Check, AlertTriangle, Trash2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';

const STEPS = [
  {
    n: 1,
    title: 'Google Calendar API aktivieren',
    text: 'console.cloud.google.com → APIs & Dienste → Bibliothek → "Google Calendar API" suchen → Aktivieren',
  },
  {
    n: 2,
    title: 'Dienstkonto erstellen',
    text: 'IAM & Verwaltung → Dienstkonten → "+ Dienstkonto erstellen" → Name z.B. "Teamkalender" → Erstellen → Weiter → Fertig',
  },
  {
    n: 3,
    title: 'JSON-Schlüssel herunterladen',
    text: 'Auf das neue Dienstkonto klicken → Schlüssel → Schlüssel hinzufügen → Neuen Schlüssel erstellen → JSON → Erstellen → Datei wird heruntergeladen',
  },
  {
    n: 4,
    title: 'JSON hier einfügen & speichern',
    text: 'Den Inhalt der heruntergeladenen .json-Datei vollständig in das Textfeld unten einfügen und speichern. Die angezeigte E-Mail-Adresse für Schritt 5 kopieren.',
  },
  {
    n: 5,
    title: 'Kalender freigeben',
    text: 'In Google Kalender: Kalendereinstellungen → "Freigabe & Berechtigungen" → E-Mail-Adresse aus Schritt 4 hinzufügen → Berechtigung: "Ereignisse anzeigen" → Senden',
  },
  {
    n: 6,
    title: 'Kalender-ID eintragen',
    text: 'Kalendereinstellungen → "Kalender integrieren" → Kalender-ID kopieren (z.B. xxx@group.calendar.google.com) und oben eintragen',
  },
];

export const GoogleCalendarSettings: React.FC = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [calendarId, setCalendarId] = useState('');
  const [jsonInput, setJsonInput] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [showJson, setShowJson] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'error' | null>(null);
  const [testError, setTestError] = useState('');
  const [configured, setConfigured] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    supabase
      .from('agency_settings')
      .select('key, value')
      .in('key', ['gcal_calendar_id', 'gcal_client_email', 'gcal_configured'])
      .then(({ data }) => {
        const map = Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
        if (map.gcal_calendar_id) setCalendarId(map.gcal_calendar_id);
        if (map.gcal_client_email) setClientEmail(map.gcal_client_email);
        if (map.gcal_configured === '1') setConfigured(true);
      });
  }, []);

  // Extract client_email live as user types JSON
  useEffect(() => {
    if (!jsonInput.trim()) return;
    try {
      const parsed = JSON.parse(jsonInput);
      if (parsed.client_email) setClientEmail(parsed.client_email);
    } catch {}
  }, [jsonInput]);

  const validateJson = (): string | null => {
    if (!jsonInput.trim()) return null; // no new JSON pasted, keep existing
    try {
      const p = JSON.parse(jsonInput);
      if (p.type !== 'service_account') return 'Kein Service-Account-JSON (type ≠ "service_account")';
      if (!p.private_key) return 'Fehlender private_key';
      if (!p.client_email) return 'Fehlende client_email';
      return null;
    } catch {
      return 'Ungültiges JSON — bitte den gesamten Inhalt der .json-Datei einfügen';
    }
  };

  const handleSave = async () => {
    if (!calendarId.trim()) {
      toast({ title: 'Kalender-ID fehlt', variant: 'destructive' });
      return;
    }

    const jsonError = validateJson();
    if (jsonError && jsonInput.trim()) {
      toast({ title: 'JSON-Fehler', description: jsonError, variant: 'destructive' });
      return;
    }

    // Must have EITHER new JSON or already configured
    if (!configured && !jsonInput.trim()) {
      toast({ title: 'Service-Account-JSON fehlt', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const upserts: { key: string; value: string }[] = [
      { key: 'gcal_calendar_id', value: calendarId.trim() },
      { key: 'gcal_configured', value: '1' },
    ];

    if (jsonInput.trim()) {
      const parsed = JSON.parse(jsonInput);
      upserts.push({ key: 'gcal_service_account', value: jsonInput.trim() });
      upserts.push({ key: 'gcal_client_email', value: parsed.client_email });
    }

    for (const row of upserts) {
      await supabase.from('agency_settings').upsert(row, { onConflict: 'key' });
    }

    setConfigured(true);
    setJsonInput(''); // clear after save — don't keep private key in state
    toast({ title: 'Google Kalender gespeichert', description: 'Kalender wird beim nächsten Refresh geladen.' });
    setSaving(false);
    setTestResult(null);
  };

  const handleTest = async () => {
    // Save first if there's unsaved JSON
    if (jsonInput.trim()) {
      await handleSave();
    }
    if (!configured && !jsonInput.trim()) return;

    setTesting(true);
    setTestResult(null);
    setTestError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const resp = await fetch(`${supabaseUrl}/functions/v1/calendar-proxy`, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        },
      });
      const data = await resp.json();
      if (resp.ok && !data.error) {
        setTestResult('ok');
        toast({ title: 'Verbindung erfolgreich', description: `${(data.items ?? []).length} Ereignisse geladen.` });
      } else {
        setTestError(data.error ?? `HTTP ${resp.status}`);
        setTestResult('error');
      }
    } catch (e: any) {
      setTestError(e.message);
      setTestResult('error');
    }
    setTesting(false);
  };

  const handleDisconnect = async () => {
    await supabase.from('agency_settings').delete().in('key', [
      'gcal_service_account', 'gcal_calendar_id', 'gcal_client_email', 'gcal_configured',
    ]);
    setConfigured(false);
    setCalendarId('');
    setClientEmail('');
    setJsonInput('');
    setTestResult(null);
    toast({ title: 'Google Kalender getrennt' });
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(clientEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (!isAdmin) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        {configured ? (
          <div className="flex items-center gap-2 text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Google Teamkalender ist verbunden — Termine erscheinen im Kalender.
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Der Google Teamkalender wird von deinem Admin eingerichtet.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Agentur-Teamkalender (Google)
            {configured && <CheckCircle2 className="w-4 h-4 text-green-500" />}
          </h3>
          <button
            onClick={() => setShowSteps(s => !s)}
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            {showSteps ? 'Anleitung ausblenden' : 'Einrichtungsanleitung'}
          </button>
        </div>

        {/* Step-by-step guide */}
        {showSteps && (
          <div className="rounded-xl bg-muted/40 border border-border p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Einrichtung (einmalig, ca. 5 Minuten)
            </p>
            {STEPS.map(s => (
              <div key={s.n} className="flex gap-3">
                <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center mt-0.5">
                  {s.n}
                </span>
                <div>
                  <p className="text-xs font-semibold">{s.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calendar ID */}
        <div>
          <label className="text-xs font-semibold text-muted-foreground block mb-1">
            Kalender-ID <span className="text-muted-foreground font-normal">(z.B. xxx@group.calendar.google.com)</span>
          </label>
          <input
            className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono"
            value={calendarId}
            onChange={e => { setCalendarId(e.target.value); setTestResult(null); }}
            placeholder="xxx@group.calendar.google.com"
          />
        </div>

        {/* Service Account JSON */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Service-Account-JSON
              {configured && !jsonInput && (
                <span className="ml-2 text-green-600 font-normal">✓ Konfiguriert (nur neu einfügen zum Ändern)</span>
              )}
            </label>
            {jsonInput && (
              <button onClick={() => setShowJson(v => !v)} className="text-xs text-muted-foreground flex items-center gap-1 hover:text-foreground">
                {showJson ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showJson ? 'Verbergen' : 'Anzeigen'}
              </button>
            )}
          </div>
          <textarea
            rows={showJson ? 6 : 3}
            value={showJson ? jsonInput : (jsonInput ? '••••••••••••••••••••••••••••••••' : '')}
            onChange={e => { if (showJson || !jsonInput) { setJsonInput(e.target.value); setTestResult(null); } }}
            onFocus={() => { if (!showJson) setShowJson(true); }}
            placeholder='Inhalt der heruntergeladenen .json-Datei hier einfügen…'
            className="w-full px-3 py-2 text-xs rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono resize-none"
          />
          {validateJson() && jsonInput.trim() && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />{validateJson()}
            </p>
          )}
        </div>

        {/* Show extracted client_email (needed for calendar sharing) */}
        {clientEmail && (
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                Schritt 5: Kalender mit dieser E-Mail freigeben
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 font-mono mt-1 break-all">{clientEmail}</p>
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                In Google Kalender → Kalendereinstellungen → Freigabe → diese E-Mail hinzufügen → "Ereignisse anzeigen"
              </p>
            </div>
            <button onClick={copyEmail} className="shrink-0 p-1 rounded text-blue-600 hover:bg-blue-100">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Test result */}
        {testResult === 'ok' && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Verbindung erfolgreich — Termine werden im Teamkalender angezeigt.
          </div>
        )}
        {testResult === 'error' && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Verbindungsfehler</p>
              <p className="text-xs mt-0.5 opacity-80">{testError}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          {configured && (
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Verbindung trennen
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleTest}
              disabled={(!configured && !jsonInput.trim()) || testing}
              className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-sm disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
              {testing ? 'Teste…' : 'Verbindung testen'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving || (!calendarId.trim())}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-40"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Speichert…' : 'Speichern'}
            </button>
          </div>
        </div>
      </div>

      {/* Warning about privacy — now positive framing */}
      <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl text-xs text-green-800 dark:text-green-300">
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
        <span>
          Der private Schlüssel wird sicher auf dem Server gespeichert und verlässt ihn nicht.
          Der Kalender bleibt <strong>vollständig privat</strong> — kein öffentlicher Zugriff nötig.
        </span>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        <a href="https://console.cloud.google.com/iam-admin/serviceaccounts"
          target="_blank" rel="noopener noreferrer" className="hover:text-primary underline">
          Google Cloud Console → Dienstkonten
        </a>
      </div>
    </div>
  );
};
