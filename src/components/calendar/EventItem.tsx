
import React from 'react';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { CustomBadge } from '../ui/CustomBadge';
import { CalendarEvent } from '../../types/calendar';
import { User } from '../../types/case';
import { getEventEmoji, getEventBadgeVariant, formatDate } from '../../utils/calendarUtils';
import { USER_COLORS } from '../../contexts/UserTypes';

interface EventItemProps {
  event: CalendarEvent;
  users: User[];
  currentUserId?: string;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  onView: (event: CalendarEvent) => void;
}

export const EventItem: React.FC<EventItemProps> = ({ 
  event, 
  users, 
  currentUserId, 
  isAdmin, 
  onDelete, 
  onView 
}) => {
  const getUserColor = (userId?: string) => {
    if (!userId) return 'text-muted-foreground';
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return 'text-muted-foreground';
    
    return USER_COLORS[userIndex % USER_COLORS.length].primary;
  };

  // Determine if the current user can delete this event
  const canDeleteEvent = isAdmin || 
    (event.createdBy === currentUserId && 
     event.type !== 'holiday' && 
     event.type !== 'absence' && 
     event.type !== 'sick');

  return (
    <div 
      className="flex justify-between items-start p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
      onClick={() => onView(event)}
    >
      <div className="flex gap-3">
        <CalendarIcon className={`w-5 h-5 ${
          event.type === 'holiday' ? 'text-red-500' : 
          event.type === 'absence' && event.userId ? getUserColor(event.userId) :
          event.type === 'sick' ? 'text-pink-500' :
          event.type === 'birthday' ? 'text-green-500' :
          event.type === 'training' ? 'text-amber-500' :
          'text-muted-foreground'
        }`} />
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{event.title}</h3>
            <CustomBadge 
              icon={getEventEmoji(event.type)} 
              label={event.type === 'holiday' ? 'Feiertag' : 
                    event.type === 'absence' ? 'Urlaub' :
                    event.type === 'sick' ? 'Krankheit' :
                    event.type === 'training' ? 'Schulung' :
                    event.type === 'meeting' ? 'Meeting' : 
                    event.type === 'birthday' ? 'Geburtstag' : 'Sonstiges'}
              variant={getEventBadgeVariant(event.type) as any}
            />
          </div>
          {event.description && (
            <p className="text-sm text-muted-foreground mt-1">
              {event.description}
            </p>
          )}
          {event.endDate && (
            <p className="text-xs text-muted-foreground mt-2">
              {formatDate(event.date)} - {formatDate(event.endDate)}
            </p>
          )}
          {event.type === 'absence' && event.workingDaysCount !== undefined && (
            <p className="text-xs mt-1">
              <span className="text-blue-500 font-medium">{event.workingDaysCount} Arbeitstage</span>
            </p>
          )}
          {(event.type === 'absence' || event.type === 'sick') && event.userId && (
            <p className="text-xs text-muted-foreground mt-1">
              Mitarbeiter: {users.find(u => u.id === event.userId)?.name || 'Unbekannt'}
            </p>
          )}
        </div>
      </div>
      
      {canDeleteEvent && (
        <div className="flex items-center gap-1">
          <button 
            className="p-1 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(event.id);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
