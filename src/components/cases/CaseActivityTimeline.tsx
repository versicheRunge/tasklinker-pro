
import React from 'react';
import { CaseActivity } from '../../types/case';
import { CustomAvatar } from '../ui/CustomAvatar';
import { MessageSquare, FileText, CheckSquare, AlertCircle, Hourglass } from 'lucide-react';

interface CaseActivityTimelineProps {
  activities: CaseActivity[];
}

export const CaseActivityTimeline: React.FC<CaseActivityTimelineProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'comment':
        return <MessageSquare className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      case 'checklist':
        return <CheckSquare className="w-4 h-4" />;
      case 'status':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Hourglass className="w-4 h-4" />;
    }
  };

  const getFormattedDate = (date: string) => {
    return new Date(date).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {activities.map((activity, index) => (
        <div key={index} className="flex gap-4">
          <div className="relative">
            <CustomAvatar name={activity.user.name} imageSrc={activity.user.avatar} size="sm" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
              {getActivityIcon(activity.type)}
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-wrap justify-between items-start gap-2 mb-1">
              <span className="font-medium text-sm">{activity.user.name}</span>
              <span className="text-xs text-muted-foreground">
                {getFormattedDate(activity.timestamp)}
              </span>
            </div>
            
            <div className="text-sm">
              {activity.content}
            </div>
          </div>
        </div>
      ))}
      
      {activities.length === 0 && (
        <p className="text-sm text-muted-foreground">Keine Aktivitäten vorhanden</p>
      )}
    </div>
  );
};
