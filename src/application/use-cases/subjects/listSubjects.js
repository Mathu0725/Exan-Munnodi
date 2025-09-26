import { createSubject } from '@/domain/entities/subject';

export class ListSubjectsUseCase {
  constructor(subjectRepository) {
    this.subjectRepository = subjectRepository;
  }

  async execute(filter = {}) {
    const subjects = await this.subjectRepository.list(filter);
    return subjects.map(createSubject);
  }
}

