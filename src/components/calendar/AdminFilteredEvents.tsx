
import React from 'react';
import { UserCheck, HeartPulse, Trash2 } from 'lucide-react';
import { CustomBadge } from '../ui/CustomBadge';
import { CalendarEvent } from '../../types/calendar';
import { User } from '../../types/case';
import { getEventEmoji, getEventBadgeVariant, formatDate } from '../../utils/calendarUtils';
import { USER_COLORS } from '../../contexts/UserTypes';

interface AdminFilteredEventsProps {
  filteredEvents: CalendarEvent[];
  adminView: 'all' | 'absences' | 'sick';
  users: User[];
  onView: (event: CalendarEvent) => void;
  onDelete: (id: string) => void;
}

export const AdminFilteredEvents: React.FC<AdminFilteredEventsProps> = ({
  filteredEvents,
  adminView,
  users,
  onView,
  onDelete
}) => {
  const getUserColor = (userId?: string) => {
    if (!userId) return 'bg-gray-400';
    
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return 'bg-gray-400';
    
    return USER_COLORS[userIndex % USER_COLORS.length].primary;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-2">
        {adminView === 'absences' ? 'Urlaubsübersicht' : 'Krankheitsübersicht'}
      </h3>
      
      {filteredEvents.length > 0 ? (
        <div className="space-y-3">
          {filteredEvents.map((event) => (
            <div 
              key={event.id} 
              className="flex justify-between items-start p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onView(event)}
            >
              <div className="flex gap-3">
                {event.type === 'absence' ? (
                  <UserCheck className={`w-5 h-5 ${getUserColor(event.userId)}`} />
                ) : (
                  <HeartPulse className="w-5 h-5 text-pink-500" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{event.title}</h3>
                    <CustomBadge 
                      icon={getEventEmoji(event.type)} 
                      label={event.type === 'absence' ? 'Urlaub' : 'Krankheit'}
                      variant={getEventBadgeVariant(event.type) as any}
                    />
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {event.description}
                    </p>
                  )}
                  {event.userId && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Mitarbeiter: {users.find(u => u.id === event.userId)?.name || 'Unbekannt'}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDate(event.date)}
                    {event.endDate && ` - ${formatDate(event.endDate)}`}
                  </p>
                </div>
              </div>
              
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
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Keine Einträge gefunden
        </div>
      )}
    </div>
  );
};
