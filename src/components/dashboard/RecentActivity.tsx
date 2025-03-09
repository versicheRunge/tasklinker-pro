
import React from 'react';
import { CaseActivity } from '../../types/case';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useNavigate } from 'react-router-dom';

interface RecentActivityProps {
  activities: CaseActivity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const navigate = useNavigate();
  
  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Gerade eben';
    if (diffInMinutes < 60) return `vor ${diffInMinutes} Minuten`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `vor ${diffInHours} Stunden`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Gestern';
    if (diffInDays < 7) return `vor ${diffInDays} Tagen`;
    
    return activityDate.toLocaleDateString('de-DE');
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleActivityClick = (caseId: string) => {
    navigate(`/cases/${caseId}`);
  };

  return (
    <div className="p-6 rounded-xl border border-border bg-card h-full animate-scale-in">
      <h2 className="text-lg font-medium mb-4">Neueste Aktivitäten</h2>
      <div className="space-y-4">
        {activities.slice(0, 5).map((activity, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 py-2 border-b border-border last:border-0 cursor-pointer hover:bg-muted/30 rounded-md p-2 transition-colors"
            onClick={() => handleActivityClick(activity.caseId)}
          >
            <Avatar className="h-8 w-8">
              {activity.user.avatar ? (
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              ) : (
                <AvatarFallback>{getInitials(activity.user.name)}</AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm font-medium truncate">{activity.user.name}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTimeAgo(activity.timestamp)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {activity.content}
              </p>
            </div>
          </div>
        ))}
        
        {activities.length === 0 && (
          <p className="text-sm text-muted-foreground">Keine Aktivitäten vorhanden</p>
        )}
      </div>
    </div>
  );
};
