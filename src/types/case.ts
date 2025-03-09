
export type CaseStatus = 'new' | 'in_progress' | 'waiting' | 'completed';
export type CaseType = 'damage' | 'evb' | 'contract_change' | 'inquiry' | 'other' | string;
export type CasePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  email?: string;
  phone?: string;
  department?: string;
  userRole?: 'admin' | 'staff';
  stats?: {
    casesHandled: number;
    inProgress: number;
    completed: number;
  };
}

export interface SubChecklistItem {
  text: string;
  completed: boolean;
}

export interface ChecklistItemType {
  text: string;
  description?: string;
  completed: boolean;
  subItems?: SubChecklistItem[];
}

export interface Document {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadedAt: string;
  uploadedBy: User;
  file?: File;
  url?: string;
}

export interface CaseActivity {
  id: string;
  type: 'comment' | 'status' | 'document' | 'checklist' | 'assignment' | 'other';
  content: string;
  timestamp: string;
  user: User;
  caseId?: string; // Add caseId to track which case this activity belongs to
  attachment?: {
    name: string;
    size: string;
    url?: string;
  };
  mentions?: string[]; // Array of user IDs mentioned in a comment
}

export interface CaseItem {
  id: string;
  title: string;
  description: string;
  status: CaseStatus;
  type: CaseType;
  createdAt: string;
  lastUpdated: string;
  assignee: User;
  creator?: User; // Added to track who created the case
  activities: CaseActivity[];
  checklist: ChecklistItemType[];
  documents?: Document[];
  archived?: boolean; // Add archived flag
  customerName?: string; // Added for PDF export filename
  
  // Neue Felder für erweiterte Funktionalität
  dueDate?: string; // Zu erledigen bis (optional)
  followUpDate?: string; // Wiedervorlage am (optional)
  priority?: CasePriority; // Priorität der Aufgabe (optional)
  reminderSent?: boolean; // Flag ob bereits eine Erinnerung gesendet wurde
}

// Templates for checklists
export interface ChecklistTemplate {
  id: string;
  title: string;
  type: CaseType;
  items: ChecklistItemType[];
}

// Default case titles that can be selected
export interface CaseDefaultTitle {
  id: string;
  title: string;
  type: CaseType;
}

// Notification system
export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: string; // Typ der Benachrichtigung (z.B. 'case', 'chat', 'system')
  caseId?: string;
  targetUserId?: string; // Added to target specific users
}
