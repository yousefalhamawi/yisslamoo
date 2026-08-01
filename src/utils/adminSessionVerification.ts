export const isVerifiedAdminSession = (
  verifiedUserId: string | null,
  currentUserId: string | null | undefined,
): boolean => Boolean(verifiedUserId && currentUserId && verifiedUserId === currentUserId);
