export class DeleteCategoryUseCase {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(id) {
    if (!id) throw new Error('Category ID is required');
    await this.categoryRepository.delete(id);
    return { success: true };
  }
}

