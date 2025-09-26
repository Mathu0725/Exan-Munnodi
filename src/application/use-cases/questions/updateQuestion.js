import { createQuestion } from '@/domain/entities/question';

export class UpdateQuestionUseCase {
  constructor(questionRepository) {
    this.questionRepository = questionRepository;
  }

  async execute(input) {
    if (!input?.id) throw new Error('Question ID is required');

    const existing = await this.questionRepository.findById(input.id);
    if (!existing) throw new Error('Question not found');

    const updatedEntity = createQuestion({
      ...existing,
      ...input,
      subjectId: input.subjectId ?? existing.subjectId,
      subSubjectId: input.subSubjectId ?? existing.subSubjectId,
      categoryId: input.categoryId ?? existing.categoryId,
      difficulty: input.difficulty ?? existing.difficulty,
      marks: input.marks ?? existing.marks,
      negativeMarks: input.negativeMarks ?? existing.negativeMarks,
      status: input.status ?? existing.status,
      tags: input.tags ?? existing.tags,
      options: input.options ?? existing.options,
    });

    return this.questionRepository.save(updatedEntity);
  }
}
