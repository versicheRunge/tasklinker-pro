
import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { CasesList } from '../components/cases/CasesList';
import { cases as initialCases } from '../data/mockData';
import { PlusCircle } from 'lucide-react';
import { CaseItem } from '../types/case';
import { toast } from "../hooks/use-toast";

const Cases: React.FC = () => {
  const [cases, setCases] = useState<CaseItem[]>(initialCases);

  const updateCase = (id: string, caseData: Partial<CaseItem>) => {
    setCases(prevCases => 
      prevCases.map(caseItem => 
        caseItem.id === id ? { ...caseItem, ...caseData } : caseItem
      )
    );
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Vorgänge</h1>
          <p className="text-muted-foreground">Alle Vorgänge im Überblick.</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          onClick={() => {
            toast({
              title: "Neuer Vorgang",
              description: "Diese Funktion wird in einem späteren Update hinzugefügt."
            });
          }}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Neuer Vorgang</span>
        </button>
      </div>
      
      <CasesList cases={cases} />
    </AppLayout>
  );
};

export default Cases;
