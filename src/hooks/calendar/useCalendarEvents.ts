import { useState, useEffect } from 'react';
import { CalendarEvent } from '../../types/calendar';
import { getGermanHolidays, eventExists, calculateWorkingDays } from '../../utils/calendarUtils';
import { User } from '../../types/case';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from "../use-toast";
import { pushToGcal } from '../../lib/gcalPush';
import { format } from 'date-fns';

const rowToEvent = (row: any): CalendarEvent => ({
  id: row.id,
  title: row.title,
  date: new Date(row.start_time),
  endDate: row.end_time ? new Date(row.end_time) : undefined,
  type: row.type ?? 'other',
  description: row.description,
  userId: row.user_id,
  createdBy: row.created_by,
  workingDaysCount: row.working_days_count,
});

export const useCalendarEvents = (currentUser?: User | null, isAdmin: boolean = false) => {
  const { profile } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const getHolidays = (): CalendarEvent[] => {
    const y = new Date().getFullYear();
    return [...getGermanHolidays(y), ...getGermanHolidays(y + 1)];
  };

  const loadEvents = async () => {
    if (!profile) return;
    const { data } = await supabase.from('calendar_events').select('*').order('start_time');
    const dbEvents = data ? data.map(rowToEvent) : [];
    const holidays = getHolidays();
    // Non-admins only see their own sick events; all other event types visible to all
    const filtered = isAdmin
      ? dbEvents
      : dbEvents.filter(e => e.type !== 'sick' || e.userId === profile.id);
    setEvents([...holidays, ...filtered]);
  };

  useEffect(() => { if (profile) loadEvents(); }, [profile]);

  const handleAddEvent = async (newEvent: CalendarEvent): Promise<boolean> => {
    if (!newEvent.title.trim()) {
      toast({ title: 'Fehler', description: 'Titel eingeben.', variant: 'destructive' }); return false;
    }
    if (newEvent.type === 'holiday') {
      toast({ title: 'Fehler', description: 'Feiertage können nicht manuell hinzugefügt werden.', variant: 'destructive' }); return false;
    }

    const userId = (newEvent.type === 'absence' || newEvent.type === 'sick')
      ? (newEvent.userId || currentUser?.id)
      : newEvent.userId;

    if ((newEvent.type === 'absence' || newEvent.type === 'sick') && userId) {
      const dbEvents = events.filter(e => e.type !== 'holiday');
      if (eventExists(dbEvents, newEvent.type, userId, newEvent.date, newEvent.endDate)) {
        toast({ title: 'Bereits eingetragen', description: 'Dieser Eintrag existiert bereits.', variant: 'destructive' });
        return false;
      }
    }

    let workingDaysCount: number | undefined;
    if (newEvent.type === 'absence' && newEvent.endDate) {
      workingDaysCount = calculateWorkingDays(newEvent.date, newEvent.endDate, getHolidays());
    }

    const { error } = await supabase.from('calendar_events').insert({
      title: newEvent.title,
      description: newEvent.description,
      start_time: newEvent.date.toISOString(),
      end_time: newEvent.endDate?.toISOString() ?? null,
      all_day: true,
      type: newEvent.type,
      user_id: userId ?? null,
      created_by: profile?.id,
      working_days_count: workingDaysCount ?? null,
    });

    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return false;
    }

    await loadEvents();

    // Auto-push meetings and trainings to Google Calendar
    const autoGcalTypes = ['meeting', 'training'];
    if (autoGcalTypes.includes(newEvent.type)) {
      pushToGcal({
        title: newEvent.title,
        startDate: format(newEvent.date, 'yyyy-MM-dd'),
        endDate: format(newEvent.endDate ?? newEvent.date, 'yyyy-MM-dd'),
        description: newEvent.description ?? '',
      });
    }

    toast({
      title: 'Termin hinzugefügt',
      description: newEvent.type === 'absence'
        ? `Urlaub eingetragen (${workingDaysCount} Arbeitstage).`
        : 'Termin erfolgreich eingetragen.',
    });
    return true;
  };

  const handleDeleteEvent = async (id: string): Promise<boolean> => {
    const eventToDelete = events.find(e => e.id === id);
    if (!eventToDelete) return false;

    if (eventToDelete.type === 'holiday') {
      toast({ title: 'Feiertage können nicht gelöscht werden.', variant: 'destructive' } as any); return false;
    }
    if (!isAdmin && eventToDelete.createdBy !== currentUser?.id) {
      toast({ title: 'Keine Berechtigung', description: 'Nur eigene Termine löschen.', variant: 'destructive' }); return false;
    }
    if (!isAdmin && (eventToDelete.type === 'absence' || eventToDelete.type === 'sick')) {
      toast({ title: 'Keine Berechtigung', description: 'Urlaub/Krank nur durch Admin löschbar.', variant: 'destructive' }); return false;
    }

    const { error } = await supabase.from('calendar_events').delete().eq('id', id);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return false; }
    await loadEvents();
    toast({ title: 'Termin gelöscht' });
    return true;
  };

  return { events, handleAddEvent, handleDeleteEvent };
};
