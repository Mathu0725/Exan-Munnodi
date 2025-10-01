import prisma from '@/lib/prisma';
import { UserRepository } from '@/domain/repositories/UserRepository';
import { createUser } from '@/domain/entities/user';

function normalize(record) {
  if (!record) return null;
  return createUser({
    ...record,
    approvedBy: record.approvedBy ? createUser(record.approvedBy) : null,
    profile: record.profile || null,
  });
}

export class PrismaUserRepository extends UserRepository {
  async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id: Number(id) },
      include: { approvedBy: true, profile: true },
    });
    return normalize(user);
  }

  async findByEmail(email) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    return normalize(user);
  }

  async list(filter = {}) {
    const where = {};
    if (filter.status) where.status = filter.status;
    if (filter.role) where.role = filter.role;
    if (filter.search) {
      where.OR = [
        { name: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { approvedBy: true, profile: true },
    });

    return users.map(normalize);
  }

  async save(userEntity) {
    const data = {
      name: userEntity.name,
      email: userEntity.email,
      phone: userEntity.phone || null,
      institution: userEntity.institution || null,
      role: userEntity.role,
      status: userEntity.status,
      approvedById: userEntity.approvedById
        ? Number(userEntity.approvedById)
        : null,
    };

    if (!userEntity.id) {
      const created = await prisma.user.create({
        data,
        include: { approvedBy: true, profile: true },
      });
      return normalize(created);
    }

    const updated = await prisma.user.update({
      where: { id: Number(userEntity.id) },
      data,
      include: { approvedBy: true, profile: true },
    });
    return normalize(updated);
  }

  async delete(id) {
    await prisma.user.delete({ where: { id: Number(id) } });
  }
}
