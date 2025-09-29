import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';

export async function GET(request) {
  try {
    // Check authentication using JWT token
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);

    if (!['Admin', 'Content Editor'].includes(decoded.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const examId = searchParams.get('examId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minScore = searchParams.get('minScore');
    const maxScore = searchParams.get('maxScore');
    const status = searchParams.get('status');

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
            name: true,
            email: true,
          },
        },
        exam: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    // Apply score filters
    let filteredResults = results;

    if (minScore || maxScore) {
      filteredResults = results.filter(result => {
        const percentage = (result.score / result.totalMarks) * 100;
        if (minScore && percentage < parseInt(minScore)) return false;
        if (maxScore && percentage > parseInt(maxScore)) return false;
        return true;
      });
    }

    // Format data for CSV
    const csvData = filteredResults.map(result => ({
      'Student Name': result.user?.name || 'Unknown',
      'Student Email': result.user?.email || 'Unknown',
      'Exam Title': result.exam?.title || 'Unknown',
      Score: result.score,
      'Total Marks': result.totalMarks,
      Percentage: ((result.score / result.totalMarks) * 100).toFixed(2) + '%',
      Status: result.status || 'Unknown',
      'Submitted At': result.submittedAt
        ? new Date(result.submittedAt).toLocaleString()
        : 'Not submitted',
    }));

    // Convert to CSV
    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvData.map(row =>
        headers.map(header => `"${row[header] || ''}"`).join(',')
      ),
    ].join('\n');

    const filename = `exam-reports-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('GET /api/admin/exam-reports/export failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
