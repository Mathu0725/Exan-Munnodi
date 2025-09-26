export function createCategory(props) {
  return {
    id: props.id ?? null,
    name: props.name ?? '',
    slug: props.slug ?? '',
    order: props.order ?? 0,
    active: props.active ?? true,
    createdAt: props.createdAt ?? props.created_at ?? null,
    updatedAt: props.updatedAt ?? props.updated_at ?? null,
  };
}

