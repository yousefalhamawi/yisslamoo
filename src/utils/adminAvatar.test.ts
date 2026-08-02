import { describe, expect, it } from 'vitest';
import { getAdminAvatarSrc } from './adminAvatar';

describe('getAdminAvatarSrc', () => {
  it('uses the same brand logo as the admin header when no personal image is set', () => {
    expect(getAdminAvatarSrc()).toBe('/img/logo/logo.png');
  });

  it('keeps a personal admin image when one has been uploaded', () => {
    expect(getAdminAvatarSrc('https://example.com/admin.jpg')).toBe('https://example.com/admin.jpg');
  });
});
