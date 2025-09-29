export function ensureAdmin(user) {
  if (!user) throw new Error('Authentication required');
  if (user.role !== 'Admin') throw new Error('Admin privileges required');
}
