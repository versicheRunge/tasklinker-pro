
import { useState, useEffect } from 'react';
import { CalendarEvent } from '../../types/calendar';

export const useCalendarEvents = () => {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const storedEvents = localStorage.getItem('calendarEvents');
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
        const eventsWithDates = parsedEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date),
          endDate: event.endDate ? new Date(event.endDate) : undefined
        }));
        setCalendarEvents(eventsWithDates);
      } catch (e) {
        console.error('Error parsing stored events:', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'calendarEvents' && e.newValue) {
        try {
          const parsedEvents = JSON.parse(e.newValue);
          const eventsWithDates = parsedEvents.map((event: any) => ({
            ...event,
            date: new Date(event.date),
            endDate: event.endDate ? new Date(event.endDate) : undefined
          }));
          setCalendarEvents(eventsWithDates);
        } catch (e) {
          console.error('Error parsing stored events:', e);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    calendarEvents
  };
};
