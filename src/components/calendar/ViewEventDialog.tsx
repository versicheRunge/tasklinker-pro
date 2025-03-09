
import React from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Badge } from '../ui/badge';
import { CalendarEvent, BadgeVariant } from '../../types/calendar';
import { User } from '../../types/case';
import { getEventEmoji, getEventBadgeVariant, formatDate } from '../../utils/calendarUtils';
import { USER_COLORS } from '../../contexts/UserTypes';

interface ViewEventDialogProps {
  event: CalendarEvent;
  onClose: () => void;
  onDelete: (id: string) => void;
  users: User[];
  currentUserId?: string;
  isAdmin: boolean;
}

export const ViewEventDialog: React.FC<ViewEventDialogProps> = ({
  event,
  onClose,
  onDelete,
  users,
  currentUserId,
  isAdmin
}) => {
  const getUserColor = (userId?: string) => {
    if (!userId) return 'bg-gray-400';
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return 'bg-gray-400';
    
    return USER_COLORS[userIndex % USER_COLORS.length].primary;
  };

  // Determine if the current user can delete this event
  const canDeleteEvent = isAdmin || 
    (event.createdBy === currentUserId && 
     event.type !== 'holiday' && 
     event.type !== 'absence' && 
     event.type !== 'sick');

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <span>{getEventEmoji(event.type)} {event.title}</span>
          <Badge variant={getEventBadgeVariant(event.type)}>
            {event.type === 'holiday' ? 'Feiertag' : 
             event.type === 'absence' ? 'Urlaub' :
             event.type === 'sick' ? 'Krankheit' :
             event.type === 'training' ? 'Schulung' :
             event.type === 'meeting' ? 'Meeting' : 
             event.type === 'birthday' ? 'Geburtstag' : 'Sonstiges'}
          </Badge>
        </DialogTitle>
        <DialogDescription>
          {formatDate(event.date)}
          {event.endDate && ` - ${formatDate(event.endDate)}`}
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        {event.description && (
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-1">Beschreibung</h3>
            <p className="text-sm text-muted-foreground">
              {event.description}
            </p>
          </div>
        )}
        
        {(event.type === 'absence' || event.type === 'sick') && event.userId && (
          <div>
            <h3 className="text-sm font-medium mb-1">Mitarbeiter</h3>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getUserColor(event.userId)}`} />
              <p className="text-sm text-muted-foreground">
                {users.find(u => u.id === event.userId)?.name || 'Unbekannt'}
              </p>
            </div>
          </div>
        )}
      </div>
      <DialogFooter>
        <button
          className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors"
          onClick={onClose}
        >
          Schließen
        </button>
        {canDeleteEvent && (
          <button
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors"
            onClick={() => onDelete(event.id)}
          >
            Termin löschen
          </button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};
