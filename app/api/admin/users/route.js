import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { emailService } from '@/services/emailService';

const sanitizeUser = (user) => {
  if (!user) return null;
  const { password, ...rest } = user;
  return {
    ...rest,
    approvedBy: user.approvedBy
      ? {
          id: user.approvedBy.id,
          name: user.approvedBy.name,
          email: user.approvedBy.email,
        }
      : null,
  };
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = searchParams.get('role');

    const users = await prisma.user.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(role ? { role } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        approvedBy: true,
        profile: true,
      },
    });

    return NextResponse.json({ success: true, data: users.map(sanitizeUser) });
  } catch (error) {
    console.error('Admin users GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch users.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, email, password, role = 'Student', status = 'Pending', phone, institution, approvedById } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Name, email, and password are required.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ success: false, message: 'Email already registered.' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        status,
        phone: phone || null,
        institution: institution || null,
        approvedById: status === 'Active' ? approvedById || null : null,
      },
      include: {
        approvedBy: true,
        profile: true,
      },
    });

    return NextResponse.json({ success: true, data: sanitizeUser(user) }, { status: 201 });
  } catch (error) {
    console.error('Admin users POST error:', error);
    return NextResponse.json({ success: false, message: 'Failed to create user.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const { id, status, role, approvedById } = await request.json();

    if (!id) {
      return NextResponse.json({ success: false, message: 'User id is required.' }, { status: 400 });
    }

    const data = {};

    if (status) {
      data.status = status;
      if (['Approved', 'Active'].includes(status)) {
        data.approvedById = approvedById ? Number(approvedById) : null;
      } else if (['Pending', 'Inactive', 'Rejected', 'Suspended'].includes(status)) {
        data.approvedById = null;
      }
    }

    if (role) {
      data.role = role;
    }

    const updated = await prisma.user.update({
      where: { id: Number(id) },
      data,
      include: {
        approvedBy: true,
        profile: true,
      },
    });

    const sanitized = sanitizeUser(updated);

    if (status && ['Approved', 'Rejected', 'Suspended'].includes(status)) {
      try {
        await emailService.sendUserApprovalEmail(
          sanitized.email,
          sanitized.name,
          status,
          sanitized.approvedBy?.name || 'Administrator',
        );
      } catch (emailError) {
        console.error('User status email failed:', emailError.message);
      }
    }

    return NextResponse.json({ success: true, data: sanitized });
  } catch (error) {
    console.error('Admin users PATCH error:', error);
    return NextResponse.json({ success: false, message: 'Failed to update user.' }, { status: 500 });
  }
}
