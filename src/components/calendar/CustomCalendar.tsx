
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { isWeekend } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarEvent } from '../../types/calendar';

const TYPE_COLOR: Record<string, string> = {
  holiday:  'bg-red-400',
  absence:  'bg-blue-400',
  sick:     'bg-pink-400',
  training: 'bg-orange-400',
  birthday: 'bg-green-400',
  other:    'bg-gray-400',
};

interface CustomCalendarProps {
  date: Date;
  onDateChange: (date: Date | undefined) => void;
  events: CalendarEvent[];
  wvlDates?: string[]; // ISO date strings (YYYY-MM-DD) that have follow-up cases
}

export const CustomCalendar: React.FC<CustomCalendarProps> = ({ date, onDateChange, events, wvlDates = [] }) => {
  const getEventsForDay = (d: Date): CalendarEvent[] => {
    const key = d.toDateString();
    return events.filter(e => new Date(e.date).toDateString() === key);
  };

  const isHoliday = (d: Date) =>
    events.some(e => e.type === 'holiday' && new Date(e.date).toDateString() === d.toDateString());

  const hasWvl = (d: Date) => wvlDates.includes(d.toISOString().slice(0, 10));

  return (
    <Calendar
      locale={de}
      mode="single"
      selected={date}
      onSelect={onDateChange}
      className="rounded-md border pointer-events-auto w-full"
      modifiersClassNames={{
        today:    'bg-primary/10 text-primary font-medium',
        selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
      }}
      modifiers={{
        weekend: (d) => isWeekend(d),
        holiday: (d) => isHoliday(d),
      }}
      modifiersStyles={{
        weekend: { backgroundColor: 'color-mix(in srgb, var(--color-blue-100, #dbeafe) 40%, transparent)' },
        holiday: { backgroundColor: 'color-mix(in srgb, var(--color-red-100, #fee2e2) 60%, transparent)' },
      }}
      components={{
        DayContent: ({ date: d }) => {
          const dayEvents = getEventsForDay(d);
          const dots = dayEvents
            .map(e => TYPE_COLOR[e.type] ?? TYPE_COLOR.other)
            .filter((c, i, a) => a.indexOf(c) === i)
            .slice(0, 3);
          const wvl = hasWvl(d);

          return (
            <div className="flex flex-col items-center justify-center w-full h-full">
              <span>{d.getDate()}</span>
              {(dots.length > 0 || wvl) && (
                <div className="flex gap-0.5 mt-0.5">
                  {dots.map((cls, i) => (
                    <span key={i} className={`w-1 h-1 rounded-full ${cls}`} />
                  ))}
                  {wvl && <span className="w-1 h-1 rounded-full bg-amber-400" title="Wiedervorlage" />}
                </div>
              )}
            </div>
          );
        },
      }}
    />
  );
};
