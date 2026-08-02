export interface AuthSessionGuard {
  captureVersion: () => number;
  recordAuthEvent: (event: string, hasSession?: boolean) => boolean;
  canApplyInitialSession: (requestVersion: number) => boolean;
}

export const createAuthSessionGuard = (): AuthSessionGuard => {
  let authEventVersion = 0;
  let hasReceivedNonInitialEvent = false;
  let hasConfirmedSession = false;

  return {
    captureVersion: () => authEventVersion,
    recordAuthEvent: (event: string, hasSession = event !== 'INITIAL_SESSION' && event !== 'SIGNED_OUT') => {
      // A missing session is authoritative only for an explicit SIGNED_OUT.
      // Other null-session events can be delayed browser/auth callbacks and
      // must not evict a user who has already been confirmed as signed in.
      if (event !== 'SIGNED_OUT' && !hasSession && hasConfirmedSession) {
        return false;
      }

      // Supabase can deliver INITIAL_SESSION after a newer SIGNED_IN event.
      // That stale null session must not replace the authenticated user.
      if (event === 'INITIAL_SESSION' && hasReceivedNonInitialEvent) {
        return false;
      }

      authEventVersion += 1;

      if (event !== 'INITIAL_SESSION') {
        hasReceivedNonInitialEvent = true;
      }

      if (event === 'SIGNED_OUT') {
        hasConfirmedSession = false;
      } else if (hasSession) {
        hasConfirmedSession = true;
      }

      return true;
    },
    canApplyInitialSession: (requestVersion: number) => requestVersion === authEventVersion,
  };
};
