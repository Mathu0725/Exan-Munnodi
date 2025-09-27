import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const group = await prisma.studentGroup.findUnique({
      where: { id: Number(params.id) },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
                role: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        examGroups: {
          include: {
            exam: {
              select: {
                id: true,
                title: true,
                status: true,
                startAt: true,
                endAt: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            examGroups: true,
          },
        },
      },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json(group);
  } catch (error) {
    console.error('GET /api/student-groups/[id] failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const body = await request.json();
    const { name, description, color, memberIds } = body;

    const group = await prisma.studentGroup.findUnique({
      where: { id: Number(params.id) },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;

    const updatedGroup = await prisma.studentGroup.update({
      where: { id: Number(params.id) },
      data: updateData,
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                status: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
            examGroups: true,
          },
        },
      },
    });

    // Update members if provided
    if (memberIds !== undefined) {
      // Remove all existing members
      await prisma.studentGroupMember.deleteMany({
        where: { groupId: Number(params.id) },
      });

      // Add new members
      if (memberIds.length > 0) {
        await prisma.studentGroupMember.createMany({
          data: memberIds.map(userId => ({
            groupId: Number(params.id),
            userId,
          })),
        });
      }
    }

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error('PATCH /api/student-groups/[id] failed', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const group = await prisma.studentGroup.findUnique({
      where: { id: Number(params.id) },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Soft delete by setting isActive to false
    await prisma.studentGroup.update({
      where: { id: Number(params.id) },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/student-groups/[id] failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
