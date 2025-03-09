
export interface Message {
  id: string;
  userId: string;
  text: string;
  timestamp: string;
  mentions: string[];
  attachments?: { type: 'image' | 'file', url: string, name: string }[];
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  role?: string;
  userRole?: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'channel' | 'direct' | 'group';
  participants?: string[];
  unread?: boolean;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  caseId?: string;
  targetUserId?: string;
  type: 'chat' | 'case' | 'system';
}
