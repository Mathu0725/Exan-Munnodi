import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';

export async function DELETE(request, { params }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decoded = verifyAccessToken(token);

    if (!['Admin', 'Content Editor', 'Super Admin'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const staffId = parseInt(id);

    // Prevent deleting self
    if (staffId === decoded.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if staff member exists
    const staff = await prisma.user.findUnique({
      where: { id: staffId },
      select: { id: true, name: true, role: true },
    });

    if (!staff) {
      return NextResponse.json(
        { error: 'Staff member not found' },
        { status: 404 }
      );
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
