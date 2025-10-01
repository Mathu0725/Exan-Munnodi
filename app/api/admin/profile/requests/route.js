import { NextResponse } from 'next/server';
import { PrismaUserRepository } from '@/infrastructure/repositories/prismaUserRepository';
import { PrismaUserUpdateRequestRepository } from '@/infrastructure/repositories/prismaUserUpdateRequestRepository';

const userRepository = new PrismaUserRepository();
const updateRequestRepository = new PrismaUserUpdateRequestRepository();

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reviewerId = searchParams.get('reviewerId');

    // Optional filter to show requests for a specific reviewer (e.g., owned students)
    const filter = {};
    if (reviewerId) {
      const reviewer = await userRepository.findById(reviewerId);
      if (!reviewer) {
        return NextResponse.json(
          { error: 'Reviewer not found' },
          { status: 404 }
        );
      }
      // Could add custom filtering based on reviewer properties if needed
    }

    const requests = await updateRequestRepository.listPending(filter);

    return NextResponse.json({ data: requests });
  } catch (error) {
    console.error('GET /api/admin/profile/requests failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
