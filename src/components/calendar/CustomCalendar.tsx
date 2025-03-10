
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
