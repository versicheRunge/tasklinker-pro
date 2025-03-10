
import { useState } from 'react';
import { CalendarEvent } from '../../types/calendar';

export const useEventDialogs = () => {
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isViewEventDialogOpen, setIsViewEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  // Define newEvent type without id since it will be added when saving
  const [newEvent, setNewEvent] = useState<Omit<CalendarEvent, 'id'>>({
    title: '',
    date: new Date(),
    type: 'other',
    description: '',
  });
  
  // View event details
  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsViewEventDialogOpen(true);
  };
  
  const resetNewEvent = (date?: Date) => {
    setNewEvent({
      title: '',
      date: date || new Date(),
      type: 'other',
      description: '',
    });
  };

  return {
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
  };
};
