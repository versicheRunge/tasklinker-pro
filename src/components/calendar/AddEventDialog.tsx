
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { CalendarEvent } from '../../types/calendar';
import { User } from '../../types/case';
import { calculateWorkingDays, getGermanHolidays } from '../../utils/calendarUtils';

interface AddEventDialogProps {
  newEvent: Omit<CalendarEvent, 'id'>;
  setNewEvent: React.Dispatch<React.SetStateAction<Omit<CalendarEvent, 'id'>>>;
  onCancel: () => void;
  onSave: () => void;
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
  const [workingDays, setWorkingDays] = useState<number | null>(null);
  
  // Calculate working days for vacation periods
  useEffect(() => {
    if (newEvent.type === 'absence' && newEvent.date && newEvent.endDate) {
      const currentYear = new Date().getFullYear();
      const holidays = [...getGermanHolidays(currentYear), ...getGermanHolidays(currentYear + 1)];
      const days = calculateWorkingDays(newEvent.date, newEvent.endDate, holidays);
      setWorkingDays(days);
    } else {
      setWorkingDays(null);
    }
  }, [newEvent.type, newEvent.date, newEvent.endDate]);

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Neuen Termin eintragen</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="event-title">
            Titel*
          </label>
          <input
            id="event-title"
            className="w-full p-2 rounded-md border border-input"
            value={newEvent.title}
            onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="event-type">
              Typ
            </label>
            <select
              id="event-type"
              className="w-full p-2 rounded-md border border-input"
              value={newEvent.type}
              onChange={(e) => setNewEvent({...newEvent, type: e.target.value as any})}
            >
              <option value="meeting">Meeting</option>
              <option value="training">Schulung</option>
              <option value="absence">Urlaub</option>
              <option value="sick">Krankheit</option>
              <option value="birthday">Geburtstag</option>
              <option value="other">Sonstiges</option>
            </select>
          </div>
          
          {(newEvent.type === 'absence' || newEvent.type === 'sick') && isAdmin && (
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="event-user">
                Mitarbeiter
              </label>
              <select
                id="event-user"
                className="w-full p-2 rounded-md border border-input"
                value={newEvent.userId || currentUserId}
                onChange={(e) => setNewEvent({...newEvent, userId: e.target.value})}
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Startdatum
            </label>
            <input
              type="date"
              className="w-full p-2 rounded-md border border-input"
              value={format(newEvent.date, 'yyyy-MM-dd')}
              onChange={(e) => setNewEvent({
                ...newEvent, 
                date: e.target.value ? new Date(e.target.value) : new Date()
              })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Enddatum (optional)
            </label>
            <input
              type="date"
              className="w-full p-2 rounded-md border border-input"
              value={newEvent.endDate ? format(newEvent.endDate, 'yyyy-MM-dd') : ''}
              onChange={(e) => setNewEvent({
                ...newEvent, 
                endDate: e.target.value ? new Date(e.target.value) : undefined
              })}
            />
          </div>
        </div>
        
        {newEvent.type === 'absence' && workingDays !== null && (
          <div className="bg-muted/50 p-3 rounded-md">
            <p className="text-sm">
              <strong>Arbeitstage: {workingDays}</strong>
              <span className="block text-xs text-muted-foreground mt-1">
                Es werden nur Arbeitstage (Mo-Fr) ohne Feiertage gezählt.
              </span>
            </p>
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="event-description">
            Beschreibung
          </label>
          <textarea
            id="event-description"
            className="w-full p-2 rounded-md border border-input min-h-[80px]"
            value={newEvent.description || ''}
            onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
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
          onClick={onSave}
        >
          Termin speichern
        </button>
      </DialogFooter>
    </DialogContent>
  );
};
