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

const steps = [
  { id: 'Step 1', name: 'Exam Details' },
  { id: 'Step 2', name: 'Add Questions' },
  { id: 'Step 3', name: 'Configure & Publish' },
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
    // The timeout gives React time to update state for the final review display
    setTimeout(() => {
      if (window.confirm('Are you sure you want to save this exam?')) {
        createMutation.mutate(finalData);
      }
    }, 100);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <Step1Details data={formData} onNext={handleNext} />;
      case 1:
        return <Step2Questions data={formData} onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <Step3Configure data={formData} onBack={handleBack} onSubmit={handleSubmit} />;
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
      </div>
    </PageWrapper>
  );
}
  return (
    <PageWrapper title="Create New Exam">
      <div className="bg-white p-6 rounded-lg shadow">
        <WizardStepper currentStep={currentStep} steps={steps} />
        {renderStep()}
      </div>
    </PageWrapper>
  );
}
