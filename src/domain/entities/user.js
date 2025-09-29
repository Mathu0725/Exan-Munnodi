export const UserStatuses = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended',
  REJECTED: 'Rejected',
};

export const UserRoles = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  CONTENT_EDITOR: 'Content Editor',
  REVIEWER: 'Reviewer',
  ANALYST: 'Analyst',
  STUDENT: 'Student',
};

export function createUser(props) {
  if (!props) props = {};

  return {
    id: props.id ?? null,
    name: props.name ?? '',
    email: props.email ?? '',
    phone: props.phone ?? '',
    institution: props.institution ?? '',
    role: props.role ?? UserRoles.STUDENT,
    status: props.status ?? UserStatuses.PENDING,
    approvedById: props.approvedById ?? null,
    approvedBy: props.approvedBy ?? null,
    profile: props.profile ?? null,
    createdAt: props.createdAt ?? props.created_at ?? null,
    updatedAt: props.updatedAt ?? props.updated_at ?? null,
  };
}

export function createUserUpdateRequest(props) {
  if (!props) props = {};

  return {
    id: props.id ?? null,
    userId: props.userId ?? props.user_id ?? null,
    user: props.user ? createUser(props.user) : null,
    changes: props.changes ?? '',
    status: props.status ?? 'Pending',
    comment: props.comment ?? '',
    reviewedById: props.reviewedById ?? null,
    reviewedBy: props.reviewedBy ?? null,
    reviewedAt: props.reviewedAt ?? props.reviewed_at ?? null,
    createdAt: props.createdAt ?? props.created_at ?? null,
    updatedAt: props.updatedAt ?? props.updated_at ?? null,
  };
}
