import { createExamType } from '@/domain/entities/examType';

export class UpdateExamTypeUseCase {
  constructor(examTypeRepository) {
    this.examTypeRepository = examTypeRepository;
  }

  async execute(input) {
    if (!input?.id) throw new Error('Exam type ID is required');

    const existing = await this.examTypeRepository.findById(input.id);
    if (!existing) throw new Error('Exam type not found');

    const examTypeEntity = createExamType({
      ...existing,
      ...input,
    });

    return this.examTypeRepository.save(examTypeEntity);
  }
}

