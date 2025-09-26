import { updateExamEntity } from '@/domain/entities/exam';

export class UpdateExamUseCase {
  constructor(examRepository) {
    this.examRepository = examRepository;
  }

  async execute(input) {
    if (!input?.id) {
      throw new Error('Exam ID is required');
    }

    const existing = await this.examRepository.findById(input.id);
    if (!existing) {
      throw new Error('Exam not found');
    }

    const updatedExam = updateExamEntity(existing, input);
    return this.examRepository.save(updatedExam);
  }
}
