export function createQuestion(props) {
  const normalizeTags = value => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) return parsed;
      } catch (error) {
        // If JSON parsing fails, fall back to string splitting
      }
      return value
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    }
    return [];
  };

  const normalizeOptions = (options = []) =>
    (Array.isArray(options) ? options : []).map(opt => ({
      id: opt.id ?? opt.option_id ?? null,
      text: opt.text ?? opt.label ?? '',
      isCorrect: opt.isCorrect ?? opt.is_correct ?? false,
    }));

  return {
    id: props.id ?? null,
    title: props.title ?? '',
    body: props.body ?? '',
    subjectId: props.subjectId ?? props.subject_id ?? null,
    subSubjectId: props.subSubjectId ?? props.sub_subject_id ?? null,
    categoryId: props.categoryId ?? props.category_id ?? null,
    difficulty: props.difficulty ?? 1,
    marks: props.marks ?? 1,
    negativeMarks: props.negativeMarks ?? props.negative_marks ?? 0,
    status: props.status ?? 'draft',
    tags: normalizeTags(props.tags),
    options: normalizeOptions(props.options),
    createdAt: props.createdAt ?? props.created_at ?? null,
    updatedAt: props.updatedAt ?? props.updated_at ?? null,
  };
}
