
import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { CasesList } from '../components/cases/CasesList';
import { PlusCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { CreateCaseDialog } from '../components/cases/CreateCaseDialog';
import { CaseFilters } from '../components/cases/CaseFilters';
import { useCasesManager } from '../hooks/useCasesManager';

const Cases: React.FC = () => {
  const { users } = useUser();
  
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

  // Add error boundary to handle rendering issues
  try {
    return (
      <AppLayout>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Vorgänge</h1>
            <p className="text-muted-foreground">Alle Vorgänge im Überblick.</p>
          </div>
          <div className="flex items-center gap-2">
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
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Neuer Vorgang</span>
            </button>
          </div>
        </div>
        
        {/* Wrap CasesList in error handler */}
        {Array.isArray(cases) ? (
          <CasesList cases={cases} updateCase={updateCase} />
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground">Fehler beim Laden der Vorgänge</p>
          </div>
        )}

        <CreateCaseDialog 
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onCreateCase={handleCreateCase}
          defaultTitles={defaultTitles}
        />
      </AppLayout>
    );
  } catch (error) {
    console.error("Error rendering Cases page:", error);
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Fehler beim Laden der Vorgänge</h2>
          <p>Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.</p>
        </div>
      </AppLayout>
    );
  }
};

export default Cases;
