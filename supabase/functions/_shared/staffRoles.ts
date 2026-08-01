export const PRIMARY_ADMIN_ROLE = 'مدير النظام';
export const STAFF_ROLE = 'مشرف';

export const isAssignableStaffRole = (role: unknown): role is typeof PRIMARY_ADMIN_ROLE | typeof STAFF_ROLE => (
  role === PRIMARY_ADMIN_ROLE || role === STAFF_ROLE
);

export const canManageStaff = (role: unknown): boolean => role === PRIMARY_ADMIN_ROLE;
