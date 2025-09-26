import { createCategory } from '@/domain/entities/category';

export class ListCategoriesUseCase {
  constructor(categoryRepository) {
    this.categoryRepository = categoryRepository;
  }

  async execute(filter = {}) {
    const categories = await this.categoryRepository.list(filter);
    return categories.map(createCategory);
  }
}

