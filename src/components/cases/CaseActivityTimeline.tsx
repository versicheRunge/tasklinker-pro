
import React from 'react';
import { CaseActivity } from '../../types/case';
import { CustomAvatar } from '../ui/CustomAvatar';
import { MessageSquare, FileText, CheckSquare, AlertCircle, Hourglass, Phone, StickyNote, UserCheck } from 'lucide-react';

interface CaseActivityTimelineProps {
  activities: CaseActivity[];
}

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
  comment:    { icon: <MessageSquare className="w-3.5 h-3.5" />, label: 'Kommentar',    color: 'bg-blue-100 text-blue-600' },
  phone:      { icon: <Phone className="w-3.5 h-3.5" />,        label: 'Telefonnotiz', color: 'bg-green-100 text-green-600' },
  note:       { icon: <StickyNote className="w-3.5 h-3.5" />,   label: 'Notiz',        color: 'bg-amber-100 text-amber-600' },
  document:   { icon: <FileText className="w-3.5 h-3.5" />,     label: 'Dokument',     color: 'bg-purple-100 text-purple-600' },
  checklist:  { icon: <CheckSquare className="w-3.5 h-3.5" />,  label: 'Checkliste',   color: 'bg-teal-100 text-teal-600' },
  status:     { icon: <AlertCircle className="w-3.5 h-3.5" />,  label: 'Status',       color: 'bg-gray-100 text-gray-600' },
  assignment: { icon: <UserCheck className="w-3.5 h-3.5" />,    label: 'Zuweisung',    color: 'bg-indigo-100 text-indigo-600' },
  other:      { icon: <Hourglass className="w-3.5 h-3.5" />,    label: '',             color: 'bg-gray-100 text-gray-500' },
};

export const CaseActivityTimeline: React.FC<CaseActivityTimelineProps> = ({ activities }) => {
  const getFormattedDate = (date: string) =>
    new Date(date).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const isSystemEntry = (type: string) => ['status', 'assignment', 'checklist', 'document'].includes(type);

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const cfg = TYPE_CONFIG[activity.type] ?? TYPE_CONFIG.other;
        const system = isSystemEntry(activity.type);

        if (system) {
          return (
            <div key={index} className="flex items-center gap-3 text-xs text-muted-foreground py-1">
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full ${cfg.color} shrink-0`}>{cfg.icon}</span>
              <span className="flex-1">{activity.user.name} · {activity.content}</span>
              <span className="shrink-0">{getFormattedDate(activity.timestamp)}</span>
            </div>
          );
        }

        return (
          <div key={index} className={`flex gap-3 p-3 rounded-lg border ${activity.type === 'phone' ? 'border-green-200 bg-green-50/50' : activity.type === 'note' ? 'border-amber-200 bg-amber-50/50' : 'border-border bg-muted/20'}`}>
            <div className="shrink-0">
              <CustomAvatar name={activity.user.name} imageSrc={activity.user.avatar} size="sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap justify-between items-center gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{activity.user.name}</span>
                  <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{getFormattedDate(activity.timestamp)}</span>
              </div>
              <div className="text-sm whitespace-pre-wrap">{activity.content}</div>
            </div>
          </div>
        );
      })}

      {activities.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-6">Noch keine Aktivitäten</p>
      )}
    </div>
  );
};
