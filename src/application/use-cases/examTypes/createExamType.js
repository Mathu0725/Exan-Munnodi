import { createExamType } from '@/domain/entities/examType';

export class CreateExamTypeUseCase {
  constructor(examTypeRepository) {
    this.examTypeRepository = examTypeRepository;
  }

  async execute(input) {
    if (!input?.name) throw new Error('Exam type name is required');

    const examTypeEntity = createExamType({
      name: input.name,
      slug: input.slug,
      order: input.order,
      active: input.active,
    });

    return this.examTypeRepository.save(examTypeEntity);
  }
}

