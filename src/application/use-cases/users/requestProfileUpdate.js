import { createUserUpdateRequest } from '@/domain/entities/user';

export class RequestProfileUpdateUseCase {
  constructor(userRepository, updateRequestRepository) {
    this.userRepository = userRepository;
    this.updateRequestRepository = updateRequestRepository;
  }

  async execute({ userId, changes, comment }) {
    if (!userId) throw new Error('userId is required');
    if (!changes || typeof changes !== 'object') throw new Error('changes must be provided');

    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');

    const pendingRequests = (await this.updateRequestRepository.findByUserId(userId)) || [];
    const hasPending = pendingRequests.some((req) => req.status === 'Pending');
    if (hasPending) {
      throw new Error('You already have a pending update request');
    }

    const requestEntity = createUserUpdateRequest({
      userId,
      changes: JSON.stringify(changes),
      comment,
    });

    return this.updateRequestRepository.create(requestEntity);
  }
}

