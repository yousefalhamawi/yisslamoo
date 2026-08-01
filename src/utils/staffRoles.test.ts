import { describe, expect, it } from 'vitest';
import {
  PRIMARY_ADMIN_ROLE,
  STAFF_ROLE,
  canManageStaff,
  isAssignableStaffRole,
} from '../../supabase/functions/_shared/staffRoles';

describe('staff role assignment', () => {
  it('allows a system administrator to assign either supported staff role', () => {
    expect(isAssignableStaffRole(PRIMARY_ADMIN_ROLE)).toBe(true);
    expect(isAssignableStaffRole(STAFF_ROLE)).toBe(true);
  });

  it('rejects unsupported roles before they reach privileged staff operations', () => {
    expect(isAssignableStaffRole('عميل')).toBe(false);
    expect(isAssignableStaffRole('')).toBe(false);
  });

  it('allows staff management only to a system administrator', () => {
    expect(canManageStaff(PRIMARY_ADMIN_ROLE)).toBe(true);
    expect(canManageStaff(STAFF_ROLE)).toBe(false);
  });
});
