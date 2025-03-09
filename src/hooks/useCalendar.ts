
import { useCalendarEvents } from './calendar/useCalendarEvents';
import { useCalendarDate } from './calendar/useCalendarDate';
import { useEventDialogs } from './calendar/useEventDialogs';
import { useAdminView } from './calendar/useAdminView';
import { getEventsForDate } from '../utils/calendarUtils';
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
  const addEvent = () => {
    const success = handleAddEvent(newEvent);
    if (success) {
      setIsEventDialogOpen(false);
      resetNewEvent(date);
    }
  };
  
  // Delete event wrapper that also handles dialog closing
  const deleteEvent = (id: string) => {
    const success = handleDeleteEvent(id);
    if (success) {
      setIsViewEventDialogOpen(false);
      setSelectedEvent(null);
    }
  };
  
  // Handle date change wrapper that also updates new event date
  const onDateChange = (newDate: Date | undefined) => {
    const updatedDate = handleDateChange(newDate);
    // Update the new event date too
    setNewEvent(prev => ({ ...prev, date: updatedDate }));
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
    getEventsForDate: (date: Date) => getEventsForDate(date, events)
  };
};
