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

interface AgencyCalConfig {
  calendarId: string;
  apiKey: string;
}

export const useAgencyCalendar = () => {
  const [events, setEvents] = useState<GCalEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadConfig = useCallback(async (): Promise<AgencyCalConfig | null> => {
    const { data } = await supabase
      .from('agency_settings')
      .select('key, value')
      .in('key', ['gcal_calendar_id', 'gcal_api_key']);
    if (!data) return null;
    const map = Object.fromEntries(data.map(r => [r.key, r.value]));
    if (!map.gcal_calendar_id || !map.gcal_api_key) return null;
    return { calendarId: map.gcal_calendar_id, apiKey: map.gcal_api_key };
  }, []);

  const fetchEvents = useCallback(async () => {
    const config = await loadConfig();
    if (!config) { setIsConfigured(false); return; }
    setIsConfigured(true);
    setIsLoading(true);
    setError(null);

    const now = new Date();
    const tMin = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();
    const tMax = new Date(now.getFullYear(), now.getMonth() + 6, 0).toISOString();
    const encodedId = encodeURIComponent(config.calendarId);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodedId}/events?key=${config.apiKey}&timeMin=${tMin}&timeMax=${tMax}&singleEvents=true&orderBy=startTime&maxResults=250`;

    try {
      const resp = await fetch(url);
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        setError(errData?.error?.message ?? `HTTP ${resp.status}`);
        setIsLoading(false);
        return;
      }
      const data = await resp.json();
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
  }, [loadConfig]);

  useEffect(() => {
    fetchEvents();
    // auto-refresh every 10 minutes
    const interval = setInterval(fetchEvents, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  return { events, isLoading, isConfigured, lastSynced, error, refresh: fetchEvents };
};

/** Build a Google Calendar quick-add URL for a TaskLinker event */
export const buildGoogleCalendarAddUrl = (
  title: string,
  startDate: string, // YYYY-MM-DD
  endDate: string,   // YYYY-MM-DD
  description = '',
) => {
  // Google Calendar date format: YYYYMMDD
  const fmt = (d: string) => d.replace(/-/g, '');
  // For all-day events Google Calendar end date is exclusive, so add 1 day
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
