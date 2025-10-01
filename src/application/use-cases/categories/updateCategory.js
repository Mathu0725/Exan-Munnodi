import { createCategory } from '@/domain/entities/category';

export class UpdateCategoryUseCase {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(input) {
    if (!input?.id) throw new Error('Category ID is required');

    const existing = await this.categoryRepository.findById(input.id);
    if (!existing) throw new Error('Category not found');

    const categoryEntity = createCategory({
      ...existing,
      ...input,
    });

    return this.categoryRepository.save(categoryEntity);
  }
}
