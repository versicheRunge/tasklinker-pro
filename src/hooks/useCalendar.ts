
import { useCalendarEvents } from './calendar/useCalendarEvents';
import { useCalendarDate } from './calendar/useCalendarDate';
import { useEventDialogs } from './calendar/useEventDialogs';
import { useAdminView } from './calendar/useAdminView';
import { getEventsForDate as getEventsForSpecificDate } from '../utils/calendarUtils';
import { useUser } from '../contexts/UserContext';
import { CalendarEvent } from '../types/calendar';

export const useCalendar = () => {
  const { users, currentUser, isAdmin } = useUser();
  const { date, handleDateChange } = useCalendarDate();
  const { 
    events, 
    handleAddEvent, 
    handleDeleteEvent 
  } = useCalendarEvents(currentUser, isAdmin);
  
  const { 
    isEventDialogOpen, 
    setIsEventDialogOpen,
    isViewEventDialogOpen, 
    setIsViewEventDialogOpen,
    selectedEvent, 
    setSelectedEvent,
    newEvent, 
    setNewEvent,
    handleViewEvent,
    resetNewEvent
  } = useEventDialogs();
  
  const { adminView, setAdminView, getFilteredEvents } = useAdminView(events);
  
  // Add event wrapper that handles dialog closing and form reset
  const addEvent = async (event: CalendarEvent): Promise<boolean> => {
    if (!event.id) return false;
    const success = await handleAddEvent(event);
    if (success) {
      setIsEventDialogOpen(false);
      resetNewEvent(date);
    }
    return success;
  };

  // Delete event wrapper that also handles dialog closing
  const deleteEvent = async (id: string): Promise<boolean> => {
    const success = await handleDeleteEvent(id);
    if (success) {
      setIsViewEventDialogOpen(false);
      setSelectedEvent(null);
    }
    return success;
  };
  
  // Handle date change wrapper that also updates new event date
  const onDateChange = (newDate: Date | undefined) => {
    const updatedDate = handleDateChange(newDate);
    // Update the new event date too
    setNewEvent(prev => ({ ...prev, date: updatedDate }));
  };

  // Function to get events for a specific date
  const getEventsForDate = (specificDate: Date) => {
    return getEventsForSpecificDate(specificDate, events);
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
    handleAddEvent: addEvent,
    handleDeleteEvent: deleteEvent,
    handleViewEvent,
    handleDateChange: onDateChange,
    getEventsForDate
  };
};
