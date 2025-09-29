export class DeleteSubjectUseCase {
  constructor(subjectRepository) {
    this.subjectRepository = subjectRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Subject ID is required');
    await this.subjectRepository.delete(id);
    return { success: true };
  }
}
