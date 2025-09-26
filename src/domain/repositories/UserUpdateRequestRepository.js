export class UserUpdateRequestRepository {
  async create(requestEntity) {
    throw new Error('Method not implemented');
  }

  async findById(id) {
    throw new Error('Method not implemented');
  }

  async listPending(filter = {}) {
    throw new Error('Method not implemented');
  }

  async updateStatus(id, status, reviewerId, comment) {
    throw new Error('Method not implemented');
  }

  async findByUserId(userId) {
    throw new Error('Method not implemented');
  }
}

