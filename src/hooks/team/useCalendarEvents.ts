import { useState, useEffect } from 'react';
import { CalendarEvent } from '../../types/calendar';
import { getGermanHolidays } from '../../utils/calendarUtils';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const useCalendarEvents = () => {
  const { profile } = useAuth();
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    if (!profile) return;
    const y = new Date().getFullYear();
    const holidays = [...getGermanHolidays(y), ...getGermanHolidays(y + 1)];
    supabase.from('calendar_events').select('*').order('start_time').then(({ data }) => {
      const dbEvents: CalendarEvent[] = (data ?? []).map((row: any) => ({
        id: row.id,
        title: row.title,
        date: new Date(row.start_time),
        endDate: row.end_time ? new Date(row.end_time) : undefined,
        type: row.type ?? 'other',
        description: row.description,
        userId: row.user_id,
        createdBy: row.created_by,
        workingDaysCount: row.working_days_count,
      }));
      setCalendarEvents([...holidays, ...dbEvents]);
    });
  }, [profile]);

  return { calendarEvents };
};
