
export interface EmailTemplate {
  id: string;
  title: string;
  subject: string;
  content: string;
  order: number;
  category: 'general' | 'damage' | 'contract' | 'inquiry' | 'evb' | 'other';
  tags: string[]; // For placeholder identification
  createdAt: string;
  updatedAt: string;
}

export interface EmailSignature {
  userId: string;
  content: string;
  includeCompanyLogo: boolean; // We keep this for data compatibility but don't use it in UI
  includeUserDetails: boolean;
  updatedAt: string;
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  from?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    name: string;
    content: string; // Base64
    contentType: string;
  }>;
}
