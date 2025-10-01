import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, ROLES } from '@/lib/auth-middleware';

export async function DELETE(request, { params }) {
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
    const staffId = parseInt(id);

    // Prevent deleting self
    if (staffId === decoded.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Check if staff member exists
    const staff = await prisma.user.findUnique({
      where: { id: staffId },
      select: { id: true, name: true, role: true },
    });

    if (!staff) {
      return NextResponse.json({ error: 'Staff member not found' }, { status: 404 });
    }

    // Delete the staff member
    await prisma.user.delete({
      where: { id: staffId },
    });

    return NextResponse.json({
      success: true,
      message: 'Staff member deleted successfully.',
    });
  } catch (error) {
    console.error('DELETE /api/admin/staff/[id] failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
