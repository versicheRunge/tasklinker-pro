import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, XCircle, RefreshCw, ExternalLink, Info, Eye, EyeOff, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';

const SETUP_STEPS = [
  'Öffne die Google Cloud Console: console.cloud.google.com',
  'Projekt auswählen (das bereits für den OAuth-Login existiert)',
  'APIs & Dienste → Anmeldedaten → "+ Anmeldedaten erstellen" → API-Schlüssel',
  'Schlüssel einschränken: Anwendungsbeschränkung = HTTP-Referrer (deine Domain), API-Einschränkung = Google Calendar API',
  'In Google Kalender: Kalendereinstellungen → "Diesen Kalender freigeben" → "Öffentlich zugänglich machen" aktivieren',
  'Kalender-ID findest du unter: Kalendereinstellungen → "Kalender-ID" (z.B. xxx@group.calendar.google.com)',
];

export const GoogleCalendarSettings: React.FC = () => {
  const { profile } = useAuth();
  const isAdmin = profile?.role === 'admin';

  const [calendarId, setCalendarId] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'ok' | 'error' | null>(null);
  const [testError, setTestError] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    supabase
      .from('agency_settings')
      .select('key, value')
      .in('key', ['gcal_calendar_id', 'gcal_api_key'])
      .then(({ data }) => {
        if (!data) return;
        const map = Object.fromEntries(data.map(r => [r.key, r.value]));
        if (map.gcal_calendar_id) setCalendarId(map.gcal_calendar_id);
        if (map.gcal_api_key) setApiKey(map.gcal_api_key);
        if (map.gcal_calendar_id && map.gcal_api_key) setConfigured(true);
      });
  }, []);

  const handleTest = async () => {
    if (!calendarId || !apiKey) return;
    setTesting(true); setTestResult(null); setTestError('');
    const encoded = encodeURIComponent(calendarId);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encoded}?key=${apiKey}`;
    try {
      const resp = await fetch(url);
      if (resp.ok) {
        setTestResult('ok');
      } else {
        const err = await resp.json().catch(() => ({}));
        setTestError(err?.error?.message ?? `HTTP ${resp.status}`);
        setTestResult('error');
      }
    } catch (e: any) {
      setTestError(e.message); setTestResult('error');
    }
    setTesting(false);
  };

  const handleSave = async () => {
    if (!isAdmin) return;
    setSaving(true);
    for (const row of [
      { key: 'gcal_calendar_id', value: calendarId },
      { key: 'gcal_api_key', value: apiKey },
    ]) {
      await supabase.from('agency_settings').upsert(row, { onConflict: 'key' });
    }
    setConfigured(true);
    toast({ title: 'Google Kalender gespeichert' });
    setSaving(false);
  };

  if (!isAdmin) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        {configured ? (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Google Teamkalender ist verbunden — Termine erscheinen automatisch im Kalender.
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Der Google Teamkalender wird von deinem Admin eingerichtet. Sobald konfiguriert, erscheinen Termine automatisch im Kalender.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Agentur-Teamkalender (Google)
          </h3>
          <button
            className="text-xs text-primary hover:underline flex items-center gap-1"
            onClick={() => setShowSetup(!showSetup)}
          >
            <Info className="w-3.5 h-3.5" />
            {showSetup ? 'Anleitung ausblenden' : 'Einrichtungsanleitung'}
          </button>
        </div>

        {showSetup && (
          <div className="rounded-lg bg-muted/50 border border-border p-4 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Einmalige Einrichtung in Google (5 Minuten):</p>
            {SETUP_STEPS.map((step, i) => (
              <div key={i} className="flex gap-2 text-xs text-muted-foreground">
                <span className="shrink-0 font-bold text-primary">{i + 1}.</span>
                <span>{step}</span>
              </div>
            ))}
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2">
              Der Kalender muss auf "Öffentlich" stehen, damit der API-Schlüssel funktioniert. Das bedeutet, die Terminstitel sind theoretisch von außen sichtbar — tragt keine vertraulichen Kundendaten in Termintitel ein.
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Kalender-ID</label>
            <input
              className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono"
              value={calendarId}
              onChange={e => { setCalendarId(e.target.value); setTestResult(null); }}
              placeholder="xxx@group.calendar.google.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground block mb-1">Google API-Schlüssel</label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                className="w-full px-3 py-2 pr-10 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                value={apiKey}
                onChange={e => { setApiKey(e.target.value); setTestResult(null); }}
                placeholder="AIzaSy…"
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowKey(!showKey)}
                type="button"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {testResult === 'ok' && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Verbindung erfolgreich — Kalender wird im Teamkalender angezeigt.
          </div>
        )}
        {testResult === 'error' && (
          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Verbindungsfehler</p>
              <p className="text-xs mt-0.5 opacity-80">{testError}</p>
              <p className="text-xs mt-1">Tipp: Kalender öffentlich schalten + API-Schlüssel für "Google Calendar API" freigeben.</p>
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-end">
          <button
            onClick={handleTest}
            disabled={!calendarId || !apiKey || testing}
            className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Teste…' : 'Verbindung testen'}
          </button>
          <button
            onClick={handleSave}
            disabled={!calendarId || !apiKey || saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Speichert…' : 'Speichern'}
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        <a
          href="https://console.cloud.google.com/apis/credentials"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary underline"
        >
          Google Cloud Console → API-Schlüssel erstellen
        </a>
      </div>
    </div>
  );
};
