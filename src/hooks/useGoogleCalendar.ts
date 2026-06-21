import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: { date?: string; dateTime?: string };
  end: { date?: string; dateTime?: string };
  colorId?: string;
  status?: string;
}

interface TokenInfo {
  access_token: string;
  expires_at: number; // unix ms
}

const SCOPES = 'https://www.googleapis.com/auth/calendar';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const STORAGE_KEY = 'gcal_token';

let tokenClient: any = null;
let scriptLoaded = false;

function loadGisScript(): Promise<void> {
  if (scriptLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => { scriptLoaded = true; resolve(); };
    document.body.appendChild(script);
  });
}

function getStoredToken(): TokenInfo | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const info = JSON.parse(raw) as TokenInfo;
    if (Date.now() > info.expires_at) { localStorage.removeItem(STORAGE_KEY); return null; }
    return info;
  } catch { return null; }
}

function storeToken(token: string, expiresIn: number) {
  const info: TokenInfo = { access_token: token, expires_at: Date.now() + expiresIn * 1000 - 60_000 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
}

export const useGoogleCalendar = () => {
  const { profile } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);
  const [error, setError] = useState<string | null>(null);
  const isConfigured = Boolean(CLIENT_ID);

  useEffect(() => {
    const token = getStoredToken();
    if (token) { setIsConnected(true); fetchEvents(token.access_token); }
  }, []);

  const fetchEvents = async (accessToken: string) => {
    try {
      setIsLoading(true);
      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();
      const sixMonthsAhead = new Date(now.getFullYear(), now.getMonth() + 6, 1).toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${threeMonthsAgo}&timeMax=${sixMonthsAhead}&maxResults=500&singleEvents=true&orderBy=startTime`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
      if (!res.ok) {
        if (res.status === 401) { disconnect(); }
        setError('Google Kalender konnte nicht geladen werden.');
        return;
      }
      const data = await res.json();
      setEvents((data.items ?? []).filter((e: any) => e.status !== 'cancelled'));
      setError(null);
    } catch (e) {
      setError('Verbindungsfehler');
    } finally {
      setIsLoading(false);
    }
  };

  const connect = useCallback(async () => {
    if (!CLIENT_ID) { setError('VITE_GOOGLE_CLIENT_ID ist nicht konfiguriert.'); return; }
    await loadGisScript();
    setIsLoading(true);
    const g = (window as any).google;
    if (!g?.accounts?.oauth2) { setError('Google Identity Services nicht geladen.'); setIsLoading(false); return; }
    tokenClient = g.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response: any) => {
        if (response.error) { setError(response.error); setIsLoading(false); return; }
        storeToken(response.access_token, response.expires_in);
        setIsConnected(true);
        fetchEvents(response.access_token);
      },
    });
    tokenClient.requestAccessToken({ prompt: '' });
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setIsConnected(false);
    setEvents([]);
    if ((window as any).google?.accounts?.oauth2 && tokenClient) {
      const token = getStoredToken();
      if (token) (window as any).google.accounts.oauth2.revoke(token.access_token);
    }
  }, []);

  // Push an event to Google Calendar
  const pushEvent = useCallback(async (title: string, startDate: string, endDate: string): Promise<boolean> => {
    const tokenInfo = getStoredToken();
    if (!tokenInfo) { setError('Nicht mit Google verbunden.'); return false; }
    try {
      const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenInfo.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: title,
          start: { date: startDate },
          end: { date: endDate },
        }),
      });
      return res.ok;
    } catch { return false; }
  }, []);

  const refresh = useCallback(() => {
    const token = getStoredToken();
    if (token) fetchEvents(token.access_token);
    else connect();
  }, [connect]);

  return { isConfigured, isConnected, isLoading, events, error, connect, disconnect, pushEvent, refresh };
};
