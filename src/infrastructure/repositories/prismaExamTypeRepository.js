import prisma from '@/lib/prisma';
import { ExamTypeRepository } from '@/domain/repositories/ExamTypeRepository';
import { createExamType } from '@/domain/entities/examType';

export class PrismaExamTypeRepository extends ExamTypeRepository {
  async list(filter = {}) {
    const where = {};
    if (filter.active !== undefined) where.active = filter.active;
    if (filter.search) {
      where.name = { contains: filter.search, mode: 'insensitive' };
    }

    const examTypes = await prisma.examType.findMany({
      where,
      orderBy: { order: 'asc' },
    });

    return examTypes.map(createExamType);
  }

  async findById(id) {
    const examType = await prisma.examType.findUnique({
      where: { id: Number(id) },
    });
    return examType ? createExamType(examType) : null;
  }

  async save(examTypeEntity) {
    const data = {
      name: examTypeEntity.name,
      slug:
        examTypeEntity.slug ||
        examTypeEntity.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      order: examTypeEntity.order ?? 0,
      active: examTypeEntity.active ?? true,
    };

    if (!examTypeEntity.id) {
      const created = await prisma.examType.create({ data });
      return createExamType(created);
    }

    const updated = await prisma.examType.update({
      where: { id: Number(examTypeEntity.id) },
      data,
    });
    return createExamType(updated);
  }

  async delete(id) {
    await prisma.examType.delete({ where: { id: Number(id) } });
  }
}
