'use client';

import MasterDataPage from '@/components/shared/MasterDataPage';
import { categoryService } from '@/services/masterDataService';

export default function CategoriesPage() {
  return (
    <MasterDataPage
      pageTitle="Categories"
      itemType="Category"
      service={categoryService}
    />
  );
}
