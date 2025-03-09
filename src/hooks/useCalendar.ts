
import { useCalendarEvents } from './calendar/useCalendarEvents';
import { useCalendarDate } from './calendar/useCalendarDate';
import { useEventDialogs } from './calendar/useEventDialogs';
import { useAdminView } from './calendar/useAdminView';
import { getEventsForDate } from '../utils/calendarUtils';
import { useUser } from '../contexts/UserContext';
import { CalendarEvent } from '../types/calendar';
import { useEffect } from 'react';

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
  
  // Initialize new event date when date changes
  useEffect(() => {
    setNewEvent(prev => ({ ...prev, date }));
  }, [date, setNewEvent]);
  
  // Add event wrapper that handles dialog closing and form reset
  const addEvent = (newEventData: Omit<CalendarEvent, 'id'>) => {
    const success = handleAddEvent(newEventData);
    if (success) {
      setIsEventDialogOpen(false);
      resetNewEvent(date);
    }
    return success;
  };
  
  // Delete event wrapper that also handles dialog closing
  const deleteEvent = (id: string) => {
    const success = handleDeleteEvent(id);
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
    return updatedDate;
  };

  // Get events for a specific date
  const getEventsForSpecificDate = (date: Date) => {
    return getEventsForDate(date, events);
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
    getEventsForDate: getEventsForSpecificDate
  };
};
