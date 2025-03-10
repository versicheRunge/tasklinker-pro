
import React from 'react';
import { Badge } from '../../ui/badge';
import { CalendarEvent } from '../../../types/calendar';

interface EventTypeSelectorProps {
  selectedType: string;
  onTypeChange: (type: CalendarEvent['type']) => void;
  isAdmin: boolean;
}

export const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({
  selectedType,
  onTypeChange,
  isAdmin
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">
        Terminart
      </label>
      <div className="flex flex-wrap gap-2">
        {['meeting', 'absence', 'sick', 'training', 'holiday', 'birthday', 'other'].map((type) => (
          <Badge
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            className={`cursor-pointer ${
              // Only allow admin to select holiday type
              type === 'holiday' && !isAdmin ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => {
              if (type === 'holiday' && !isAdmin) return;
              onTypeChange(type as CalendarEvent['type']);
            }}
          >
            {type === 'meeting' ? 'Meeting' : 
             type === 'absence' ? 'Urlaub' :
             type === 'sick' ? 'Krankheit' :
             type === 'training' ? 'Schulung' :
             type === 'holiday' ? 'Feiertag' :
             type === 'birthday' ? 'Geburtstag' : 'Sonstiges'}
          </Badge>
        ))}
      </div>
    </div>
  );
};
