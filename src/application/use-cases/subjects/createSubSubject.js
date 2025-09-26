import { createSubSubject } from '@/domain/entities/subject';

export class CreateSubSubjectUseCase {
  constructor(subjectRepository) {
    this.subjectRepository = subjectRepository;
  }

  async execute(input) {
    if (!input?.subjectId) throw new Error('Subject ID is required');
    if (!input?.name) throw new Error('Sub-subject name is required');

    const entity = createSubSubject({
      name: input.name,
      slug: input.slug,
      order: input.order,
      subjectId: input.subjectId,
    });

    return this.subjectRepository.saveSubSubject(entity);
  }
}

