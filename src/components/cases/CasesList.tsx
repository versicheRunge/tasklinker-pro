
import React, { useState } from 'react';
import { CaseCard } from './CaseCard';
import { CaseItem, CaseStatus, CaseType } from '../../types/case';
import { Archive, Download, Trash, Filter } from 'lucide-react';
import { toast } from "../../hooks/use-toast";
import { useUser } from '../../contexts/UserContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from '../ui/button';
import { generatePDF } from './detail/CaseHelpers';
import { Checkbox } from '../ui/checkbox';

interface CasesListProps {
  cases: CaseItem[];
  updateCase: (id: string, caseData: Partial<CaseItem>) => void;
  showCompletedSection?: boolean;
}

export const CasesList: React.FC<CasesListProps> = ({ cases, updateCase, showCompletedSection = true }) => {
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CaseType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { isAdmin, currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('mine');
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Filter out archived cases and ensure all cases have valid assignee
  const filteredCases = cases.filter(c => !c.archived && c.assignee);
  
  // Filter cases belonging to current user (with null/undefined check)
  const myCases = currentUser ? 
    filteredCases.filter(c => 
      c.assignee && c.assignee.id === currentUser.id || 
      (c.creator && c.creator.id === currentUser.id)
    ) : 
    [];
  
  const casesToUse = activeTab === 'mine' ? myCases : filteredCases;
  
  const activeCases = casesToUse.filter(c => c.status !== 'completed');
  const completedCases = casesToUse.filter(c => c.status === 'completed');

  // Custom sort function based on completion date, priority, then status
  const sortCases = (a: CaseItem, b: CaseItem) => {
    // First sort by completion date (if completed)
    if (a.status === 'completed' && b.status === 'completed') {
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    }
    
    // Then sort by priority (high to low)
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3, none: 4 };
    const aPriority = a.priority || 'none';
    const bPriority = b.priority || 'none';
    
    if (priorityOrder[aPriority] !== priorityOrder[bPriority]) {
      return priorityOrder[aPriority] - priorityOrder[bPriority];
    }
    
    // Finally sort by status (new, in_progress, waiting)
    const statusOrder = { new: 0, in_progress: 1, waiting: 2, completed: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  };

  // Sort all cases
  const sortedActiveCases = [...activeCases].sort(sortCases);
  const sortedCompletedCases = [...completedCases].sort((a, b) => 
    new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );

  const filteredActiveCases = sortedActiveCases.filter(caseItem => {
    const matchesStatus = statusFilter === 'all' || caseItem.status === statusFilter;
    const matchesType = typeFilter === 'all' || caseItem.type === typeFilter;
    const matchesSearch = 
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      caseItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (caseItem.customerName && caseItem.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesStatus && matchesType && (searchTerm === '' || matchesSearch);
  });

  const filteredCompletedCases = sortedCompletedCases.filter(caseItem => {
    const matchesType = typeFilter === 'all' || caseItem.type === typeFilter;
    const matchesSearch = 
      caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      caseItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (caseItem.customerName && caseItem.customerName.toLowerCase().includes(searchTerm.toLowerCase()));
    
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
  
  const handleExportSelectedAsPDF = () => {
    if (selectedCases.length === 0) {
      toast({
        title: "Keine Vorgänge ausgewählt",
        description: "Bitte wählen Sie mindestens einen Vorgang aus.",
        variant: "destructive"
      });
      return;
    }
    
    const casesToExport = completedCases.filter(c => selectedCases.includes(c.id));
    casesToExport.forEach(caseItem => {
      const fileName = generatePDF(caseItem);
      toast({
        title: "PDF generiert",
        description: `Die Datei "${fileName}" wurde erfolgreich erstellt und heruntergeladen.`
      });
    });
    
    // Reset selection
    setSelectedCases([]);
    setSelectAll(false);
  };
  
  const handleExportAllAsPDF = () => {
    if (filteredCompletedCases.length === 0) {
      toast({
        title: "Keine Vorgänge verfügbar",
        description: "Es gibt keine abgeschlossenen Vorgänge zum Exportieren.",
        variant: "destructive"
      });
      return;
    }
    
    filteredCompletedCases.forEach(caseItem => {
      const fileName = generatePDF(caseItem);
    });
    
    toast({
      title: "PDF-Export abgeschlossen",
      description: `${filteredCompletedCases.length} Vorgänge wurden als PDF exportiert.`
    });
  };
  
  const toggleCaseSelection = (id: string) => {
    setSelectedCases(prev => 
      prev.includes(id) 
        ? prev.filter(caseId => caseId !== id) 
        : [...prev, id]
    );
  };
  
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedCases([]);
    } else {
      setSelectedCases(filteredCompletedCases.map(c => c.id));
    }
    setSelectAll(!selectAll);
  };

  return (
    <div className="space-y-8">
      {currentUser && (
        <Tabs defaultValue="mine" onValueChange={(value) => setActiveTab(value as 'all' | 'mine')}>
          <TabsList className="mb-6">
            <TabsTrigger value="mine">Meine Vorgänge</TabsTrigger>
            <TabsTrigger value="all">Alle Vorgänge</TabsTrigger>
          </TabsList>
        </Tabs>
      )}
      
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
        <h2 className="text-xl font-semibold mb-4">
          {activeTab === 'mine' ? 'Meine aktiven Vorgänge' : 'Aktive Vorgänge'}
        </h2>
        {filteredActiveCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActiveCases.map(caseItem => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">
              {activeTab === 'mine' 
                ? 'Keine aktiven Vorgänge gefunden, die Ihnen zugewiesen sind' 
                : 'Keine aktiven Vorgänge gefunden'}
            </p>
          </div>
        )}
      </div>
      
      {showCompletedSection && completedCases.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {activeTab === 'mine' ? 'Meine abgeschlossenen Vorgänge' : 'Abgeschlossene Vorgänge'}
            </h2>
            
            <div className="flex gap-2">
              <Button 
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                onClick={handleExportSelectedAsPDF}
                disabled={selectedCases.length === 0}
              >
                <Download className="w-4 h-4" />
                Ausgewählte als PDF
              </Button>
              
              <Button 
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                onClick={handleExportAllAsPDF}
              >
                <Download className="w-4 h-4" />
                Alle als PDF
              </Button>
              
              {isAdmin && (
                <Button 
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  onClick={handleArchiveAll}
                >
                  <Archive className="w-4 h-4" />
                  Alle archivieren
                </Button>
              )}
            </div>
          </div>
          
          {filteredCompletedCases.length > 0 ? (
            <div>
              <div className="flex items-center mb-4 gap-2">
                <Checkbox 
                  id="select-all" 
                  checked={selectAll}
                  onCheckedChange={toggleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm">
                  Alle auswählen
                </label>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompletedCases.map(caseItem => (
                  <div key={caseItem.id} className="relative">
                    <div className="absolute top-3 left-3 z-10">
                      <Checkbox 
                        checked={selectedCases.includes(caseItem.id)}
                        onCheckedChange={() => toggleCaseSelection(caseItem.id)}
                      />
                    </div>
                    <CaseCard caseItem={caseItem} />
                  </div>
                ))}
              </div>
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
