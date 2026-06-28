
import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { CasesList } from '../components/cases/CasesList';
import { KanbanBoard } from '../components/cases/KanbanBoard';
import { PlusCircle, Search, X, LayoutGrid, Columns3 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { CreateCaseDialog } from '../components/cases/CreateCaseDialog';
import { CaseFilters } from '../components/cases/CaseFilters';
import { useCasesManager } from '../hooks/useCasesManager';
import { useSearchParams } from 'react-router-dom';

const Cases: React.FC = () => {
  const { users } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchParams] = useSearchParams();

  // Pre-fill search from ?customer= param (e.g. from Customers page)
  useEffect(() => {
    const customer = searchParams.get('customer');
    if (customer) setSearchQuery(customer);
  }, []);
  const {
    cases,
    defaultTitles,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isFilterPriorityOpen,
    setIsFilterPriorityOpen,
    isFilterUserOpen,
    setIsFilterUserOpen,
    filterPriority,
    setFilterPriority,
    filterUserId,
    setFilterUserId,
    updateCase,
    handleCreateCase
  } = useCasesManager();

  const filteredCases = useMemo(() => {
    if (!searchQuery.trim()) return cases;
    const q = searchQuery.toLowerCase();
    return cases.filter(c =>
      c.customerName?.toLowerCase().includes(q) ||
      c.title?.toLowerCase().includes(q) ||
      c.customerEmail?.toLowerCase().includes(q)
    );
  }, [cases, searchQuery]);

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Vorgänge</h1>
          <p className="text-muted-foreground text-sm">
            {searchQuery.trim()
              ? <>{filteredCases.length} von {cases.length} Vorgängen für „{searchQuery}"</>
              : <>{cases.length} Vorgänge gesamt</>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Kundensuche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Kunde oder Titel suchen…"
              className="pl-9 pr-8 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary w-56"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div className="flex rounded-lg border border-input overflow-hidden">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
              title="Karten-Ansicht"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors border-l border-input ${viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
              title="Kanban-Board"
            >
              <Columns3 className="w-4 h-4" />
            </button>
          </div>

          <CaseFilters
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
            filterUserId={filterUserId}
            setFilterUserId={setFilterUserId}
            users={users}
            isFilterPriorityOpen={isFilterPriorityOpen}
            setIsFilterPriorityOpen={setIsFilterPriorityOpen}
            isFilterUserOpen={isFilterUserOpen}
            setIsFilterUserOpen={setIsFilterUserOpen}
          />

          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusCircle className="w-4 h-4" />
            Neuer Vorgang
          </button>
        </div>
      </div>

      {searchQuery && (
        <p className="text-sm text-muted-foreground mb-3">
          {filteredCases.length} Ergebnis{filteredCases.length !== 1 ? 'se' : ''} für „{searchQuery}"
        </p>
      )}

      {viewMode === 'kanban'
        ? <KanbanBoard cases={filteredCases} onUpdate={updateCase} />
        : <CasesList cases={filteredCases} updateCase={updateCase} />
      }

      <CreateCaseDialog
        isOpen={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateCase={handleCreateCase}
        defaultTitles={defaultTitles}
      />
    </AppLayout>
  );
};

export default Cases;
