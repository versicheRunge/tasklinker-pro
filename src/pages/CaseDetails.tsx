
import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { CaseDetail } from '../components/cases/CaseDetail';
import { cases as initialCases } from '../data/mockData';
import { CaseItem } from '../types/case';

const CaseDetails: React.FC = () => {
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
      <CaseDetail cases={cases} updateCase={updateCase} />
    </AppLayout>
  );
};

export default CaseDetails;
