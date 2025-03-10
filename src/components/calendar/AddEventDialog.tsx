
import React, { useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import { format, addDays, differenceInCalendarDays, isWeekend, isEqual } from 'date-fns';
import { de } from 'date-fns/locale';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { User } from '../../types/case';
import { CalendarEvent } from '../../types/calendar';
import { Badge } from '../ui/badge';
import { toast } from "../../hooks/use-toast";

interface AddEventDialogProps {
  newEvent: CalendarEvent;
  setNewEvent: React.Dispatch<React.SetStateAction<CalendarEvent>>;
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
  
  // Calculate working days between dates (excluding weekends and holidays)
  const calculateWorkingDays = (startDate: Date, endDate: Date) => {
    let count = 0;
    const currentDate = new Date(startDate);
    
    // Get holidays from localStorage
    const storedEvents = localStorage.getItem('calendarEvents');
    const events = storedEvents ? JSON.parse(storedEvents) : [];
    const holidays = events
      .filter((event: any) => event.type === 'holiday')
      .map((event: any) => new Date(event.date).toDateString());
    
    // Set to same time to avoid time comparison issues
    currentDate.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    
    while (currentDate <= end) {
      // Skip weekends and holidays
      if (!isWeekend(currentDate) && !holidays.includes(currentDate.toDateString())) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return count;
  };
  
  // Update working days count when dates change
  useMemo(() => {
    if (isMultiDay && newEvent.endDate) {
      const workingDaysCount = calculateWorkingDays(newEvent.date, newEvent.endDate);
      setNewEvent(prev => ({
        ...prev,
        workingDaysCount
      }));
    } else {
      setNewEvent(prev => ({
        ...prev,
        workingDaysCount: isWeekend(newEvent.date) ? 0 : 1
      }));
    }
  }, [newEvent.date, newEvent.endDate, isMultiDay]);
  
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
            onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
            placeholder="Terminbezeichnung"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Terminart
          </label>
          <div className="flex flex-wrap gap-2">
            {['meeting', 'absence', 'sick', 'training', 'holiday', 'birthday', 'other'].map((type) => (
              <Badge
                key={type}
                variant={newEvent.type === type ? 'default' : 'outline'}
                className={`cursor-pointer ${
                  // Only allow admin to select holiday type
                  type === 'holiday' && !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => {
                  if (type === 'holiday' && !isAdmin) return;
                  
                  if (type === 'absence' || type === 'sick') {
                    // For absence and sick, default to current user
                    setNewEvent({
                      ...newEvent, 
                      type: type as any,
                      userId: currentUserId
                    });
                  } else {
                    setNewEvent({...newEvent, type: type as any, userId: undefined});
                  }
                }}
              >
                {type === 'meeting' ? 'Meeting' : 
                 type === 'absence' ? 'Urlaub' :
                 type === 'sick' ? 'Krankheit' :
                 type === 'training' ? 'Schulung' :
                 type === 'holiday' ? 'Feiertag' :
                 type === 'birthday' ? 'Geburtstag' : 'Sonstiges'}
              </Badge>
            ))}
          </div>
        </div>
        
        {(newEvent.type === 'absence' || newEvent.type === 'sick') && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Mitarbeiter
            </label>
            <select
              className="w-full px-3 py-2 border border-input rounded-md"
              value={newEvent.userId || ''}
              onChange={(e) => setNewEvent({...newEvent, userId: e.target.value})}
              disabled={!isAdmin}
            >
              <option value="" disabled>Mitarbeiter auswählen</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium">
              Datum
            </label>
            {(newEvent.type === 'absence' || newEvent.type === 'sick') && (
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={isMultiDay}
                  onChange={(e) => {
                    setIsMultiDay(e.target.checked);
                    if (e.target.checked && !newEvent.endDate) {
                      setNewEvent({
                        ...newEvent, 
                        endDate: addDays(newEvent.date, 1)
                      });
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
                  value={format(newEvent.date, 'yyyy-MM-dd')}
                  onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : new Date();
                    setNewEvent({...newEvent, date: newDate});
                    
                    // If end date is before start date, update it
                    if (isMultiDay && newEvent.endDate && newDate > newEvent.endDate) {
                      setNewEvent(prev => ({
                        ...prev, 
                        date: newDate,
                        endDate: addDays(newDate, 1)
                      }));
                    }
                  }}
                />
              </div>
              {!isMultiDay && (
                <div className="text-xs text-muted-foreground mt-1">
                  {format(newEvent.date, 'EEEE, dd. MMMM yyyy', { locale: de })}
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
                    value={format(newEvent.endDate || newEvent.date, 'yyyy-MM-dd')}
                    min={format(newEvent.date, 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const newEndDate = e.target.value ? new Date(e.target.value) : new Date();
                      
                      // Ensure end date is not before start date
                      if (newEndDate >= newEvent.date) {
                        setNewEvent({...newEvent, endDate: newEndDate});
                      } else {
                        toast({
                          title: "Ungültiges Datum",
                          description: "Das Enddatum darf nicht vor dem Startdatum liegen.",
                          variant: "destructive"
                        });
                      }
                    }}
                  />
                </div>
              </div>
            )}
          </div>
          
          {isMultiDay && newEvent.endDate && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{format(newEvent.date, 'dd. MMM yyyy', { locale: de })}</span>
              <span>bis</span>
              <span>{format(newEvent.endDate, 'dd. MMM yyyy', { locale: de })}</span>
            </div>
          )}
          
          {(newEvent.type === 'absence' || newEvent.type === 'sick') && (
            <div className="mt-2 text-sm">
              <span className="font-medium">
                {newEvent.workingDaysCount || 0} Arbeitstage
              </span>
              {isMultiDay && newEvent.endDate && (
                <span className="text-muted-foreground ml-2">
                  ({differenceInCalendarDays(newEvent.endDate, newEvent.date) + 1} Kalendertage)
                </span>
              )}
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="event-description">
            Beschreibung (optional)
          </label>
          <textarea
            id="event-description"
            className="w-full px-3 py-2 border border-input rounded-md"
            rows={3}
            value={newEvent.description || ''}
            onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
            placeholder="Zusätzliche Informationen zum Termin"
          />
        </div>
      </div>
      
      <DialogFooter>
        <button
          className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors"
          onClick={onCancel}
        >
          Abbrechen
        </button>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          onClick={handleSave}
        >
          Speichern
        </button>
      </DialogFooter>
    </DialogContent>
  );
};
