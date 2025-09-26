import { createExamType } from '@/domain/entities/examType';

export class ListExamTypesUseCase {
  constructor(examTypeRepository) {
    this.examTypeRepository = examTypeRepository;
  }

  async execute(filter = {}) {
    const examTypes = await this.examTypeRepository.list(filter);
    return examTypes.map(createExamType);
  }
}

