import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { CaseDetail } from '../components/cases/CaseDetail';
import { useCasesManager } from '../hooks/useCasesManager';

const CaseDetails: React.FC = () => {
  const { allCases, updateCase } = useCasesManager();

  return (
    <AppLayout>
      <CaseDetail cases={allCases} updateCase={updateCase} />
    </AppLayout>
  );
};

export default CaseDetails;
