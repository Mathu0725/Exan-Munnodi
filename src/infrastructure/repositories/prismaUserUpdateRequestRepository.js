import prisma from '@/lib/prisma';
import { UserUpdateRequestRepository } from '@/domain/repositories/UserUpdateRequestRepository';
import { createUserUpdateRequest, createUser } from '@/domain/entities/user';

function normalize(record) {
  if (!record) return null;
  return createUserUpdateRequest({
    ...record,
    user: record.user ? createUser(record.user) : null,
    reviewedBy: record.reviewedBy ? createUser(record.reviewedBy) : null,
  });
}

export class PrismaUserUpdateRequestRepository extends UserUpdateRequestRepository {
  async create(requestEntity) {
    const created = await prisma.userUpdateRequest.create({
      data: {
        userId: Number(requestEntity.userId),
        changes: requestEntity.changes,
        status: requestEntity.status ?? 'Pending',
        comment: requestEntity.comment || null,
      },
      include: {
        user: true,
        reviewedBy: true,
      },
    });
    return normalize(created);
  }

  async listPending(filter = {}) {
    const where = { status: 'Pending' };
    if (filter.search) {
      where.user = {
        name: { contains: filter.search, mode: 'insensitive' },
      };
    }

    const requests = await prisma.userUpdateRequest.findMany({
      where,
      include: {
        user: true,
        reviewedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map(normalize);
  }

  async updateStatus(id, status, reviewerId, comment) {
    const updated = await prisma.userUpdateRequest.update({
      where: { id: Number(id) },
      data: {
        status,
        reviewedById: reviewerId ? Number(reviewerId) : null,
        reviewedAt: new Date(),
        comment: comment || null,
      },
      include: {
        user: true,
        reviewedBy: true,
      },
    });
    return normalize(updated);
  }

  async findByUserId(userId) {
    const requests = await prisma.userUpdateRequest.findMany({
      where: { userId: Number(userId) },
      include: {
        user: true,
        reviewedBy: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return requests.map(normalize);
  }

  async findById(id) {
    const request = await prisma.userUpdateRequest.findUnique({
      where: { id: Number(id) },
      include: {
        user: true,
        reviewedBy: true,
      },
    });
    return normalize(request);
  }
}

