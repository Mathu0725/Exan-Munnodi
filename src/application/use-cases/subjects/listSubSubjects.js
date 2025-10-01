import { createSubSubject } from '@/domain/entities/subject';

export class ListSubSubjectsUseCase {
  constructor(subjectRepository) {
    this.subjectRepository = subjectRepository;
  }

  async execute(subjectId) {
    if (!subjectId) return [];
    const subsubjects = await this.subjectRepository.listSubSubjects(subjectId);
    return subsubjects.map(createSubSubject);
  }
}
