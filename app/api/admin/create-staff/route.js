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
    
    // Only Super Admin and Admin can create staff
    if (!['Super Admin', 'Admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized. Only Super Admin and Admin can create staff members.' }, { status: 403 });
    }

    const { name, email, password, role, institution, phone } = await request.json();

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: 'Name, email, password, and role are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // Validate role based on creator's role
    let allowedRoles = [];
    if (decoded.role === 'Super Admin') {
      allowedRoles = ['Admin', 'Content Editor', 'Reviewer', 'Analyst', 'Student'];
    } else if (decoded.role === 'Admin') {
      allowedRoles = ['Content Editor', 'Reviewer', 'Analyst', 'Student'];
    }
    
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

    // Determine status based on role
    const status = role === 'Student' ? 'Pending' : 'Active';
    
    // Create user
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        status,
        institution: institution?.trim() || null,
        phone: phone?.trim() || null,
        approvedById: decoded.id, // Admin/Super Admin who created this user
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

    // Create a notification for the new user
    const notificationTitle = role === 'Student' ? 'Account Created - Pending Approval' : 'Welcome to the Team!';
    const notificationMessage = role === 'Student' 
      ? `Your student account has been created by ${decoded.name}. Your account is pending approval.`
      : `Your ${role.toLowerCase()} account has been created by ${decoded.name}. You can now log in with your credentials.`;
    
    await prisma.notification.create({
      data: {
        title: notificationTitle,
        message: notificationMessage,
        type: role === 'Student' ? 'info' : 'success',
        userId: newUser.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: `${role} created successfully.${role === 'Student' ? ' Account is pending approval.' : ''}`,
      user: newUser,
    }, { status: 201 });

  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json({ error: 'Failed to create staff member.' }, { status: 500 });
  }
}
