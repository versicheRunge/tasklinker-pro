
import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { CaseDetail } from '../components/cases/CaseDetail';
import { cases } from '../data/mockData';

const CaseDetails: React.FC = () => {
  return (
    <AppLayout>
      <CaseDetail cases={cases} />
    </AppLayout>
  );
};

export default CaseDetails;
