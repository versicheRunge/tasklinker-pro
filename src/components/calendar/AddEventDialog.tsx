
import React, { useMemo, useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { User } from '../../types/case';
import { CalendarEvent } from '../../types/calendar';
import { toast } from "../../hooks/use-toast";
import { EventTypeSelector } from './dialog/EventTypeSelector';
import { UserSelector } from './dialog/UserSelector';
import { DatePicker } from './dialog/DatePicker';
import { EventFormFooter } from './dialog/EventFormFooter';
import { calculateWorkingDays } from './dialog/WorkingDaysCalculator';

interface AddEventDialogProps {
  newEvent: Omit<CalendarEvent, 'id'>;
  setNewEvent: React.Dispatch<React.SetStateAction<Omit<CalendarEvent, 'id'>>>;
  onCancel: () => void;
  onSave: () => boolean;
  users: User[];
  currentUserId?: string;
  isAdmin: boolean;
}

export const AddEventDialog: React.FC<AddEventDialogProps> = ({
  newEvent,
  setNewEvent,
  onCancel,
  onSave,
  users,
  currentUserId,
  isAdmin
}) => {
  const [isMultiDay, setIsMultiDay] = useState(false);
  
  // Update working days count when dates change
  useMemo(() => {
    const workingDaysCount = calculateWorkingDays(newEvent.date, newEvent.endDate);
    setNewEvent(prev => ({
      ...prev,
      workingDaysCount
    }));
  }, [newEvent.date, newEvent.endDate, isMultiDay, setNewEvent]);
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEvent({...newEvent, title: e.target.value});
  };
  
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewEvent({...newEvent, description: e.target.value});
  };
  
  const handleTypeChange = (type: CalendarEvent['type']) => {
    if (type === 'absence' || type === 'sick') {
      // For absence and sick, default to current user
      setNewEvent({
        ...newEvent, 
        type,
        userId: currentUserId
      });
    } else {
      setNewEvent({...newEvent, type, userId: undefined});
    }
  };
  
  const handleUserChange = (userId: string) => {
    setNewEvent({...newEvent, userId});
  };
  
  const handleStartDateChange = (date: Date) => {
    setNewEvent({...newEvent, date});
    
    // If end date is before start date, update it
    if (isMultiDay && newEvent.endDate && date > newEvent.endDate) {
      setNewEvent(prev => ({
        ...prev, 
        endDate: new Date(date.getTime() + 86400000) // add one day
      }));
    }
  };
  
  const handleEndDateChange = (date: Date) => {
    // Ensure end date is not before start date
    if (date >= newEvent.date) {
      setNewEvent({...newEvent, endDate: date});
    } else {
      toast({
        title: "Ungültiges Datum",
        description: "Das Enddatum darf nicht vor dem Startdatum liegen.",
        variant: "destructive"
      });
    }
  };
  
  const handleMultiDayChange = (multiDay: boolean) => {
    setIsMultiDay(multiDay);
    if (multiDay && !newEvent.endDate) {
      setNewEvent({
        ...newEvent, 
        endDate: new Date(newEvent.date.getTime() + 86400000) // add one day
      });
    }
  };
  
  const handleSave = () => {
    if (!newEvent.title.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel ein.",
        variant: "destructive"
      });
      return;
    }
    
    const success = onSave();
    if (success) {
      // Reset for next entry
      setIsMultiDay(false);
    }
  };
  
  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Termin hinzufügen</DialogTitle>
      </DialogHeader>
      
      <div className="py-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="event-title">
            Titel
          </label>
          <input
            id="event-title"
            className="w-full px-3 py-2 border border-input rounded-md"
            value={newEvent.title}
            onChange={handleTitleChange}
            placeholder="Terminbezeichnung"
          />
        </div>
        
        <EventTypeSelector
          selectedType={newEvent.type}
          onTypeChange={handleTypeChange}
          isAdmin={isAdmin}
        />
        
        {(newEvent.type === 'absence' || newEvent.type === 'sick') && (
          <UserSelector
            userId={newEvent.userId}
            onUserChange={handleUserChange}
            users={users}
            disabled={!isAdmin}
          />
        )}
        
        <DatePicker
          startDate={newEvent.date}
          endDate={newEvent.endDate}
          isMultiDay={isMultiDay}
          workingDaysCount={newEvent.workingDaysCount}
          onStartDateChange={handleStartDateChange}
          onEndDateChange={handleEndDateChange}
          onMultiDayChange={handleMultiDayChange}
          eventType={newEvent.type}
        />
        
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="event-description">
            Beschreibung (optional)
          </label>
          <textarea
            id="event-description"
            className="w-full px-3 py-2 border border-input rounded-md"
            rows={3}
            value={newEvent.description || ''}
            onChange={handleDescriptionChange}
            placeholder="Zusätzliche Informationen zum Termin"
          />
        </div>
      </div>
      
      <EventFormFooter onCancel={onCancel} onSave={handleSave} />
    </DialogContent>
  );
};
