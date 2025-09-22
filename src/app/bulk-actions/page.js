import PageWrapper from '@/components/layout/PageWrapper';
import ImportUploader from '@/components/bulk/ImportUploader';

export default function BulkActionsPage() {
  return (
    <PageWrapper title="Bulk Actions">
      <div className="space-y-8">
        <ImportUploader />
        {/* Export component will go here later */}
      </div>
    </PageWrapper>
  );
}
