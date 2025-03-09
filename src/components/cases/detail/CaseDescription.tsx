
import React from 'react';
import { FileText } from 'lucide-react';

interface CaseDescriptionProps {
  description: string;
}

export const CaseDescription: React.FC<CaseDescriptionProps> = ({ description }) => {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-border flex items-center gap-2">
        <FileText className="w-5 h-5 text-primary" />
        <h3 className="font-medium">Beschreibung</h3>
      </div>
      
      <div className="p-6">
        <p className="whitespace-pre-wrap">{description}</p>
      </div>
    </div>
  );
};
