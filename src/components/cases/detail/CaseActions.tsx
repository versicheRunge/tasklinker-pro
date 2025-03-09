
import React from 'react';
import { Download, Save, Archive, RefreshCw } from 'lucide-react';
import { Button } from '../../ui/button';

interface CaseActionsProps {
  onGeneratePDF: () => void;
  onArchiveCase: () => void;
}

export const CaseActions: React.FC<CaseActionsProps> = ({
  onGeneratePDF,
  onArchiveCase,
}) => {
  return (
    <div className="space-y-3 sticky top-4">
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-medium">Aktionen</h3>
        </div>
        
        <div className="p-4 space-y-2">
          <Button 
            variant="outline" 
            className="w-full justify-start text-left"
            onClick={onGeneratePDF}
          >
            <Download className="mr-2" /> PDF exportieren
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-left"
            onClick={onArchiveCase}
          >
            <Archive className="mr-2" /> Vorgang archivieren
          </Button>
        </div>
      </div>
    </div>
  );
};
