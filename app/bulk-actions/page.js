'use client';
import PageWrapper from '@/components/layout/PageWrapper';
import ImportUploader from '@/components/bulk/ImportUploader';
import withRole from '@/components/auth/withRole';

function BulkActionsPage() {
  return (
    <PageWrapper title='Bulk Actions'>
      <div className='space-y-8'>
        <ImportUploader />
        {/* Export component will go here later */}
      </div>
    </PageWrapper>
  );
}

export default withRole(BulkActionsPage, ['Admin', 'Content Editor']);
