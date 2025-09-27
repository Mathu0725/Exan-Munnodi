'use server';

import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

const REQUIRED_FIELDS = ['name', 'email', 'password'];

function validatePayload(body) {
  const errors = {};

  REQUIRED_FIELDS.forEach((field) => {
    if (!body[field] || typeof body[field] !== 'string' || !body[field].trim()) {
      errors[field] = `${field} is required`;
    }
  });

  if (body.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      errors.email = 'Invalid email address';
    }
  }

  if (body.password && body.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  return errors;
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const errors = validatePayload(payload);

    if (Object.keys(errors).length > 0) {
      return Response.json({ success: false, errors }, { status: 422 });
    }

    const existing = await prisma.user.findUnique({ where: { email: payload.email.toLowerCase() } });

    if (existing) {
      if (existing.status === 'Pending') {
        return Response.json({ success: false, message: 'Your registration is awaiting admin approval.' }, { status: 409 });
      }
      return Response.json({ success: false, message: 'Email already registered.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
      data: {
        name: payload.name.trim(),
        email: payload.email.toLowerCase(),
        password: hashedPassword,
        phone: payload.phone?.trim() || null,
        institution: payload.institution?.trim() || null,
        role: 'Student',
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

    return Response.json({ success: true, data: user, message: 'Registration submitted. Await admin approval.' }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ success: false, message: 'Failed to register user.' }, { status: 500 });
  }
}
