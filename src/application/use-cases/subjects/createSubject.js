import { createSubject } from '@/domain/entities/subject';

export class CreateSubjectUseCase {
  constructor(subjectRepository) {
    this.subjectRepository = subjectRepository;
  }

  async execute(input) {
    if (!input?.name) throw new Error('Subject name is required');

    const subjectEntity = createSubject({
      name: input.name,
      slug: input.slug,
      order: input.order,
      active: input.active,
      subsubjects: input.subsubjects ?? [],
    });

    return this.subjectRepository.save(subjectEntity);
  }
}

