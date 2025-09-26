import prisma from '@/lib/prisma';
import { SubjectRepository } from '@/domain/repositories/SubjectRepository';
import { createSubject, createSubSubject } from '@/domain/entities/subject';

export class PrismaSubjectRepository extends SubjectRepository {
  async list() {
    const subjects = await prisma.subject.findMany({
      orderBy: { order: 'asc' },
      include: { subsubjects: { orderBy: { order: 'asc' } } },
    });
    return subjects.map(createSubject);
  }

  async findById(id) {
    const subject = await prisma.subject.findUnique({
      where: { id: Number(id) },
      include: { subsubjects: true },
    });
    return createSubject(subject);
  }

  async listSubSubjects(subjectId) {
    const subsubjects = await prisma.subSubject.findMany({
      where: { subjectId: Number(subjectId) },
      orderBy: { order: 'asc' },
    });
    return subsubjects.map(createSubSubject);
  }

  async save(subjectEntity) {
    const data = {
      name: subjectEntity.name,
      slug: subjectEntity.slug ?? subjectEntity.name.toLowerCase().replace(/\s+/g, '-'),
      order: subjectEntity.order ?? 0,
      active: subjectEntity.active ?? true,
    };

    if (!subjectEntity.id) {
      const created = await prisma.subject.create({ data, include: { subsubjects: true } });
      return createSubject(created);
    }

    const updated = await prisma.subject.update({
      where: { id: Number(subjectEntity.id) },
      data,
      include: { subsubjects: true },
    });
    return createSubject(updated);
  }

  async delete(id) {
    await prisma.subject.delete({ where: { id: Number(id) } });
  }

  async saveSubSubject(subSubjectEntity) {
    const data = {
      name: subSubjectEntity.name,
      slug: subSubjectEntity.slug ?? subSubjectEntity.name.toLowerCase().replace(/\s+/g, '-'),
      order: subSubjectEntity.order ?? 0,
      subjectId: Number(subSubjectEntity.subjectId),
    };

    if (!subSubjectEntity.id) {
      const created = await prisma.subSubject.create({ data });
      return createSubSubject(created);
    }

    const updated = await prisma.subSubject.update({
      where: { id: Number(subSubjectEntity.id) },
      data,
    });
    return createSubSubject(updated);
  }

  async deleteSubSubject(id) {
    await prisma.subSubject.delete({ where: { id: Number(id) } });
  }

  async findSubSubjectById(id) {
    const record = await prisma.subSubject.findUnique({ where: { id: Number(id) } });
    return createSubSubject(record);
  }
}

