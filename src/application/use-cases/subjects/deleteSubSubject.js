export class DeleteSubSubjectUseCase {
  constructor(subjectRepository) {
    this.subjectRepository = subjectRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Sub-subject ID is required');
    await this.subjectRepository.deleteSubSubject(id);
    return { success: true };
  }
}

