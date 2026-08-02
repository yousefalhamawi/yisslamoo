import { describe, expect, it } from 'vitest';
import { isVerifiedAdminSession } from './adminSessionVerification';

describe('isVerifiedAdminSession', () => {
  it('keeps an explicitly verified admin session authoritative for the same user', () => {
    expect(isVerifiedAdminSession('admin-user-id', 'admin-user-id')).toBe(true);
  });

  it('keeps a successful login authoritative when an older profile check fails later', () => {
    const verifiedAdminUserId = 'admin-user-id';
    const profileRequestUserId = 'admin-user-id';

    expect(isVerifiedAdminSession(verifiedAdminUserId, profileRequestUserId)).toBe(true);
  });

  it('requires a new verification when the user changes or is missing', () => {
    expect(isVerifiedAdminSession('admin-user-id', 'another-user-id')).toBe(false);
    expect(isVerifiedAdminSession('admin-user-id', null)).toBe(false);
  });
});
