export const ExamStatus = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
};

export function createExam(props = {}) {
  return {
    id: props.id ?? null,
    title: props.title ?? '',
    description: props.description ?? '',
    status: props.status ?? ExamStatus.DRAFT,
    examTypeId: props.examTypeId ?? null,
    startAt: props.startAt ?? null,
    endAt: props.endAt ?? null,
    questions: Array.isArray(props.questions) ? props.questions : [],
    config: props.config ?? {},
    createdAt: props.createdAt ?? undefined,
    updatedAt: props.updatedAt ?? undefined,
  };
}

export function updateExamEntity(existingExam, updates = {}) {
  if (!existingExam) throw new Error('Existing exam is required');
  return {
    ...existingExam,
    title: updates.title ?? existingExam.title,
    description: updates.description ?? existingExam.description,
    status: updates.status ?? existingExam.status,
    examTypeId: updates.examTypeId ?? existingExam.examTypeId,
    startAt: updates.startAt ?? existingExam.startAt,
    endAt: updates.endAt ?? existingExam.endAt,
    questions: updates.questions ?? existingExam.questions,
    config: updates.config ?? existingExam.config,
  };
}
