import { describe, expect, it } from 'vitest';
import { getCustomerSessionAction } from './customerSessionPolicy';

describe('getCustomerSessionAction', () => {
  const now = new Date('2026-08-02T12:00:00.000Z').getTime();

  it('activates a new tab instead of signing out a shared unremembered session', () => {
    expect(getCustomerSessionAction({
      rememberMe: false,
      loginTime: null,
      now,
    })).toBe('activate');
  });

  it('signs out only an expired remembered session', () => {
    expect(getCustomerSessionAction({
      rememberMe: true,
      loginTime: now - (16 * 24 * 60 * 60 * 1000),
      now,
    })).toBe('sign_out');
  });
});
