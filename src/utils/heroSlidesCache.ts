import { HeroSlide } from '../types/admin';

export const HERO_SLIDES_CACHE_KEY = 'yaslamo_hero_slides';

export const parseHeroSlidesCache = (value: string | null): HeroSlide[] | null => {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed as HeroSlide[] : null;
  } catch {
    return null;
  }
};

export const readHeroSlidesCache = (): HeroSlide[] | null => {
  if (typeof window === 'undefined') return null;
  return parseHeroSlidesCache(sessionStorage.getItem(HERO_SLIDES_CACHE_KEY));
};

export const writeHeroSlidesCache = (slides: HeroSlide[]): void => {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(HERO_SLIDES_CACHE_KEY, JSON.stringify(slides));
};
