'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import PageWrapper from '@/components/layout/PageWrapper';
import QuestionTypeSelector from '@/components/questions/QuestionTypeSelector';
import { questionService } from '@/services/questionService';

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const questionId = params.id;

  const { data: question, isLoading, error } = useQuery({
    queryKey: ['question', questionId],
    queryFn: () => questionService.getQuestion(questionId),
    enabled: !!questionId,
  });

  const handleSave = () => {
    router.push('/questions');
  };

  const handleCancel = () => {
    router.push('/questions');
  };

  if (isLoading) {
    return (
      <PageWrapper title="Edit Question">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading question...</div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper title="Edit Question">
        <div className="text-center py-8">
          <div className="text-red-600 text-lg mb-4">Error loading question</div>
          <button 
            onClick={() => router.push('/questions')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md"
          >
            Back to Questions
          </button>
        </div>
      </PageWrapper>
    );
  }

  if (!question) {
    return (
      <PageWrapper title="Edit Question">
        <div className="text-center py-8">
          <div className="text-gray-600 text-lg mb-4">Question not found</div>
          <button 
            onClick={() => router.push('/questions')}
            className="px-4 py-2 bg-gray-600 text-white rounded-md"
          >
            Back to Questions
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={`Edit Question: ${question.title}`}>
      <QuestionTypeSelector
        onSave={handleSave}
        onCancel={handleCancel}
        initialData={question}
      />
    </PageWrapper>
  );
}
