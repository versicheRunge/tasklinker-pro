
import { User } from './case';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  endDate?: Date;
  type: 'holiday' | 'absence' | 'sick' | 'training' | 'meeting' | 'birthday' | 'other';
  description?: string;
  userId?: string; // For absence events to track which user is absent
  createdBy?: string; // To track who created the event
}

export type AdminViewType = 'all' | 'absences' | 'sick';
