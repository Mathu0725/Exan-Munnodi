export function createUserProfile(props) {
  if (!props) props = {};

  return {
    id: props.id ?? null,
    userId: props.userId ?? props.user_id ?? null,
    avatarUrl: props.avatarUrl ?? props.avatar_url ?? null,
    bio: props.bio ?? null,
    address: props.address ?? null,
    city: props.city ?? null,
    state: props.state ?? null,
    country: props.country ?? null,
    postalCode: props.postalCode ?? props.postal_code ?? null,
    createdAt: props.createdAt ?? props.created_at ?? null,
    updatedAt: props.updatedAt ?? props.updated_at ?? null,
  };
}
