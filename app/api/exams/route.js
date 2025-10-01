import { NextResponse } from 'next/server';
import { PrismaExamRepository } from '@/infrastructure/repositories/prismaExamRepository';
import { CreateExamUseCase } from '@/application/use-cases/createExam';
import { ListExamsUseCase } from '@/application/use-cases/listExams';

const examRepository = new PrismaExamRepository();
const createExam = new CreateExamUseCase(examRepository);
const listExams = new ListExamsUseCase(examRepository);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const query = searchParams.get('query') || undefined;
  const examTypeId = searchParams.get('examTypeId')
    ? Number(searchParams.get('examTypeId'))
    : undefined;

  try {
    const data = await listExams.execute({ status, query, examTypeId });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { groupIds = [], ...examData } = body;

    const exam = await createExam.execute(examData);

    // Assign exam to groups if groupIds provided
    if (groupIds.length > 0) {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      try {
        // Create exam-group relationships
        await prisma.examGroup.createMany({
          data: groupIds.map(groupId => ({
            examId: exam.id,
            groupId: groupId,
          })),
        });

        // Create notifications for all members of assigned groups
        const groupMembers = await prisma.studentGroupMember.findMany({
          where: { groupId: { in: groupIds } },
          include: { group: true },
        });

        if (groupMembers.length > 0) {
          await prisma.notification.createMany({
            data: groupMembers.map(member => ({
              title: 'New Exam Assigned',
              message: `A new exam "${exam.title}" has been assigned to your group "${member.group.name}"`,
              type: 'info',
              userId: member.userId,
              groupId: member.groupId,
              examId: exam.id,
            })),
          });
        }

        await prisma.$disconnect();
      } catch (error) {
        console.error('Error assigning exam to groups:', error);
        // Don't fail the exam creation if group assignment fails
      }
    }

    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
