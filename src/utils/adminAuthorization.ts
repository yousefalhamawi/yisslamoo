export const ADMIN_ROLES = ['مدير النظام', 'مشرف'] as const;

export const hasAdminAccess = (role?: string | null): boolean => (
  typeof role === 'string' && ADMIN_ROLES.includes(role.trim() as typeof ADMIN_ROLES[number])
);
