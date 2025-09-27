import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PATCH(request, { params }) {
  try {
    // Check authentication using JWT token
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'e933e3c8e4e4a7b4a2e5d1f8a7c6b3e2a1d0c9f8b7e6a5d4c3b2a1f0e9d8c7b6');
    
    if (!['Admin', 'Content Editor', 'Super Admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const { status } = await request.json();

    if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedStaff = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    // Create notification for the staff member
    await prisma.notification.create({
      data: {
        title: 'Account Status Updated',
        message: `Your account status has been changed to ${status} by ${session.user.name}.`,
        type: status === 'Active' ? 'success' : 'warning',
        userId: parseInt(id),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Staff status updated successfully.',
      staff: updatedStaff,
    });
  } catch (error) {
    console.error('PATCH /api/admin/staff/[id]/status failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
