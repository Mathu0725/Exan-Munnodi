import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyAuth, ROLES } from '@/lib/auth-middleware';

export async function GET(request) {
  try {
    // Verify authentication and authorization
    const authResult = await verifyAuth(request, {
      requiredRoles: [ROLES.ADMIN, ROLES.CONTENT_EDITOR]
    });

    if (!authResult.success) {
      return authResult.error;
    }

    const user = authResult.user;

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    const where = {};
    
    if (examId) {
      where.examId = parseInt(examId);
    }
    
    if (startDate || endDate) {
      where.submittedAt = {};
      if (startDate) {
        where.submittedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.submittedAt.lte = new Date(endDate);
      }
    }
    
    if (status) {
      where.status = status;
    }

    const results = await prisma.examResult.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        exam: {
          select: {
            id: true,
            title: true,
            duration: true,
            startAt: true,
            endAt: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: limit,
    });

    // Apply score filters after fetching (since we need to calculate percentage)
    let filteredResults = results;
    
    if (minScore || maxScore) {
      filteredResults = results.filter(result => {
        const percentage = (result.score / result.totalMarks) * 100;
        if (minScore && percentage < parseInt(minScore)) return false;
        if (maxScore && percentage > parseInt(maxScore)) return false;
        return true;
      });
    }

    return NextResponse.json({ data: filteredResults });
  } catch (error) {
    console.error('GET /api/admin/exam-reports failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
