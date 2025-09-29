import { createSubject } from '@/domain/entities/subject';

export class UpdateSubjectUseCase {
  constructor(subjectRepository) {
    this.subjectRepository = subjectRepository;
  }

  async execute(input) {
    if (!input?.id) throw new Error('Subject ID is required');

    const existing = await this.subjectRepository.findById(input.id);
    if (!existing) throw new Error('Subject not found');

    const subjectEntity = createSubject({
      ...existing,
      ...input,
      subsubjects: existing.subsubjects,
    });

    return this.subjectRepository.save(subjectEntity);
  }
}
