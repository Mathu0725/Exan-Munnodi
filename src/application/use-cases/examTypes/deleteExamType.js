export class DeleteExamTypeUseCase {
  constructor(examTypeRepository) {
    this.examTypeRepository = examTypeRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Exam type ID is required');
    await this.examTypeRepository.delete(id);
    return { success: true };
  }
}

