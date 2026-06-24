import React from 'react';
import { Button } from '../ui/button';
import { useGoogleCalendar } from '../../hooks/useGoogleCalendar';
import { CalendarDays, RefreshCw, Unlink, ExternalLink, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const GoogleCalendarSettings: React.FC = () => {
  const { isConfigured, isConnected, isLoading, events, error, connect, disconnect, refresh } = useGoogleCalendar();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-1">Google Kalender</h3>
        <p className="text-sm text-muted-foreground">
          Verbinden Sie Ihren Google Kalender, um Termine automatisch zu synchronisieren.
        </p>
      </div>

      {!isConfigured && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
          <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
            <p className="font-medium">Google Client ID fehlt</p>
            <p>Bitte fügen Sie <code className="bg-amber-100 dark:bg-amber-900 px-1 rounded">VITE_GOOGLE_CLIENT_ID</code> in Ihre <code>.env</code>-Datei ein.</p>
            <ol className="list-decimal ml-4 mt-2 space-y-1 text-xs">
              <li>Öffnen Sie die <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a></li>
              <li>Neues Projekt anlegen → APIs & Dienste → Google Calendar API aktivieren</li>
              <li>Anmeldedaten → OAuth 2.0-Client-ID erstellen (Typ: Webanwendung)</li>
              <li>Autorisierte JavaScript-Quellen: Ihre App-URL hinzufügen</li>
              <li>Client-ID kopieren und in <code>.env</code> einfügen: <code>VITE_GOOGLE_CLIENT_ID=...</code></li>
            </ol>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center gap-4 p-4 bg-card border border-border rounded-lg">
        <div className="flex items-center gap-3 flex-1">
          <div className={`p-2 rounded-full ${isConnected ? 'bg-green-100 dark:bg-green-900' : 'bg-muted'}`}>
            <CalendarDays className={`w-5 h-5 ${isConnected ? 'text-green-600' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <p className="font-medium text-sm">
              {isConnected ? 'Verbunden' : 'Nicht verbunden'}
            </p>
            {isConnected && (
              <p className="text-xs text-muted-foreground">
                {events.length} Ereignisse synchronisiert
              </p>
            )}
          </div>
          {isConnected && <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />}
        </div>
      </div>

      <div className="flex gap-2">
        {!isConnected ? (
          <Button onClick={connect} disabled={!isConfigured || isLoading} className="gap-2">
            <CalendarDays className="w-4 h-4" />
            {isLoading ? 'Verbinde…' : 'Google Kalender verbinden'}
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={refresh} disabled={isLoading} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Synchronisieren
            </Button>
            <Button variant="ghost" onClick={disconnect} className="gap-2 text-destructive hover:text-destructive">
              <Unlink className="w-4 h-4" />
              Trennen
            </Button>
          </>
        )}
      </div>

      {isConnected && events.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Nächste Google-Kalender-Ereignisse</p>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {events
              .filter(e => {
                const d = e.start.date ?? e.start.dateTime ?? '';
                return d >= new Date().toISOString().slice(0, 10);
              })
              .slice(0, 10)
              .map(e => {
                const dateStr = e.start.date
                  ? new Date(e.start.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
                  : e.start.dateTime
                    ? new Date(e.start.dateTime).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                    : '';
                return (
                  <div key={e.id} className="flex items-center gap-2 py-1.5 px-3 bg-muted/50 rounded text-sm">
                    <span className="text-muted-foreground w-12 shrink-0">{dateStr}</span>
                    <span className="truncate">{e.summary}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
