import { describe, expect, it } from 'vitest';
import { createAuthSessionGuard } from './authSessionGuard';

describe('createAuthSessionGuard', () => {
  it('accepts the initial session result when no auth event occurred afterwards', () => {
    const guard = createAuthSessionGuard();
    const requestVersion = guard.captureVersion();

    expect(guard.canApplyInitialSession(requestVersion)).toBe(true);
  });

  it('rejects an initial session result that becomes stale after a sign-in event', () => {
    const guard = createAuthSessionGuard();
    const requestVersion = guard.captureVersion();

    guard.recordAuthEvent('SIGNED_IN');

    expect(guard.canApplyInitialSession(requestVersion)).toBe(false);
  });

  it('ignores a delayed INITIAL_SESSION event after a newer sign-in event', () => {
    const guard = createAuthSessionGuard();

    expect(guard.recordAuthEvent('SIGNED_IN')).toBe(true);
    expect(guard.recordAuthEvent('INITIAL_SESSION')).toBe(false);
  });

  it('preserves a real sign-out when an INITIAL_SESSION event arrives late', () => {
    const guard = createAuthSessionGuard();

    expect(guard.recordAuthEvent('SIGNED_OUT')).toBe(true);
    expect(guard.recordAuthEvent('INITIAL_SESSION')).toBe(false);
  });
});
