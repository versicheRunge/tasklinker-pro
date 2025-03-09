
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
  workingDaysCount?: number; // Number of working days (excluding weekends and holidays)
}

export type AdminViewType = 'all' | 'absences' | 'sick';

export type BadgeVariant = "destructive" | "secondary" | "warning" | "default" | "success" | "outline" | "priority-high" | "priority-medium" | "priority-low" | "priority-none";

export interface VacationAllowance {
  userId: string;
  year: number;
  totalDays: number;
}
