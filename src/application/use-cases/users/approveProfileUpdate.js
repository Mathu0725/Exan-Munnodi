import { createUser } from '@/domain/entities/user';
import { createUserProfile } from '@/domain/entities/userProfile';

export class ApproveProfileUpdateUseCase {
  constructor(userRepository, updateRequestRepository, profileRepository) {
    this.userRepository = userRepository;
    this.updateRequestRepository = updateRequestRepository;
    this.profileRepository = profileRepository;
  }

  async execute({ requestId, reviewerId, approve, comment }) {
    if (!requestId) throw new Error('requestId is required');
    if (!reviewerId) throw new Error('reviewerId is required');

    const request = await this.updateRequestRepository.findById(requestId);
    if (!request) throw new Error('Request not found');

    if (request.status !== 'Pending') {
      throw new Error('Request already processed');
    }

    const updatedRequest = await this.updateRequestRepository.updateStatus(
      requestId,
      approve ? 'Approved' : 'Rejected',
      reviewerId,
      comment
    );

    const user = await this.userRepository.findById(request.userId);
    if (!user) throw new Error('User not found');

    if (!approve) {
      return { request: updatedRequest, user };
    }

    const changes = JSON.parse(request.changes || '{}');

    const userChanges = {
      name: changes.name,
      phone: changes.phone,
      institution: changes.institution,
      status: changes.status,
    };

    const profileChanges = {
      avatarUrl: changes.avatarUrl,
      bio: changes.bio,
      address: changes.address,
      city: changes.city,
      state: changes.state,
      country: changes.country,
      postalCode: changes.postalCode,
    };

    const updatedUser = createUser({
      ...user,
      ...userChanges,
      approvedById: reviewerId,
      status: userChanges.status ?? user.status,
    });

    const persistedUser = await this.userRepository.save(updatedUser);

    const existingProfile = await this.profileRepository.findByUserId(user.id);
    const profileEntity = createUserProfile({
      ...existingProfile,
      userId: user.id,
      ...profileChanges,
    });

    const persistedProfile = await this.profileRepository.save(profileEntity);

    return {
      request: updatedRequest,
      user: {
        ...persistedUser,
        profile: persistedProfile,
      },
    };
  }
}
