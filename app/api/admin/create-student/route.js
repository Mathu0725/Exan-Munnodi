import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { verifyAuth, ROLES } from '@/lib/auth-middleware';

export async function POST(request) {
  try {
    // Verify authentication and authorization
    const authResult = await verifyAuth(request, {
      requiredRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN]
    });

    if (!authResult.success) {
      return authResult.error;
    }

    const user = authResult.user;

    const { name, email, password, institution, phone, studentId, grade, department } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
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

    // Create student
    const newStudent = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'Student',
        status: 'Pending', // Students need approval
        institution: institution?.trim() || null,
        phone: phone?.trim() || null,
        approvedById: decoded.id, // Admin/Super Admin who created this student
        // Student-specific fields
        studentId: studentId?.trim() || null,
        grade: grade?.trim() || null,
        department: department?.trim() || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        institution: true,
        phone: true,
        studentId: true,
        grade: true,
        department: true,
        createdAt: true,
      },
    });

    // Create a notification for the new student
    await prisma.notification.create({
      data: {
        title: 'Student Account Created - Pending Approval',
        message: `Your student account has been created by ${decoded.name}. Your account is pending approval by an administrator.`,
        type: 'info',
        userId: newStudent.id,
      },
    });

    // Create a notification for admins about the new student
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ['Admin', 'Super Admin'] },
        status: 'Active'
      },
      select: { id: true }
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          title: 'New Student Registration',
          message: `A new student "${newStudent.name}" has been registered and is pending approval.`,
          type: 'info',
          userId: admin.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Student created successfully. Account is pending approval.',
      student: newStudent,
    }, { status: 201 });

  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json({ error: 'Failed to create student.' }, { status: 500 });
  }
}
