import { format, addDays, isWithinInterval, isValid, isWeekend, differenceInCalendarDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarEvent, VacationAllowance } from '../types/calendar';
import { User } from '../types/case';
import { supabase } from '../lib/supabase';

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
  const easterSunday = getEasterSunday(year);
  
  const goodFriday = new Date(easterSunday);
  goodFriday.setDate(easterSunday.getDate() - 2);
  
  const easterMonday = new Date(easterSunday);
  easterMonday.setDate(easterSunday.getDate() + 1);
  
  const ascensionDay = new Date(easterSunday);
  ascensionDay.setDate(easterSunday.getDate() + 39);
  
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
    const isSameDay = (date1: Date, date2: Date) => {
      return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
    };
    
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
    if (event.type !== type || event.userId !== userId) return false;
    
    const isSameDay = (date1: Date, date2: Date) => {
      return date1.getDate() === date2.getDate() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear();
    };
    
    if (!endDate && !event.endDate) {
      return isSameDay(event.date, date);
    }
    
    if (endDate && event.endDate) {
      return (
        (date <= event.endDate && endDate >= event.date) || 
        isSameDay(event.date, date) || 
        isSameDay(event.endDate, endDate)
      );
    }
    
    if (endDate && !event.endDate) {
      return date <= event.date && endDate >= event.date;
    }
    
    if (!endDate && event.endDate) {
      return date >= event.date && date <= event.endDate;
    }
    
    return false;
  });
};

// Check if a date is a holiday
export const isHoliday = (date: Date, holidays: CalendarEvent[]): boolean => {
  return holidays.some(holiday => {
    const holidayDate = new Date(holiday.date);
    return date.getDate() === holidayDate.getDate() &&
           date.getMonth() === holidayDate.getMonth() &&
           date.getFullYear() === holidayDate.getFullYear();
  });
};

// Calculate working days between two dates (excluding weekends and holidays)
export const calculateWorkingDays = (startDate: Date, endDate: Date, holidays: CalendarEvent[]): number => {
  if (!startDate || !endDate) return 0;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;
  
  if (start > end) return 0;
  
  const currentDate = new Date(start);
  while (currentDate <= end) {
    if (!isWeekend(currentDate) && !isHoliday(currentDate, holidays)) {
      workingDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
};

// Get vacation allowance for a user and year (async, reads from Supabase)
export const getVacationAllowance = async (userId: string, year: number): Promise<number> => {
  const { data } = await supabase.from('vacation_allowances').select('total_days').eq('user_id', userId).eq('year', year).maybeSingle();
  return data?.total_days ?? 0;
};

// Save vacation allowance for a user and year (async, writes to Supabase)
export const saveVacationAllowance = async (userId: string, year: number, totalDays: number): Promise<void> => {
  await supabase.from('vacation_allowances').upsert({ user_id: userId, year, total_days: totalDays }, { onConflict: 'user_id,year' });
};

// Calculate used vacation days for a user in a year
export const calculateUsedVacationDays = (
  userId: string, 
  year: number, 
  events: CalendarEvent[]
): number => {
  const userVacationEvents = events.filter(event => 
    event.type === 'absence' && 
    event.userId === userId &&
    new Date(event.date).getFullYear() === year
  );
  
  return userVacationEvents.reduce((total, event) => {
    return total + (event.workingDaysCount || 0);
  }, 0);
};

// Calculate remaining vacation days
export const calculateRemainingVacationDays = (
  userId: string, 
  year: number, 
  events: CalendarEvent[]
): number => {
  const totalAllowance = getVacationAllowance(userId, year);
  const usedDays = calculateUsedVacationDays(userId, year, events);
  
  return Math.max(0, totalAllowance - usedDays);
};
