import { createQuestion } from '@/domain/entities/question';

export class GetQuestionListUseCase {
  constructor(questionRepository) {
    this.questionRepository = questionRepository;
  }

  async execute(filter = {}) {
    const { data, total, page, limit } = await this.questionRepository.list(filter);
    return {
      data: data.map(createQuestion),
      total,
      page,
      limit,
    };
  }
}
