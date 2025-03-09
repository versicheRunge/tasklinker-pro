
import { useState } from 'react';
import { AdminViewType, CalendarEvent } from '../../types/calendar';

export const useAdminView = (events: CalendarEvent[]) => {
  const [adminView, setAdminView] = useState<AdminViewType>('all');
  
  // Get events for admin overview
  const getFilteredEvents = () => {
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

  return {
    adminView,
    setAdminView,
    getFilteredEvents
  };
};
