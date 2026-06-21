
import React, { useState } from 'react';
import { CaseCard } from './CaseCard';
import { CaseItem, CaseStatus, CaseType, CASE_TYPE_LABELS } from '../../types/case';
import { Archive, Download, CheckSquare, X } from 'lucide-react';
import { toast } from "../../hooks/use-toast";
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
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
  const searchTerm = '';
  const { isAdmin, currentUser } = useUser();
  const [activeTab, setActiveTab] = useState<'all' | 'mine'>('mine');
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>('');

  // Filter out archived cases
  const filteredCases = cases.filter(c => !c.archived);
  
  // Filter cases belonging to current user
  const myCases = currentUser ? 
    filteredCases.filter(c => c.assignee.id === currentUser.id || (c.creator && c.creator.id === currentUser.id)) : 
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
    ...Object.entries(CASE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
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
    setSelectedCases(prev => prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedCases([]);
    } else {
      setSelectedCases(filteredCompletedCases.map(c => c.id));
    }
    setSelectAll(!selectAll);
  };

  const toggleBulkMode = () => {
    setBulkMode(v => !v);
    setSelectedCases([]);
    setBulkStatus('');
  };

  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedCases.length === 0) return;
    await supabase.from('cases').update({ status: bulkStatus, updated_at: new Date().toISOString() }).in('id', selectedCases);
    selectedCases.forEach(id => updateCase(id, { status: bulkStatus as CaseStatus }));
    toast({ title: 'Status geändert', description: `${selectedCases.length} Vorgänge auf „${bulkStatus}" gesetzt.` });
    setSelectedCases([]);
    setBulkStatus('');
  };

  const handleBulkArchive = async () => {
    if (selectedCases.length === 0) return;
    await supabase.from('cases').update({ archived: true, updated_at: new Date().toISOString() }).in('id', selectedCases);
    selectedCases.forEach(id => updateCase(id, { archived: true }));
    toast({ title: 'Archiviert', description: `${selectedCases.length} Vorgänge archiviert.` });
    setSelectedCases([]);
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
      
      <div className="flex flex-wrap gap-3 items-center">
        <select
          className="p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as CaseStatus | 'all')}
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select
          className="p-2.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as CaseType | 'all')}
        >
          {typeOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <button
          onClick={toggleBulkMode}
          className={`ml-auto flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors ${bulkMode ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted text-muted-foreground'}`}
        >
          <CheckSquare className="w-4 h-4" />
          Mehrfachauswahl {bulkMode ? 'beenden' : ''}
        </button>
      </div>

      {/* Floating bulk action bar */}
      {bulkMode && selectedCases.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-card border border-border rounded-2xl shadow-2xl px-5 py-3">
          <span className="text-sm font-semibold">{selectedCases.length} ausgewählt</span>
          <div className="h-5 w-px bg-border" />
          <select
            className="text-sm border border-input rounded-lg px-2 py-1 bg-background"
            value={bulkStatus}
            onChange={e => setBulkStatus(e.target.value)}
          >
            <option value="">Status setzen…</option>
            <option value="new">Neu</option>
            <option value="in_progress">In Bearbeitung</option>
            <option value="waiting">Wartet</option>
            <option value="completed">Erledigt</option>
          </select>
          <button
            onClick={handleBulkStatusChange}
            disabled={!bulkStatus}
            className="text-sm px-3 py-1 rounded-lg bg-primary text-primary-foreground disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            Anwenden
          </button>
          <div className="h-5 w-px bg-border" />
          <button
            onClick={handleBulkArchive}
            className="flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            <Archive className="w-3.5 h-3.5" /> Archivieren
          </button>
          <button onClick={() => setSelectedCases([])} className="text-muted-foreground hover:text-foreground ml-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {activeTab === 'mine' ? 'Meine aktiven Vorgänge' : 'Aktive Vorgänge'}
        </h2>
        {filteredActiveCases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActiveCases.map(caseItem => (
              bulkMode ? (
                <div key={caseItem.id} className="relative">
                  <div className="absolute top-3 left-3 z-10" onClick={e => { e.preventDefault(); e.stopPropagation(); toggleCaseSelection(caseItem.id); }}>
                    <Checkbox checked={selectedCases.includes(caseItem.id)} />
                  </div>
                  <div className={selectedCases.includes(caseItem.id) ? 'ring-2 ring-primary rounded-xl' : ''}>
                    <CaseCard caseItem={caseItem} onUpdate={updateCase} />
                  </div>
                </div>
              ) : (
                <CaseCard key={caseItem.id} caseItem={caseItem} onUpdate={updateCase} />
              )
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
                    <CaseCard caseItem={caseItem} onUpdate={updateCase} />
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
