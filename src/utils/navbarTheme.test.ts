import { describe, expect, it } from 'vitest';
import { shouldUseLightNavbarText } from './navbarTheme';

describe('shouldUseLightNavbarText', () => {
  it('keeps the navbar dark and readable on the white About page header', () => {
    expect(shouldUseLightNavbarText('/about', false)).toBe(false);
  });

  it('uses light text only for the unscrolled Policies hero', () => {
    expect(shouldUseLightNavbarText('/policies', false)).toBe(true);
    expect(shouldUseLightNavbarText('/policies', true)).toBe(false);
  });
});
