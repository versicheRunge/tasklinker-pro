
import { useState, useEffect } from 'react';
import { CalendarEvent } from '../../types/calendar';
import { getGermanHolidays, eventExists, calculateWorkingDays } from '../../utils/calendarUtils';
import { User } from '../../types/case';
import { toast } from "../use-toast";

export const useCalendarEvents = (currentUser?: User | null, isAdmin: boolean = false) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  // Load events from localStorage or initialize with holidays
  useEffect(() => {
    const storedEvents = localStorage.getItem('calendarEvents');
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    const holidays = [...getGermanHolidays(currentYear), ...getGermanHolidays(nextYear)];
    
    if (storedEvents) {
      try {
        const parsedEvents = JSON.parse(storedEvents);
        // Convert string dates back to Date objects
        const eventsWithDates = parsedEvents.map((event: any) => ({
          ...event,
          date: new Date(event.date),
          endDate: event.endDate ? new Date(event.endDate) : undefined
        }));
        
        // Filter out old holidays and add new ones
        const filteredEvents = eventsWithDates.filter((event: CalendarEvent) => 
          event.type !== 'holiday' || event.date.getFullYear() >= currentYear
        );
        
        // Add new holidays only if they don't exist
        const existingHolidayIds = filteredEvents
          .filter((e: CalendarEvent) => e.type === 'holiday')
          .map((e: CalendarEvent) => e.id);
        
        const newHolidays = holidays.filter(holiday => !existingHolidayIds.includes(holiday.id));
        
        setEvents([...filteredEvents, ...newHolidays]);
      } catch (e) {
        console.error('Error parsing stored events:', e);
        setEvents(holidays);
      }
    } else {
      // Initialize with holidays if no stored events
      setEvents(holidays);
    }
  }, []);
  
  // Save events to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('calendarEvents', JSON.stringify(events));
  }, [events]);

  // Handle adding a new event
  const handleAddEvent = (newEvent: Omit<CalendarEvent, 'id'>) => {
    if (!newEvent.title.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel für den Termin ein.",
        variant: "destructive"
      });
      return false;
    }
    
    // For absence/sick events, ensure userId is set
    const userId = (newEvent.type === 'absence' || newEvent.type === 'sick') 
      ? (newEvent.userId || currentUser?.id)
      : newEvent.userId;
    
    // Check for duplicate events to avoid double counting
    if ((newEvent.type === 'absence' || newEvent.type === 'sick') && userId) {
      if (eventExists(events, newEvent.type, userId, newEvent.date, newEvent.endDate)) {
        toast({
          title: "Termin existiert bereits",
          description: `Dieser ${newEvent.type === 'absence' ? 'Urlaub' : 'Krankheitstag'} ist bereits eingetragen.`,
          variant: "destructive"
        });
        return false;
      }
    }
    
    // Calculate working days for absence events
    let workingDaysCount;
    if (newEvent.type === 'absence' && newEvent.endDate) {
      // Get holidays for working days calculation
      const currentYear = new Date().getFullYear();
      const holidays = [...getGermanHolidays(currentYear), ...getGermanHolidays(currentYear + 1)];
      
      // Calculate working days
      workingDaysCount = calculateWorkingDays(newEvent.date, newEvent.endDate, holidays);
    }
    
    const event: CalendarEvent = {
      id: `event-${Date.now()}`,
      ...newEvent,
      userId,
      createdBy: currentUser?.id,
      workingDaysCount
    };
    
    setEvents(prev => [...prev, event]);
    
    toast({
      title: "Termin hinzugefügt",
      description: newEvent.type === 'absence' 
        ? `Der Urlaub wurde erfolgreich eingetragen (${workingDaysCount} Arbeitstage).`
        : "Der Termin wurde erfolgreich im Kalender eingetragen."
    });
    
    return true;
  };
  
  // Handle deleting an event
  const handleDeleteEvent = (id: string) => {
    // Check if user has permission to delete this event
    const eventToDelete = events.find(event => event.id === id);
    
    if (!eventToDelete) return false;
    
    // Only admin can delete any event, regular users can only delete their own events
    // and for absence/sick events, only admins can delete
    if (
      (!isAdmin && eventToDelete.createdBy !== currentUser?.id) || 
      (!isAdmin && (eventToDelete.type === 'absence' || eventToDelete.type === 'sick'))
    ) {
      toast({
        title: "Keine Berechtigung",
        description: "Sie können nur Ihre eigenen Termine löschen, und Urlaub/Krankheit kann nur vom Administrator bearbeitet werden.",
        variant: "destructive"
      });
      return false;
    }
    
    // Admins can't delete holidays
    if (eventToDelete.type === 'holiday') {
      toast({
        title: "Feiertage können nicht gelöscht werden",
        description: "Feiertage sind im System fest eingetragen.",
        variant: "destructive"
      });
      return false;
    }
    
    setEvents(prev => prev.filter(event => event.id !== id));
    
    toast({
      title: "Termin gelöscht",
      description: "Der Termin wurde erfolgreich aus dem Kalender entfernt."
    });
    
    return true;
  };

  return {
    events,
    handleAddEvent,
    handleDeleteEvent
  };
};
