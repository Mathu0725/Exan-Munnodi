import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // Check authentication using JWT token
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'e933e3c8e4e4a7b4a2e5d1f8a7c6b3e2a1d0c9f8b7e6a5d4c3b2a1f0e9d8c7b6');
    
    // Only Super Admin can create other admins
    if (decoded.role !== 'Super Admin') {
      return NextResponse.json({ error: 'Unauthorized. Only Super Admin can create other admins.' }, { status: 403 });
    }

    const { name, email, password, role, institution, phone } = await request.json();

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Name, email, password, and role are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // Validate role - Super Admin can create Admin and other staff roles
    const allowedRoles = ['Admin', 'Content Editor', 'Reviewer', 'Analyst'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ 
        error: `Invalid role. You can create: ${allowedRoles.join(', ')}.` 
      }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists.' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin/staff member
    const newAdmin = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        status: 'Active', // Admins and staff are automatically active
        institution: institution?.trim() || null,
        phone: phone?.trim() || null,
        approvedById: decoded.id, // Super Admin who created this admin
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        institution: true,
        phone: true,
        createdAt: true,
      },
    });

    // Create a notification for the new admin/staff member
    await prisma.notification.create({
      data: {
        title: 'Welcome to the Team!',
        message: `Your ${role.toLowerCase()} account has been created by ${decoded.name}. You can now log in with your credentials.`,
        type: 'success',
        userId: newAdmin.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${role} created successfully.`,
      admin: newAdmin,
    }, { status: 201 });

  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ error: 'Failed to create admin.' }, { status: 500 });
  }
}
