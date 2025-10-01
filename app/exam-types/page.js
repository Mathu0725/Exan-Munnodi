'use client';

import MasterDataPage from '@/components/shared/MasterDataPage';
import { examTypeService } from '@/services/masterDataService';
import withRole from '@/components/auth/withRole';

function ExamTypesPage() {
  return (
    <MasterDataPage
      pageTitle='Exam Types'
      itemType='Exam Type'
      service={examTypeService}
    />
  );
}

export default withRole(ExamTypesPage, ['Admin', 'Content Editor', 'Viewer']);
