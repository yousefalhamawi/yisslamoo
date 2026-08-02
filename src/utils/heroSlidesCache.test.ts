import { describe, expect, it } from 'vitest';
import { parseHeroSlidesCache } from './heroSlidesCache';

describe('parseHeroSlidesCache', () => {
  it('restores a cached list of hero slides', () => {
    expect(parseHeroSlidesCache('[{"id":"slide-1","title":"عرض"}]')).toEqual([
      { id: 'slide-1', title: 'عرض' },
    ]);
  });

  it('ignores invalid or non-list cache values', () => {
    expect(parseHeroSlidesCache('{"id":"slide-1"}')).toBeNull();
    expect(parseHeroSlidesCache('not-json')).toBeNull();
    expect(parseHeroSlidesCache(null)).toBeNull();
  });
});
