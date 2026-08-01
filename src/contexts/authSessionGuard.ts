export interface AuthSessionGuard {
  captureVersion: () => number;
  recordAuthEvent: (event: string) => boolean;
  canApplyInitialSession: (requestVersion: number) => boolean;
}

export const createAuthSessionGuard = (): AuthSessionGuard => {
  let authEventVersion = 0;
  let hasReceivedNonInitialEvent = false;

  return {
    captureVersion: () => authEventVersion,
    recordAuthEvent: (event: string) => {
      // Supabase can deliver INITIAL_SESSION after a newer SIGNED_IN event.
      // That stale null session must not replace the authenticated user.
      if (event === 'INITIAL_SESSION' && hasReceivedNonInitialEvent) {
        return false;
      }

      authEventVersion += 1;

      if (event !== 'INITIAL_SESSION') {
        hasReceivedNonInitialEvent = true;
      }

      return true;
    },
    canApplyInitialSession: (requestVersion: number) => requestVersion === authEventVersion,
  };
};
