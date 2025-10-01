import { createSubSubject } from '@/domain/entities/subject';

export class UpdateSubSubjectUseCase {
  constructor(subjectRepository) {
    this.subjectRepository = subjectRepository;
  }

  async execute(input) {
    if (!input?.id) throw new Error('Sub-subject ID is required');

    const existing = await this.subjectRepository.findSubSubjectById(input.id);
    if (!existing) throw new Error('Sub-subject not found');

    const entity = createSubSubject({
      ...existing,
      ...input,
    });

    return this.subjectRepository.saveSubSubject(entity);
  }
}
