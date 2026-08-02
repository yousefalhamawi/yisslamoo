const REMEMBERED_SESSION_DURATION_MS = 15 * 24 * 60 * 60 * 1000;

export type CustomerSessionAction = 'activate' | 'sign_out';

interface CustomerSessionState {
  rememberMe: boolean;
  loginTime: number | null;
  now: number;
}

/**
 * Browser tabs share the Supabase session, while sessionStorage is tab-local.
 * A new tab must therefore activate itself, not sign out every tab.
 */
export const getCustomerSessionAction = ({
  rememberMe,
  loginTime,
  now,
}: CustomerSessionState): CustomerSessionAction => {
  const hasExpiredRememberedSession = rememberMe
    && loginTime !== null
    && now - loginTime > REMEMBERED_SESSION_DURATION_MS;

  return hasExpiredRememberedSession ? 'sign_out' : 'activate';
};
