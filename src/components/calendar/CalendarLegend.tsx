
import React from 'react';
import { USER_COLORS } from '../../contexts/UserTypes';
import { User } from '../../types/case';
import { getEventEmoji } from '../../utils/calendarUtils';

interface CalendarLegendProps {
  users: User[];
  isAdmin: boolean;
}

export const CalendarLegend: React.FC<CalendarLegendProps> = ({ users, isAdmin }) => {
  const usersWithColors = users.map((user, index) => ({
    ...user,
    color: USER_COLORS[index % USER_COLORS.length].primary
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h2 className="text-lg font-medium mb-2">Legende</h2>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-sm">Feiertag {getEventEmoji('holiday')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-primary" />
          <span className="text-sm">Termin {getEventEmoji('meeting')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-sm">Schulung {getEventEmoji('training')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-sm">Urlaub {getEventEmoji('absence')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-pink-500" />
          <span className="text-sm">Krankheit {getEventEmoji('sick')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm">Geburtstag {getEventEmoji('birthday')}</span>
        </div>
      </div>
      
      {isAdmin && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Mitarbeiterfarben</h3>
          <div className="grid grid-cols-2 gap-2">
            {usersWithColors.map((user, index) => (
              <div key={user.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${USER_COLORS[index % USER_COLORS.length].primary}`} />
                <span className="text-sm">{user.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
