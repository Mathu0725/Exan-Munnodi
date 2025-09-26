export class DeleteQuestionUseCase {
  constructor(questionRepository) {
    this.questionRepository = questionRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Question ID is required');
    await this.questionRepository.delete(id);
    return { success: true };
  }
}
