import prisma from '@/lib/prisma';
import { createExam } from '@/domain/entities/exam';

function normalize(record) {
  if (!record) return null;
  return createExam({
    ...record,
    startAt: record.startAt,
    endAt: record.endAt,
    // questions/config stored as JSON/text in DB
    questions: typeof record.questions === 'string' ? JSON.parse(record.questions || '[]') : (record.questions || []),
    config: typeof record.config === 'string' ? JSON.parse(record.config || '{}') : (record.config || {}),
  });
}

export class PrismaExamRepository {
  async findById(id) {
    const rec = await prisma.exam.findUnique({ where: { id: Number(id) } });
    return normalize(rec);
  }

  async search(filter = {}) {
    const where = {};
    if (filter.status) where.status = filter.status;
    if (filter.query) where.title = { contains: filter.query }; // SQLite doesn't support mode: 'insensitive'
    if (filter.examTypeId) where.examTypeId = Number(filter.examTypeId);

    const rows = await prisma.exam.findMany({ where, orderBy: { createdAt: 'desc' } });
    return rows.map(normalize);
  }

  async save(examEntity) {
    const data = {
      title: examEntity.title,
      description: examEntity.description,
      status: examEntity.status,
      examTypeId: examEntity.examTypeId ?? null,
      startAt: examEntity.startAt,
      endAt: examEntity.endAt,
      questions: Array.isArray(examEntity.questions) ? JSON.stringify(examEntity.questions) : (examEntity.questions ?? '[]'),
      config: typeof examEntity.config === 'object' ? JSON.stringify(examEntity.config) : (examEntity.config ?? '{}'),
    };

    if (!examEntity.id) {
      const created = await prisma.exam.create({ data });
      return normalize(created);
    }

    const updated = await prisma.exam.update({ where: { id: Number(examEntity.id) }, data });
    return normalize(updated);
  }

  async delete(id) {
    await prisma.exam.delete({ where: { id: Number(id) } });
  }
}


