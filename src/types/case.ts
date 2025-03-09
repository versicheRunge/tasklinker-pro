
export type CaseStatus = 'new' | 'in_progress' | 'waiting' | 'completed';
export type CaseType = 'damage' | 'evb' | 'contract_change' | 'inquiry' | 'other';

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  email?: string;
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
}
