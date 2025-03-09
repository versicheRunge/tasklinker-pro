
import React from 'react';
import { Calendar } from '../ui/calendar';
import { de } from 'date-fns/locale';
import { CalendarEvent } from '../../types/calendar';
import { USER_COLORS } from '../../contexts/UserTypes';

interface CustomCalendarProps {
  date: Date;
  onDateChange: (date: Date | undefined) => void;
  events: CalendarEvent[];
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({ date, onDateChange, events }) => {
  // Custom day rendering for the calendar
  const renderDay = (day: Date) => {
    const getEventsForDate = (date: Date) => {
      return events.filter(event => {
        // Check for single-day events
        const isSameDay = (date1: Date, date2: Date) => {
          return date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear();
        };
        
        // Check if the date falls within a multi-day event
        const isWithinEvent = event.endDate ? 
          event.date <= date && event.endDate >= date : false;
        
        return isSameDay(event.date, date) || isWithinEvent;
      });
    };

    const dayEvents = getEventsForDate(day);

    return (
      <div className="relative w-full h-full">
        <div className="absolute top-0 left-0 right-0 p-0.5">
          {dayEvents.length > 0 && (
            <div className="flex flex-wrap gap-0.5">
              {dayEvents.slice(0, 3).map((event, index) => {
                let dotColor = 'bg-primary';
                
                if (event.type === 'holiday') {
                  dotColor = 'bg-red-500';
                } else if (event.type === 'absence' && event.userId) {
                  const userIndex = events
                    .filter(e => e.userId === event.userId)
                    .findIndex(e => e.id === event.id);
                  dotColor = USER_COLORS[userIndex % USER_COLORS.length].primary;
                } else if (event.type === 'sick') {
                  dotColor = 'bg-pink-500';
                } else if (event.type === 'birthday') {
                  dotColor = 'bg-green-500';
                } else if (event.type === 'training') {
                  dotColor = 'bg-amber-500';
                }
                
                return (
                  <div 
                    key={index} 
                    className={`w-2 h-2 rounded-full ${dotColor}`}
                    title={`${event.title} (${event.type})`}
                  />
                );
              })}
              {dayEvents.length > 3 && (
                <div 
                  className="w-2 h-2 rounded-full bg-gray-400" 
                  title={`${dayEvents.length - 3} weitere Termine`}
                />
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center h-full">
          {day.getDate()}
        </div>
      </div>
    );
  };

  return (
    <Calendar
      mode="single"
      selected={date}
      onSelect={onDateChange}
      className="w-full"
      locale={de}
      components={{
        DayContent: ({ date }) => renderDay(date)
      }}
    />
  );
};
