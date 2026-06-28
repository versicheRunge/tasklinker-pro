import { supabase } from './supabase';

interface GcalEventInput {
  title: string;
  startDate: string; // yyyy-MM-dd
  endDate: string;   // yyyy-MM-dd (inclusive)
  description?: string;
}

/** Push an all-day event to the agency Google Calendar via the Edge Function.
 *  Silently no-ops if calendar is not configured. */
export async function pushToGcal(event: GcalEventInput): Promise<void> {
  try {
    const { data: check } = await supabase
      .from('agency_settings')
      .select('value')
      .eq('key', 'gcal_configured')
      .maybeSingle();

    if (!check?.value) return; // calendar not set up

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    // Google Calendar all-day events: end date must be exclusive (day after last day)
    const endExclusive = new Date(event.endDate);
    endExclusive.setDate(endExclusive.getDate() + 1);
    const endStr = endExclusive.toISOString().slice(0, 10);

    const gcalEvent = {
      summary: event.title,
      description: event.description ?? '',
      start: { date: event.startDate },
      end: { date: endStr },
    };

    await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calendar-proxy`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'createEvent', event: gcalEvent }),
      }
    );
    // Errors are silently ignored — the local calendar_events entry is the source of truth
  } catch {
    // Never block the user flow for a calendar push failure
  }
}
