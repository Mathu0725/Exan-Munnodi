'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import PageWrapper from '@/components/layout/PageWrapper';
import { examService } from '@/services/examService';
import WizardStepper from '@/components/exams/wizard/WizardStepper';
import Step1Details from '@/components/exams/wizard/Step1Details';
import Step2Questions from '@/components/exams/wizard/Step2Questions';
import Step3Configure from '@/components/exams/wizard/Step3Configure';
import Step4Preview from '@/components/exams/wizard/Step4Preview';

const steps = [
  { id: 'Step 1', name: 'Exam Details' },
  { id: 'Step 2', name: 'Add Questions' },
  { id: 'Step 3', name: 'Configure' },
  { id: 'Step 4', name: 'Preview & Publish' },
];

export default function NewExamPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    exam_type_id: '',
    start_at: '',
    end_at: '',
    questions: [],
    config: {},
  });

  const createMutation = useMutation({
    mutationFn: examService.createExam,
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      router.push('/exams');
    },
  });

  const handleNext = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (configData) => {
    const finalData = { ...formData, config: configData };
    setFormData(finalData);
    setCurrentStep(3);
  };

  const handlePublish = (status = 'published') => {
    const payload = { ...formData, status };
    if (window.confirm('Publish this exam?')) {
      createMutation.mutate(payload);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1Details data={formData} onNext={handleNext} />;
      case 1:
        return <Step2Questions data={formData} onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <Step3Configure data={formData} onBack={handleBack} onSubmit={handleSubmit} />;
      case 3:
        return <Step4Preview data={formData} onBack={handleBack} onPublish={handlePublish} />;
      default:
        return null;
    }
  };

  return (
    <PageWrapper title="Create New Exam">
      <div className="bg-white p-6 rounded-lg shadow">
        <WizardStepper currentStep={currentStep} steps={steps} />
        {renderStep()}
      </div>
    </PageWrapper>
  );
}
