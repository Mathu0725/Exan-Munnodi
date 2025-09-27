'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import PageWrapper from '@/components/layout/PageWrapper';
import { CreateExamUseCase } from '@/application/use-cases/createExam';
import { PrismaExamRepository } from '@/infrastructure/repositories/prismaExamRepository';
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

const examRepository = new PrismaExamRepository();
const createExamUseCase = new CreateExamUseCase(examRepository);

export default function NewExamPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    examTypeId: '',
    startAt: '',
    endAt: '',
    questions: [],
    config: {},
  });

  const createMutation = useMutation({
    mutationFn: (payload) => createExamUseCase.execute(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['exams']);
      router.push('/exams');
    },
  });

  const handleNext = (stepData) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = (configData) => {
    const finalData = { ...formData, config: configData };
    setFormData(finalData);
    setCurrentStep(3);
  };

  const goToStep = (index) => {
    setCurrentStep(index);
  };

  const handlePublish = (status = 'draft') => {
    const payload = {
      title: formData.title,
      description: formData.description,
      examTypeId: formData.examTypeId ? Number(formData.examTypeId) : null,
      startAt: formData.startAt || null,
      endAt: formData.endAt || null,
      questions: formData.questions,
      config: formData.config,
      status,
    };

    createMutation.mutate(payload);
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
        return (
          <Step4Preview
            data={formData}
            onBack={handleBack}
            onPublish={handlePublish}
            onEditStep={goToStep}
          />
        );
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
