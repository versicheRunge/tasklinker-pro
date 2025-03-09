
import { format, addDays, isWithinInterval, isValid } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarEvent } from '../types/calendar';
import { User } from '../types/case';

// Helper to get correct Easter date
export const getEasterSunday = (year: number): Date => {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month, day);
};

// German holidays for the current year with correct calculations
export const getGermanHolidays = (year: number): CalendarEvent[] => {
  // Calculate Easter Sunday
  const easterSunday = getEasterSunday(year);
  
  // Calculate Good Friday (2 days before Easter Sunday)
  const goodFriday = new Date(easterSunday);
  goodFriday.setDate(easterSunday.getDate() - 2);
  
  // Calculate Easter Monday (1 day after Easter Sunday)
  const easterMonday = new Date(easterSunday);
  easterMonday.setDate(easterSunday.getDate() + 1);
  
  // Calculate Ascension Day (39 days after Easter Sunday)
  const ascensionDay = new Date(easterSunday);
  ascensionDay.setDate(easterSunday.getDate() + 39);
  
  // Calculate Whit Monday (50 days after Easter Sunday)
  const whitMonday = new Date(easterSunday);
  whitMonday.setDate(easterSunday.getDate() + 50);
  
  return [
    { id: `new-year-${year}`, title: 'Neujahr', date: new Date(year, 0, 1), type: 'holiday' },
    { id: `good-friday-${year}`, title: 'Karfreitag', date: goodFriday, type: 'holiday' },
    { id: `easter-sunday-${year}`, title: 'Ostersonntag', date: easterSunday, type: 'holiday' },
    { id: `easter-monday-${year}`, title: 'Ostermontag', date: easterMonday, type: 'holiday' },
    { id: `labor-day-${year}`, title: 'Tag der Arbeit', date: new Date(year, 4, 1), type: 'holiday' },
    { id: `ascension-${year}`, title: 'Christi Himmelfahrt', date: ascensionDay, type: 'holiday' },
    { id: `whit-monday-${year}`, title: 'Pfingstmontag', date: whitMonday, type: 'holiday' },
    { id: `german-unity-${year}`, title: 'Tag der Deutschen Einheit', date: new Date(year, 9, 3), type: 'holiday' },
    { id: `christmas-eve-${year}`, title: 'Heiligabend', date: new Date(year, 11, 24), type: 'holiday' },
    { id: `christmas-day-${year}`, title: 'Weihnachten', date: new Date(year, 11, 25), type: 'holiday' },
    { id: `boxing-day-${year}`, title: 'Zweiter Weihnachtstag', date: new Date(year, 11, 26), type: 'holiday' },
    { id: `new-years-eve-${year}`, title: 'Silvester', date: new Date(year, 11, 31), type: 'holiday' }
  ];
};

// Event emojis by type
export const getEventEmoji = (type: string): string => {
  switch (type) {
    case 'holiday':
      return '🎉';
    case 'absence':
      return '🏖️';
    case 'sick':
      return '🤒';
    case 'training':
      return '📚';
    case 'meeting':
      return '📅';
    case 'birthday':
      return '🎂';
    default:
      return '📌';
  }
};

// Format a date to a string in German locale
export const formatDate = (date: Date): string => {
  return format(date, 'PPP', { locale: de });
};

// Get events for the selected date
export const getEventsForDate = (date: Date, events: CalendarEvent[]): CalendarEvent[] => {
  if (!isValid(date)) return [];
  
  return events.filter(event => {
    // Check for single-day events
    const isSameDay = (date1: Date, date2: Date) => {
      return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
    };
    
    // Check if the date falls within a multi-day event
    const isWithinEvent = event.endDate ? 
      isWithinInterval(date, { 
        start: new Date(event.date), 
        end: new Date(event.endDate) 
      }) : false;
    
    return isSameDay(event.date, date) || isWithinEvent;
  });
};

// Get badge color based on event type
export const getEventBadgeVariant = (type: string): "destructive" | "secondary" | "warning" | "default" | "success" | "outline" | "priority-high" | "priority-medium" | "priority-low" | "priority-none" => {
  switch (type) {
    case 'holiday':
      return 'destructive';
    case 'absence':
      return 'secondary';
    case 'sick':
      return 'destructive';
    case 'training':
      return 'warning';
    case 'meeting':
      return 'default';
    case 'birthday':
      return 'success';
    default:
      return 'outline';
  }
};

// Check if an event already exists to avoid duplicates
export const eventExists = (
  events: CalendarEvent[],
  type: string, 
  userId: string, 
  date: Date, 
  endDate?: Date
): boolean => {
  return events.some(event => {
    // Skip if not the same type or user
    if (event.type !== type || event.userId !== userId) return false;
    
    // Check for single-day overlap
    const isSameDay = (date1: Date, date2: Date) => {
      return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
    };
    
    // Single day events
    if (!endDate && !event.endDate) {
      return isSameDay(event.date, date);
    }
    
    // Multi-day events
    if (endDate && event.endDate) {
      return (
        (date <= event.endDate && endDate >= event.date) || // Overlapping periods
        isSameDay(event.date, date) || // Same start date
        isSameDay(event.endDate, endDate) // Same end date
      );
    }
    
    // One is single day, one is multi-day
    if (endDate && !event.endDate) {
      return date <= event.date && endDate >= event.date;
    }
    
    if (!endDate && event.endDate) {
      return date >= event.date && date <= event.endDate;
    }
    
    return false;
  });
};
