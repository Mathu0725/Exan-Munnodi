import { createExam, ExamStatus } from '@/domain/entities/exam';

export class CreateExamUseCase {
  constructor(examRepository) {
    this.examRepository = examRepository;
  }

  async execute(input) {
    if (!input?.title) {
      throw new Error('Exam title is required');
    }

    const exam = createExam({
      title: input.title,
      description: input.description || '',
      examTypeId: input.examTypeId ?? null,
      startAt: input.startAt ?? null,
      endAt: input.endAt ?? null,
      questions: input.questions ?? [],
      config: input.config ?? {},
      status: input.status ?? ExamStatus.DRAFT,
    });

    return this.examRepository.save(exam);
  }
}
