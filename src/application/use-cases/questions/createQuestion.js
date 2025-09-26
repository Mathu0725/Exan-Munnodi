import { createQuestion } from '@/domain/entities/question';

export class CreateQuestionUseCase {
  constructor(questionRepository) {
    this.questionRepository = questionRepository;
  }

  async execute(input) {
    if (!input?.title) throw new Error('Question title is required');
    if (!input?.subjectId) throw new Error('Subject is required');
    if (!input?.categoryId) throw new Error('Category is required');

    const questionEntity = createQuestion({
      title: input.title,
      body: input.body ?? '',
      subjectId: input.subjectId,
      subSubjectId: input.subSubjectId ?? null,
      categoryId: input.categoryId,
      difficulty: input.difficulty ?? 1,
      marks: input.marks ?? 1,
      negativeMarks: input.negativeMarks ?? 0,
      status: input.status ?? 'draft',
      tags: input.tags ?? [],
      options: input.options ?? [],
    });

    return this.questionRepository.save(questionEntity);
  }
}
