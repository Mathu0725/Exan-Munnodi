'use server';

import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authSchemas } from '@/lib/validations/schemas';
import {
  validateBody,
  createValidationErrorResponse,
  sanitizeInput,
} from '@/lib/validations/middleware';

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate request body
    const validation = validateBody(authSchemas.register, body);
    if (!validation.success) {
      return createValidationErrorResponse(validation.error);
    }

    const payload = sanitizeInput(validation.data);

    const existing = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() },
    });

    if (existing) {
      if (existing.status === 'Pending') {
        return Response.json(
          {
            success: false,
            message: 'Your registration is awaiting admin approval.',
          },
          { status: 409 }
        );
      }
      return Response.json(
        { success: false, message: 'Email already registered.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email.toLowerCase(),
        password: hashedPassword,
        phone: payload.phone || null,
        institution: payload.institution?.trim() || null,
        role: payload.role || 'STUDENT',
        status: 'Pending',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        institution: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return Response.json(
      {
        success: true,
        data: user,
        message: 'Registration submitted. Await admin approval.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json(
      { success: false, message: 'Failed to register user.' },
      { status: 500 }
    );
  }
}
