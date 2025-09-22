'use client';

import MasterDataPage from '@/components/shared/MasterDataPage';
import { examTypeService } from '@/services/masterDataService';

export default function ExamTypesPage() {
  return (
    <MasterDataPage
      pageTitle="Exam Types"
      itemType="Exam Type"
      service={examTypeService}
    />
  );
}
