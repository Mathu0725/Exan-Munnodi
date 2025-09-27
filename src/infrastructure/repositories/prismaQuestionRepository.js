import prisma from '@/lib/prisma';
import { QuestionRepository } from '@/domain/repositories/QuestionRepository';
import { createQuestion } from '@/domain/entities/question';

function normalize(record) {
  if (!record) return null;
  return createQuestion({
    ...record,
    tags: record.tags,
    options: record.options ?? [],
  });
}

export class PrismaQuestionRepository extends QuestionRepository {
  async findById(id) {
    const question = await prisma.question.findUnique({
      where: { id: Number(id) },
      include: { options: true },
    });
    return normalize(question);
  }

  async findDuplicates(title, subjectId, categoryId) {
    const duplicates = await prisma.question.findMany({
      where: {
        title: { equals: title, mode: 'insensitive' },
        subjectId: Number(subjectId),
        categoryId: Number(categoryId),
      },
      include: { options: true },
      orderBy: { createdAt: 'asc' }, // Get oldest first
    });
    return duplicates.map(normalize);
  }

  async list(filter = {}) {
    const {
      page = 1,
      limit = 10,
      query,
      subjectId,
      subSubjectId,
      categoryId,
      difficulty,
    } = filter;

    const where = {};
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { body: { contains: query, mode: 'insensitive' } },
      ];
    }
    if (subjectId) where.subjectId = Number(subjectId);
    if (subSubjectId) where.subSubjectId = Number(subSubjectId);
    if (categoryId) where.categoryId = Number(categoryId);
    if (difficulty) where.difficulty = Number(difficulty);

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    const [total, items] = await Promise.all([
      prisma.question.count({ where }),
      prisma.question.findMany({
        where,
        skip,
        take,
        include: { options: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      data: items.map(normalize),
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }

  async save(questionEntity) {
    const data = {
      title: questionEntity.title,
      body: questionEntity.body,
      subjectId: questionEntity.subjectId ? Number(questionEntity.subjectId) : null,
      subSubjectId: questionEntity.subSubjectId ? Number(questionEntity.subSubjectId) : null,
      categoryId: questionEntity.categoryId ? Number(questionEntity.categoryId) : null,
      difficulty: questionEntity.difficulty ?? 1,
      marks: questionEntity.marks ?? 1,
      negativeMarks: questionEntity.negativeMarks ?? 0,
      status: questionEntity.status ?? 'draft',
      tags: questionEntity.tags?.length ? JSON.stringify(questionEntity.tags) : null,
      options: questionEntity.options,
    };

    if (!questionEntity.id) {
      const created = await prisma.question.create({
        data: {
          ...data,
          options: {
            create: (questionEntity.options || []).map((opt) => ({
              text: opt.text ?? '',
              isCorrect: !!(opt.isCorrect ?? opt.is_correct),
            })),
          },
        },
        include: { options: true },
      });
      return normalize(created);
    }

    await prisma.option.deleteMany({ where: { questionId: Number(questionEntity.id) } });

    const updated = await prisma.question.update({
      where: { id: Number(questionEntity.id) },
      data: {
        ...data,
        options: {
          create: (questionEntity.options || []).map((opt) => ({
            text: opt.text ?? '',
            isCorrect: !!(opt.isCorrect ?? opt.is_correct),
          })),
        },
      },
      include: { options: true },
    });
    return normalize(updated);
  }

  async delete(id) {
    // First delete all related options
    await prisma.option.deleteMany({
      where: { questionId: Number(id) }
    });
    
    // Then delete the question
    await prisma.question.delete({ 
      where: { id: Number(id) } 
    });
  }
}
