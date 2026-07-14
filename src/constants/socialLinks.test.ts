import { describe, expect, it } from 'vitest';
import { SOCIAL_LINKS } from './socialLinks';

describe('SOCIAL_LINKS', () => {
  it('contains the official direct-contact and social-platform URLs', () => {
    expect(SOCIAL_LINKS).toMatchObject({
      whatsappChannel: 'https://whatsapp.com/channel/0029VbDaE8jA89Mpn3OOEa2S',
      whatsapp: 'https://wa.me/963981493701',
      facebook: 'https://www.facebook.com/share/1DtysN3UWP/',
      instagram: 'https://www.instagram.com/yisslamoo?igsh=MTlxamw4YzZ4aWtqZA==',
      telegram: 'https://t.me/Yisslamoo',
      threads: 'https://www.threads.com/@yisslamoo',
      tiktok: 'https://www.tiktok.com/@yisslamoo/',
      x: 'https://x.com/yisslamoo',
      pinterest: 'https://pin.it/1s875Shar',
    });
  });
});
