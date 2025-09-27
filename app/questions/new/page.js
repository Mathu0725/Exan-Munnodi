'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageWrapper from '@/components/layout/PageWrapper';
import QuestionTypeSelector from '@/components/questions/QuestionTypeSelector';

export default function NewQuestionPage() {
  const router = useRouter();

  const handleSave = () => {
    router.push('/questions');
  };

  const handleCancel = () => {
    router.push('/questions');
  };

  return (
    <PageWrapper title="Create New Question">
      <QuestionTypeSelector
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </PageWrapper>
  );
}
