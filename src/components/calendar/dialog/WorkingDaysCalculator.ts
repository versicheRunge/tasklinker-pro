
import { isWeekend } from 'date-fns';
import { getGermanHolidays } from '../../../utils/calendarUtils';

export const calculateWorkingDays = (startDate: Date, endDate: Date | undefined): number => {
  if (!startDate || !endDate) {
    return isWeekend(startDate) ? 0 : 1;
  }

  const y = startDate.getFullYear();
  const holidays = new Set(
    [...getGermanHolidays(y), ...getGermanHolidays(y + 1)].map(e => e.date.toDateString())
  );

  let count = 0;
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    if (!isWeekend(current) && !holidays.has(current.toDateString())) count++;
    current.setDate(current.getDate() + 1);
  }

  return count;
};
