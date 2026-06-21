
import React, { useState, useEffect } from 'react';
import { User } from '../../types/case';
import { Edit } from 'lucide-react';
import { CalendarEvent } from '../../types/calendar';
import { calculateUsedVacationDays, calculateRemainingVacationDays } from '../../utils/calendarUtils';
import { supabase } from '../../lib/supabase';

interface AbsenceStatsTableProps {
  users: User[];
  events: CalendarEvent[];
  isAdmin: boolean;
  onEditAllowance: (user: User) => void;
}

export const AbsenceStatsTable: React.FC<AbsenceStatsTableProps> = ({ users, events, isAdmin, onEditAllowance }) => {
  const currentYear = new Date().getFullYear();
  const [allowances, setAllowances] = useState<Record<string, number>>({});

  useEffect(() => {
    if (users.length === 0) return;
    supabase.from('vacation_allowances').select('user_id,total_days').eq('year', currentYear).then(({ data }) => {
      if (data) {
        const map: Record<string, number> = {};
        data.forEach((row: any) => { map[row.user_id] = row.total_days; });
        setAllowances(map);
      }
    });
  }, [users, currentYear]);

  const getUserStats = (userId: string) => {
    const sickEvents = events.filter(e => e.type === 'sick' && e.userId === userId && new Date(e.date).getFullYear() === currentYear);
    const sickDays = sickEvents.reduce((total, e) => {
      if (!e.endDate) return total + 1;
      const diff = Math.ceil(Math.abs(new Date(e.endDate).getTime() - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return total + diff;
    }, 0);
    return {
      sickDays,
      totalAllowance: allowances[userId] ?? 0,
      usedVacationDays: calculateUsedVacationDays(userId, currentYear, events),
      remainingVacationDays: calculateRemainingVacationDays(userId, currentYear, events),
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
                      <img src={user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
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
                    <span className="inline-flex items-center gap-1"><span className="text-blue-500">🏖️</span><span className="font-medium">{stats.usedVacationDays}</span></span>
                    <span className="text-xs text-muted-foreground block">Arbeitstage</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`font-medium ${stats.remainingVacationDays < 5 ? 'text-amber-500' : ''} ${stats.remainingVacationDays === 0 ? 'text-red-500' : ''}`}>{stats.remainingVacationDays}</span>
                    <span className="text-xs text-muted-foreground block">Verbleibend</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1"><span className="text-pink-500">🤒</span><span className="font-medium">{stats.sickDays}</span></span>
                    <span className="text-xs text-muted-foreground block">Kalendertage</span>
                  </td>
                  {isAdmin && (
                    <td className="p-3 text-center">
                      <button onClick={() => onEditAllowance(user)} className="p-1.5 bg-muted rounded-md hover:bg-muted/80 transition-colors" title="Urlaubsanspruch bearbeiten">
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
