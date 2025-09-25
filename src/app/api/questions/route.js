import prisma from '@/lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    prisma.question.count(),
    prisma.question.findMany({
      skip,
      take: limit,
      include: { options: true },
      orderBy: { id: 'desc' },
    }),
  ]);

  return Response.json({
    data: items.map((q) => ({
      id: q.id,
      title: q.title,
      body: q.body,
      subject_id: q.subjectId,
      sub_subject_id: q.subSubjectId,
      category_id: q.categoryId,
      difficulty: q.difficulty,
      marks: q.marks,
      negative_marks: q.negativeMarks,
      options: q.options.map((o) => ({ id: String(o.id), text: o.text, is_correct: o.isCorrect })),
      status: 'published',
    })),
    meta: { currentPage: page, totalPages: Math.max(1, Math.ceil(total / limit)), total, pageSize: limit },
  });
}

export async function POST(request) {
  const payload = await request.json();
  const created = await prisma.question.create({
    data: {
      title: payload.title,
      body: payload.body || '',
      subjectId: payload.subject_id,
      subSubjectId: payload.sub_subject_id || null,
      categoryId: payload.category_id,
      difficulty: payload.difficulty || 1,
      marks: payload.marks || 1,
      negativeMarks: payload.negative_marks || 0,
      options: {
        create: (payload.options || []).map((o) => ({ text: o.text, isCorrect: !!o.is_correct })),
      },
    },
    include: { options: true },
  });

  return Response.json({ id: created.id }, { status: 201 });
}


