import { createQuestion } from '@/domain/entities/question';

export class GetQuestionListUseCase {
  constructor(questionRepository) {
    this.questionRepository = questionRepository;
  }

  async execute(filter = {}) {
    const questions = await this.questionRepository.list(filter);
    return questions.map(createQuestion);
  }
}
