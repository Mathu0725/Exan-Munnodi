export class ListExamsUseCase {
  constructor(examRepository) {
    this.examRepository = examRepository;
  }

  async execute(filter = {}) {
    return this.examRepository.search(filter);
  }
}
