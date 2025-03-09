
import React, { useState } from 'react';
import { User } from '../../types/case';
import { Edit } from 'lucide-react';
import { CalendarEvent } from '../../types/calendar';
import { getVacationAllowance, calculateUsedVacationDays, calculateRemainingVacationDays } from '../../utils/calendarUtils';

interface AbsenceStatsTableProps {
  users: User[];
  events: CalendarEvent[];
  isAdmin: boolean;
  onEditAllowance: (user: User) => void;
}

export const AbsenceStatsTable: React.FC<AbsenceStatsTableProps> = ({ 
  users, 
  events,
  isAdmin,
  onEditAllowance
}) => {
  const currentYear = new Date().getFullYear();

  // Calculate statistics for a user
  const getUserStats = (userId: string) => {
    // Count all sick days (including both working and non-working days)
    const sickEvents = events.filter(event => 
      event.type === 'sick' && 
      event.userId === userId &&
      new Date(event.date).getFullYear() === currentYear
    );
    
    const sickDays = sickEvents.reduce((total, event) => {
      if (!event.endDate) return total + 1;
      
      // Calculate days between dates for multi-day events
      const start = new Date(event.date);
      const end = new Date(event.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      return total + diffDays;
    }, 0);
    
    // Get used and remaining vacation days (only working days)
    const totalAllowance = getVacationAllowance(userId, currentYear);
    const usedVacationDays = calculateUsedVacationDays(userId, currentYear, events);
    const remainingVacationDays = calculateRemainingVacationDays(userId, currentYear, events);
    
    return {
      sickDays,
      totalAllowance,
      usedVacationDays,
      remainingVacationDays
    };
  };

  return (
    <div className="mb-8 bg-card rounded-xl border border-border p-6">
      <h2 className="text-xl font-bold mb-4">Urlaubsübersicht {currentYear}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-3 text-left">Mitarbeiter</th>
              <th className="p-3 text-center">Urlaubs­anspruch</th>
              <th className="p-3 text-center">Genommene Urlaubstage</th>
              <th className="p-3 text-center">Verbleibende Urlaubstage</th>
              <th className="p-3 text-center">Krankheitstage</th>
              {isAdmin && <th className="p-3 text-center">Aktionen</th>}
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const stats = getUserStats(user.id);
              return (
                <tr key={user.id} className="border-b border-border hover:bg-muted/20">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img 
                        src={user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                        alt={user.name} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <span className="font-medium">{stats.totalAllowance}</span>
                    <span className="text-xs text-muted-foreground block">Tage pro Jahr</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-blue-500">🏖️</span>
                      <span className="font-medium">{stats.usedVacationDays}</span>
                    </span>
                    <span className="text-xs text-muted-foreground block">Arbeitstage</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`font-medium ${stats.remainingVacationDays < 5 ? 'text-amber-500' : ''} ${stats.remainingVacationDays === 0 ? 'text-red-500' : ''}`}>
                      {stats.remainingVacationDays}
                    </span>
                    <span className="text-xs text-muted-foreground block">Verbleibend</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-pink-500">🤒</span>
                      <span className="font-medium">{stats.sickDays}</span>
                    </span>
                    <span className="text-xs text-muted-foreground block">Kalendertage</span>
                  </td>
                  {isAdmin && (
                    <td className="p-3 text-center">
                      <button 
                        onClick={() => onEditAllowance(user)}
                        className="p-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors"
                        title="Urlaubsanspruch bearbeiten"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
