
export type CaseStatus = 'new' | 'in_progress' | 'waiting' | 'completed';
export type CaseType = 'damage' | 'evb' | 'contract_change' | 'inquiry' | 'other';

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
    completing: number;
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
}

export interface CaseActivity {
  id: string;
  type: 'comment' | 'status' | 'document' | 'checklist' | 'other';
  content: string;
  timestamp: string;
  user: User;
  caseId?: string; // Add caseId to track which case this activity belongs to
  attachment?: {
    name: string;
    size: string;
  };
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
  activities: CaseActivity[];
  checklist: ChecklistItemType[];
  documents?: Document[];
  archived?: boolean; // Add archived flag
}

// Templates for checklists
export interface ChecklistTemplate {
  id: string;
  title: string;
  type: CaseType;
  items: ChecklistItemType[];
}
