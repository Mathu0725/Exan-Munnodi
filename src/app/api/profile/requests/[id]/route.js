import { NextResponse } from 'next/server';
import { PrismaUserRepository } from '@/infrastructure/repositories/prismaUserRepository';
import { PrismaUserProfileRepository } from '@/infrastructure/repositories/prismaUserProfileRepository';
import { PrismaUserUpdateRequestRepository } from '@/infrastructure/repositories/prismaUserUpdateRequestRepository';
import { ApproveProfileUpdateUseCase } from '@/application/use-cases/users/approveProfileUpdate';

const userRepository = new PrismaUserRepository();
const profileRepository = new PrismaUserProfileRepository();
const updateRequestRepository = new PrismaUserUpdateRequestRepository();

const approveProfileUpdate = new ApproveProfileUpdateUseCase(
  userRepository,
  updateRequestRepository,
  profileRepository,
);

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const result = await approveProfileUpdate.execute({
      requestId: params.id,
      reviewerId: body.reviewerId,
      approve: body.approve,
      comment: body.comment,
    });

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('PATCH /api/profile/requests/[id] failed', error);
    const status = error.message === 'Request not found' ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}

