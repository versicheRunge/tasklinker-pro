
import { isWeekend } from 'date-fns';
import { CalendarEvent } from '../../../types/calendar';

export const calculateWorkingDays = (startDate: Date, endDate: Date | undefined): number => {
  if (!startDate || !endDate) {
    return isWeekend(startDate) ? 0 : 1;
  }
  
  let count = 0;
  const currentDate = new Date(startDate);
  
  // Get holidays from localStorage
  const storedEvents = localStorage.getItem('calendarEvents');
  const events = storedEvents ? JSON.parse(storedEvents) : [];
  const holidays = events
    .filter((event: any) => event.type === 'holiday')
    .map((event: any) => new Date(event.date).toDateString());
  
  // Set to same time to avoid time comparison issues
  currentDate.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  while (currentDate <= end) {
    // Skip weekends and holidays
    if (!isWeekend(currentDate) && !holidays.includes(currentDate.toDateString())) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return count;
};
