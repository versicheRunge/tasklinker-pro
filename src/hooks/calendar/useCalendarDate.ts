
import { useState } from 'react';

export const useCalendarDate = () => {
  const [date, setDate] = useState<Date>(new Date());
  
  // Handle date change in the calendar
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      return newDate;
    }
    return date;
  };

  return {
    date,
    setDate,
    handleDateChange
  };
};
