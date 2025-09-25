'use client';

import MasterDataPage from '@/components/shared/MasterDataPage';
import { categoryService } from '@/services/masterDataService';
import withRole from '@/components/auth/withRole';

function CategoriesPage() {
  return (
    <MasterDataPage
      pageTitle="Categories"
      itemType="Category"
      service={categoryService}
    />
  );
}

export default withRole(CategoriesPage, ['Admin', 'Content Editor', 'Viewer']);
