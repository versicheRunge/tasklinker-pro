
import React from 'react';
import { Calendar } from 'lucide-react';
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import { de } from 'date-fns/locale';

interface DatePickerProps {
  startDate: Date;
  endDate?: Date;
  isMultiDay: boolean;
  workingDaysCount?: number;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
  onMultiDayChange: (isMultiDay: boolean) => void;
  eventType: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  startDate,
  endDate,
  isMultiDay,
  workingDaysCount,
  onStartDateChange,
  onEndDateChange,
  onMultiDayChange,
  eventType
}) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <label className="text-sm font-medium">
          Datum
        </label>
        {(eventType === 'absence' || eventType === 'sick') && (
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="mr-2"
              checked={isMultiDay}
              onChange={(e) => {
                onMultiDayChange(e.target.checked);
                if (e.target.checked && !endDate) {
                  onEndDateChange(addDays(startDate, 1));
                }
              }}
            />
            <span className="text-sm">Mehrtägig</span>
          </label>
        )}
      </div>
      
      <div className={`flex ${isMultiDay ? 'space-x-4' : ''}`}>
        <div className={isMultiDay ? 'w-1/2' : 'w-full'}>
          <div className="relative">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              className="w-full pl-10 pr-3 py-2 border border-input rounded-md"
              value={format(startDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const newDate = e.target.value ? new Date(e.target.value) : new Date();
                onStartDateChange(newDate);
              }}
            />
          </div>
          {!isMultiDay && (
            <div className="text-xs text-muted-foreground mt-1">
              {format(startDate, 'EEEE, dd. MMMM yyyy', { locale: de })}
            </div>
          )}
        </div>
        
        {isMultiDay && (
          <div className="w-1/2">
            <div className="relative">
              <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                className="w-full pl-10 pr-3 py-2 border border-input rounded-md"
                value={format(endDate || startDate, 'yyyy-MM-dd')}
                min={format(startDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newEndDate = e.target.value ? new Date(e.target.value) : new Date();
                  if (newEndDate >= startDate) {
                    onEndDateChange(newEndDate);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>
      
      {isMultiDay && endDate && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{format(startDate, 'dd. MMM yyyy', { locale: de })}</span>
          <span>bis</span>
          <span>{format(endDate, 'dd. MMM yyyy', { locale: de })}</span>
        </div>
      )}
      
      {(eventType === 'absence' || eventType === 'sick') && (
        <div className="mt-2 text-sm">
          <span className="font-medium">
            {workingDaysCount || 0} Arbeitstage
          </span>
          {isMultiDay && endDate && (
            <span className="text-muted-foreground ml-2">
              ({differenceInCalendarDays(endDate, startDate) + 1} Kalendertage)
            </span>
          )}
        </div>
      )}
    </div>
  );
};
