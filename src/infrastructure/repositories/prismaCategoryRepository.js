import prisma from '@/lib/prisma';
import { CategoryRepository } from '@/domain/repositories/CategoryRepository';
import { createCategory } from '@/domain/entities/category';

export class PrismaCategoryRepository extends CategoryRepository {
  async list(filter = {}) {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    });
    return categories.map(createCategory);
  }

  async findById(id) {
    const category = await prisma.category.findUnique({ where: { id: Number(id) } });
    return createCategory(category);
  }

  async save(categoryEntity) {
    const data = {
      name: categoryEntity.name,
      slug: categoryEntity.slug ?? categoryEntity.name.toLowerCase().replace(/\s+/g, '-'),
      order: categoryEntity.order ?? 0,
      active: categoryEntity.active ?? true,
    };

    if (!categoryEntity.id) {
      const created = await prisma.category.create({ data });
      return createCategory(created);
    }

    const updated = await prisma.category.update({ where: { id: Number(categoryEntity.id) }, data });
    return createCategory(updated);
  }

  async delete(id) {
    await prisma.category.delete({ where: { id: Number(id) } });
  }
}

