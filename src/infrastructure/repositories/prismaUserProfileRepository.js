import prisma from '@/lib/prisma';
import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository';
import { createUserProfile } from '@/domain/entities/userProfile';

export class PrismaUserProfileRepository extends UserProfileRepository {
  async findByUserId(userId) {
    const profile = await prisma.userProfile.findUnique({
      where: { userId: Number(userId) },
    });
    return profile ? createUserProfile(profile) : null;
  }

  async save(profileEntity) {
    const data = {
      avatarUrl: profileEntity.avatarUrl || null,
      bio: profileEntity.bio || null,
      address: profileEntity.address || null,
      city: profileEntity.city || null,
      state: profileEntity.state || null,
      country: profileEntity.country || null,
      postalCode: profileEntity.postalCode || null,
    };

    if (!profileEntity.id) {
      const created = await prisma.userProfile.create({
        data: {
          ...data,
          userId: Number(profileEntity.userId),
        },
      });
      return createUserProfile(created);
    }

    const updated = await prisma.userProfile.update({
      where: { id: Number(profileEntity.id) },
      data,
    });
    return createUserProfile(updated);
  }
}
