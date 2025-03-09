
import React from 'react';
import { User } from '../../types/case';

interface AbsenceStatsTableProps {
  users: User[];
  userAbsenceStats: { userId: string; absence: number; sick: number }[];
}

export const AbsenceStatsTable: React.FC<AbsenceStatsTableProps> = ({ 
  users, 
  userAbsenceStats 
}) => {
  // Get absence stats for a user
  const getUserAbsenceStats = (userId: string) => {
    const stats = userAbsenceStats.find(stat => stat.userId === userId);
    return stats || { absence: 0, sick: 0 };
  };

  return (
    <div className="mb-8 bg-card rounded-xl border border-border p-6">
      <h2 className="text-xl font-bold mb-4">Urlaubsübersicht</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-3 text-left">Mitarbeiter</th>
              <th className="p-3 text-center">Urlaubstage</th>
              <th className="p-3 text-center">Krankheitstage</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => {
              const stats = getUserAbsenceStats(user.id);
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
                    <span className="inline-flex items-center gap-1">
                      <span className="text-blue-500">🏖️</span>
                      {stats.absence}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1">
                      <span className="text-pink-500">🤒</span>
                      {stats.sick}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
