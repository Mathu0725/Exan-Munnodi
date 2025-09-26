import { NextResponse } from 'next/server';
import { PrismaUserRepository } from '@/infrastructure/repositories/prismaUserRepository';
import { PrismaUserProfileRepository } from '@/infrastructure/repositories/prismaUserProfileRepository';
import { PrismaUserUpdateRequestRepository } from '@/infrastructure/repositories/prismaUserUpdateRequestRepository';
import { RequestProfileUpdateUseCase } from '@/application/use-cases/users/requestProfileUpdate';

const userRepository = new PrismaUserRepository();
const profileRepository = new PrismaUserProfileRepository();
const updateRequestRepository = new PrismaUserUpdateRequestRepository();

const requestProfileUpdate = new RequestProfileUpdateUseCase(userRepository, updateRequestRepository);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id && !email) {
      return NextResponse.json({ error: 'id or email is required' }, { status: 400 });
    }

    const user = id ? await userRepository.findById(id) : await userRepository.findByEmail(email);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = await profileRepository.findByUserId(user.id);
    const updateRequests = await updateRequestRepository.findByUserId(user.id);

    return NextResponse.json({
      data: {
        user,
        profile,
        updateRequests,
      },
    });
  } catch (error) {
    console.error('GET /api/profile failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await requestProfileUpdate.execute({
      userId: body.userId,
      changes: body.changes,
      comment: body.comment,
    });

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error('POST /api/profile failed', error);
    const status = error.message === 'User not found' ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}

