export const ADMIN_HEADER_AVATAR = '/img/logo/logo.png';

export const getAdminAvatarSrc = (avatar?: string | null): string => (
  avatar?.trim() || ADMIN_HEADER_AVATAR
);
