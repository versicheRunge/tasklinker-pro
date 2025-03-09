
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarEvent, AdminViewType } from '../types/calendar';
import { getGermanHolidays, eventExists, calculateWorkingDays } from '../utils/calendarUtils';
import { useUser } from '../contexts/UserContext';
import { toast } from "./use-toast";

export const useCalendar = () => {
  const { users, currentUser, isAdmin } = useUser();
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    date: new Date(),
    type: 'other',
    description: '',
  });
  const [adminView, setAdminView] = useState<AdminViewType>('all');
  
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

  // Get events for admin overview
  const getFilteredEvents = () => {
    if (!isAdmin) return [];
    
    let filtered = events;
    
    // Apply filter based on admin view
    if (adminView === 'absences') {
      filtered = events.filter(event => event.type === 'absence');
    } else if (adminView === 'sick') {
      filtered = events.filter(event => event.type === 'sick');
    }
    
    // Sort by date (most recent first)
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };
  
  // Handle adding a new event
  const handleAddEvent = () => {
    if (!newEvent.title.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel für den Termin ein.",
        variant: "destructive"
      });
      return;
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
        return;
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
    setIsEventDialogOpen(false);
    
    toast({
      title: "Termin hinzugefügt",
      description: newEvent.type === 'absence' 
        ? `Der Urlaub wurde erfolgreich eingetragen (${workingDaysCount} Arbeitstage).`
        : "Der Termin wurde erfolgreich im Kalender eingetragen."
    });
    
    // Reset new event form
    setNewEvent({
      title: '',
      date: new Date(),
      type: 'other',
      description: '',
    });
  };
  
  // Handle deleting an event
  const handleDeleteEvent = (id: string) => {
    // Check if user has permission to delete this event
    const eventToDelete = events.find(event => event.id === id);
    
    if (!eventToDelete) return;
    
    // Only admin can delete any event, regular users can only delete their own events
    if (!isAdmin && eventToDelete.createdBy !== currentUser?.id && eventToDelete.type !== 'holiday') {
      toast({
        title: "Keine Berechtigung",
        description: "Sie können nur Ihre eigenen Termine löschen.",
        variant: "destructive"
      });
      return;
    }
    
    // Admins can't delete holidays
    if (eventToDelete.type === 'holiday') {
      toast({
        title: "Feiertage können nicht gelöscht werden",
        description: "Feiertage sind im System fest eingetragen.",
        variant: "destructive"
      });
      return;
    }
    
    setEvents(prev => prev.filter(event => event.id !== id));
    setIsViewEventDialogOpen(false);
    setSelectedEvent(null);
    
    toast({
      title: "Termin gelöscht",
      description: "Der Termin wurde erfolgreich aus dem Kalender entfernt."
    });
  };
  
  // View event details
  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
  };
  
  // Handle date change in the calendar
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      // Update the new event date too
      setNewEvent(prev => ({ ...prev, date: newDate }));
    }
  };

  return {
    date,
    events,
    isEventDialogOpen,
    setIsEventDialogOpen,
    isViewEventDialogOpen,
    setIsViewEventDialogOpen,
    selectedEvent,
    setSelectedEvent,
    newEvent,
    setNewEvent,
    adminView,
    setAdminView,
    getFilteredEvents,
    handleAddEvent,
    handleDeleteEvent,
    handleViewEvent,
    handleDateChange
  };
};
