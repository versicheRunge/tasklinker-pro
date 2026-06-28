import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface GCalEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  description?: string;
  location?: string;
  organizer?: string;
  htmlLink?: string;
}

export const useAgencyCalendar = () => {
  const [events, setEvents] = useState<GCalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if service account is configured (without fetching the secret JSON)
      const { data: check } = await supabase
        .from('agency_settings')
        .select('value')
        .eq('key', 'gcal_configured')
        .maybeSingle();

      if (!check?.value) {
        setIsConfigured(false);
        setIsLoading(false);
        return;
      }

      setIsConfigured(true);

      // Get current session token to authenticate the Edge Function call
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setIsLoading(false); return; }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
      const resp = await fetch(`${supabaseUrl}/functions/v1/calendar-proxy`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
        },
      });

      const data = await resp.json();

      if (!resp.ok || data.error) {
        setError(data.error ?? `HTTP ${resp.status}`);
        setIsLoading(false);
        return;
      }

      const parsed: GCalEvent[] = (data.items ?? []).map((item: any) => ({
        id: item.id,
        title: item.summary ?? '(kein Titel)',
        start: item.start?.dateTime ?? item.start?.date ?? '',
        end: item.end?.dateTime ?? item.end?.date ?? '',
        allDay: !item.start?.dateTime,
        description: item.description,
        location: item.location,
        organizer: item.organizer?.displayName ?? item.organizer?.email,
        htmlLink: item.htmlLink,
      }));

      setEvents(parsed);
      setLastSynced(new Date());
    } catch (e: any) {
      setError(e.message ?? 'Unbekannter Fehler');
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return { events, isLoading, isConfigured, lastSynced, error, refresh: fetchEvents };
};

/** Build a Google Calendar quick-add URL for an event */
export const buildGoogleCalendarAddUrl = (
  title: string,
  startDate: string,
  endDate: string,
  description = '',
) => {
  const fmt = (d: string) => d.replace(/-/g, '');
  const endExclusive = new Date(endDate);
  endExclusive.setDate(endExclusive.getDate() + 1);
  const endStr = endExclusive.toISOString().slice(0, 10).replace(/-/g, '');
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${fmt(startDate)}/${endStr}`,
    details: description,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};
