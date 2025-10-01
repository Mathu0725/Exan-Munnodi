import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, ROLES } from '@/lib/auth-middleware';

export async function PATCH(request, { params }) {
  try {
    // Verify authentication and authorization
    const authResult = await verifyAuth(request, {
      requiredRoles: [ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.CONTENT_EDITOR]
    });

    if (!authResult.success) {
      return authResult.error;
    }

    const user = authResult.user;

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
