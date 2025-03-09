
import React, { useState } from 'react';
import { CaseCard } from './CaseCard';
import { CaseItem, CaseStatus, CaseType } from '../../types/case';
import { Archive, Download, Trash } from 'lucide-react';
import { toast } from "../../hooks/use-toast";
import { useUser } from '../../contexts/UserContext';

interface CasesListProps {
  cases: CaseItem[];
  updateCase: (id: string, caseData: Partial<CaseItem>) => void;
  showCompletedSection?: boolean;
}

export const CasesList: React.FC<CasesListProps> = ({ cases, updateCase, showCompletedSection = true }) => {
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CaseType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin } = useUser();

  // Filter out archived cases
  const filteredCases = cases.filter(c => !c.archived);
  
  const activeCases = filteredCases.filter(c => c.status !== 'completed');
  const completedCases = filteredCases.filter(c => c.status === 'completed');

  const filteredActiveCases = activeCases.filter(caseItem => {
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
    const matchesType = typeFilter === 'all' || caseItem.type === typeFilter;
    const matchesSearch = 
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      caseItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesType && (searchTerm === '' || matchesSearch);
  });

  const filteredCompletedCases = completedCases.filter(caseItem => {
    const matchesType = typeFilter === 'all' || caseItem.type === typeFilter;
    const matchesSearch = 
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      caseItem.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && (searchTerm === '' || matchesSearch);
  });

  const statusOptions = [
    { value: 'all', label: 'Alle Status' },
    { value: 'new', label: 'Neu' },
    { value: 'in_progress', label: 'In Bearbeitung' },
    { value: 'waiting', label: 'Wartet auf Rückmeldung' }
  ];

  const typeOptions = [
    { value: 'all', label: 'Alle Typen' },
    { value: 'damage', label: 'Schadenmeldung' },
    { value: 'evb', label: 'eVB-Anfrage' },
    { value: 'contract_change', label: 'Vertragsänderung' },
    { value: 'inquiry', label: 'Kundenanfrage' },
    { value: 'other', label: 'Sonstiges' }
  ];

  const handleExportCompleted = () => {
    // In a real app, this would generate a CSV or PDF
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(completedCases));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "abgeschlossene_vorgaenge.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast({
      title: "Export erfolgreich",
      description: "Die abgeschlossenen Vorgänge wurden erfolgreich exportiert.",
    });
  };

  const handleArchiveAll = () => {
    completedCases.forEach(caseItem => {
      updateCase(caseItem.id, { archived: true });
    });
    
    toast({
      title: "Archivierung abgeschlossen",
      description: `${completedCases.length} abgeschlossene Vorgänge wurden archiviert.`,
    });
  };

  return (
    <div className="space-y-8">
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
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Aktive Vorgänge</h2>
        {filteredActiveCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActiveCases.map(caseItem => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Keine aktiven Vorgänge gefunden</p>
          </div>
        )}
      </div>
      
      {showCompletedSection && completedCases.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Abgeschlossene Vorgänge</h2>
            
            <div className="flex gap-2">
              <button 
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                onClick={handleExportCompleted}
              >
                <Download className="w-4 h-4" />
                Exportieren
              </button>
              
              {isAdmin && (
                <button 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  onClick={handleArchiveAll}
                >
                  <Archive className="w-4 h-4" />
                  Alle archivieren
                </button>
              )}
            </div>
          </div>
          
          {filteredCompletedCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompletedCases.map(caseItem => (
                <CaseCard key={caseItem.id} caseItem={caseItem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <p className="text-muted-foreground">Keine abgeschlossenen Vorgänge gefunden</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
