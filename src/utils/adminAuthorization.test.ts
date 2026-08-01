import { describe, expect, it } from 'vitest';
import { hasAdminAccess } from './adminAuthorization';

describe('hasAdminAccess', () => {
  it('allows the supported administration roles after trimming whitespace', () => {
    expect(hasAdminAccess(' مدير النظام ')).toBe(true);
    expect(hasAdminAccess('مشرف')).toBe(true);
  });

  it('denies missing or unsupported roles', () => {
    expect(hasAdminAccess()).toBe(false);
    expect(hasAdminAccess('عميل')).toBe(false);
  });
});
