
import React, { useState } from 'react';
import { CaseCard } from './CaseCard';
import { CaseItem, CaseStatus, CaseType } from '../../types/case';

interface CasesListProps {
  cases: CaseItem[];
}

export const CasesList: React.FC<CasesListProps> = ({ cases }) => {
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CaseType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCases = cases.filter(caseItem => {
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
    const matchesType = typeFilter === 'all' || caseItem.type === typeFilter;
    const matchesSearch = 
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      caseItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && (searchTerm === '' || matchesSearch);
  });

  const statusOptions = [
    { value: 'all', label: 'Alle Status' },
    { value: 'new', label: 'Neu' },
    { value: 'in_progress', label: 'In Bearbeitung' },
    { value: 'waiting', label: 'Wartet auf Rückmeldung' },
    { value: 'completed', label: 'Erledigt' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Alle Typen' },
    { value: 'damage', label: 'Schadenmeldung' },
    { value: 'evb', label: 'eVB-Anfrage' },
    { value: 'contract_change', label: 'Vertragsänderung' },
    { value: 'inquiry', label: 'Kundenanfrage' },
    { value: 'other', label: 'Sonstiges' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Vorgänge durchsuchen..."
            className="w-full p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select
            className="p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CaseStatus | 'all')}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          <select
            className="p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as CaseType | 'all')}
          >
            {typeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {filteredCases.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map(caseItem => (
            <CaseCard key={caseItem.id} caseItem={caseItem} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Keine Vorgänge gefunden</p>
        </div>
      )}
    </div>
  );
};
