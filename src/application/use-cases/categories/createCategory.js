import { createCategory } from '@/domain/entities/category';

export class CreateCategoryUseCase {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(input) {
    if (!input?.name) throw new Error('Category name is required');

    const categoryEntity = createCategory({
      name: input.name,
      slug: input.slug,
      order: input.order,
      active: input.active,
    });

    return this.categoryRepository.save(categoryEntity);
  }
}

