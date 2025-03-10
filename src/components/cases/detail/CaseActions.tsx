
import React from 'react';
import { FileText, ArchiveIcon, Mail } from 'lucide-react';
import { CaseItem, User } from '../../../types/case';
import EmailTemplateSelector from '../EmailTemplateSelector';

interface CaseActionsProps {
  onGeneratePDF: () => void;
  onArchiveCase: () => void;
  caseItem: CaseItem;
  currentUser: User | null;
}

export const CaseActions: React.FC<CaseActionsProps> = ({
  onGeneratePDF,
  onArchiveCase,
  caseItem,
  currentUser
}) => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <h2 className="text-lg font-medium mb-4">Aktionen</h2>
      
      <div className="space-y-3">
        <button
          className="flex items-center gap-2 w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          onClick={onGeneratePDF}
        >
          <FileText className="w-4 h-4" />
          <span>PDF exportieren</span>
        </button>
        
        <EmailTemplateSelector 
          caseItem={caseItem}
          currentUser={currentUser}
        />
        
        <button
          className="flex items-center gap-2 w-full px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
          onClick={onArchiveCase}
        >
          <ArchiveIcon className="w-4 h-4" />
          <span>Vorgang archivieren</span>
        </button>
      </div>
    </div>
  );
};
