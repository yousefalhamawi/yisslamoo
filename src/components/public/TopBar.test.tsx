import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import TopBar from './TopBar';
import { SOCIAL_LINKS } from '../../constants/socialLinks';

describe('TopBar', () => {
  it('shows every official social and WhatsApp link', () => {
    const markup = renderToStaticMarkup(<TopBar />);
    const pinterestStart = markup.indexOf(SOCIAL_LINKS.pinterest);
    const pinterestMarkup = markup.slice(pinterestStart, markup.indexOf('</a>', pinterestStart));

    expect(markup).toContain('w-6 h-6');
    expect(pinterestMarkup).toContain('<svg');
    expect(pinterestMarkup).toContain('fill="currentColor"');
    expect(pinterestMarkup).not.toContain('#CB2027');
    expect(markup).toContain(`href="${SOCIAL_LINKS.facebook}"`);
    expect(markup).toContain(`href="${SOCIAL_LINKS.instagram}"`);
    expect(markup).toContain(`href="${SOCIAL_LINKS.telegram}"`);
    expect(markup).toContain(`href="${SOCIAL_LINKS.threads}"`);
    expect(markup).toContain(`href="${SOCIAL_LINKS.tiktok}"`);
    expect(markup).toContain(`href="${SOCIAL_LINKS.whatsappChannel}"`);
    expect(markup).toContain(`href="${SOCIAL_LINKS.whatsapp}"`);
    expect(markup).toContain(`href="${SOCIAL_LINKS.x}"`);
    expect(markup).toContain(`href="${SOCIAL_LINKS.pinterest}"`);
  });
});
