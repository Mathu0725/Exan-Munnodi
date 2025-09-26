export function createSubject(props) {
  return {
    id: props.id ?? null,
    name: props.name ?? '',
    slug: props.slug ?? '',
    order: props.order ?? 0,
    active: props.active ?? true,
    subsubjects: (props.subsubjects || []).map(createSubSubject),
    createdAt: props.createdAt ?? props.created_at ?? null,
    updatedAt: props.updatedAt ?? props.updated_at ?? null,
  };
}

export function createSubSubject(props) {
  return {
    id: props.id ?? null,
    name: props.name ?? '',
    slug: props.slug ?? '',
    order: props.order ?? 0,
    subjectId: props.subjectId ?? props.subject_id ?? null,
  };
}

