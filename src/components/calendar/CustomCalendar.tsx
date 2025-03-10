
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { isWeekend, isEqual } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarEvent } from '../../types/calendar';

interface CustomCalendarProps {
  date: Date;
  onDateChange: (date: Date | undefined) => void;
  events: CalendarEvent[];
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({ 
  date, 
  onDateChange,
  events
}) => {
  // Find holiday events
  const holidayEvents = events.filter(event => event.type === 'holiday');
  
  // Create a Set of date strings for holidays for faster lookup
  const holidayDates = new Set(
    holidayEvents.map(event => new Date(event.date).toDateString())
  );
  
  const isHoliday = (date: Date): boolean => {
    return holidayDates.has(date.toDateString());
  };
  
  // Function to determine the class name for a day
  const getDayClassName = (date: Date) => {
    let className = '';
    
    // Style for weekends
    if (isWeekend(date)) {
      className += 'bg-blue-50 hover:bg-blue-100 ';
    }
    
    // Style for holidays
    if (isHoliday(date)) {
      className += 'bg-red-50 hover:bg-red-100 ';
    }
    
    // Get events for this date
    const hasEvents = events.some(event => 
      isEqual(new Date(event.date).setHours(0, 0, 0, 0), date.setHours(0, 0, 0, 0))
    );
    
    // Style for dates with events
    if (hasEvents) {
      className += 'font-bold ';
    }
    
    return className;
  };
  
  return (
    <Calendar
      locale={de}
      mode="single"
      selected={date}
      onSelect={onDateChange}
      className="rounded-md border pointer-events-auto"
      modifiersClassNames={{
        today: 'bg-primary/10 text-primary font-medium',
        selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
      }}
      modifiers={{
        weekend: (date) => isWeekend(date),
        holiday: (date) => isHoliday(date),
        hasEvents: (date) => events.some(event => 
          isEqual(new Date(event.date).setHours(0, 0, 0, 0), date.setHours(0, 0, 0, 0))
        )
      }}
      modifiersStyles={{
        weekend: { backgroundColor: '#EBF5FF' }, // light blue for weekends
        holiday: { backgroundColor: '#FEF2F2' }, // light red for holidays
        hasEvents: { fontWeight: 'bold' }
      }}
    />
  );
};
