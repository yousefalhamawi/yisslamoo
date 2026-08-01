import { describe, test, expect } from 'vitest';
import {
  resolveCategoryIcon,
  DEFAULT_CATEGORY_ICON,
  CATEGORY_ICON_OPTIONS
} from './categoryIcons';

describe('CATEGORY_ICON_OPTIONS', () => {
  test('has no duplicate icon names', () => {
    const names = CATEGORY_ICON_OPTIONS.map(o => o.name);

    expect(new Set(names).size).toBe(names.length);
  });

  test('every option carries a label and a component', () => {
    for (const option of CATEGORY_ICON_OPTIONS) {
      expect(option.label.length).toBeGreaterThan(0);
      expect(option.Icon).toBeTruthy();
    }
  });
});

describe('resolveCategoryIcon', () => {
  test('prefers the icon chosen by the admin over the name guess', () => {
    const chosen = CATEGORY_ICON_OPTIONS.find(o => o.name === 'Gem');

    // اسم التصنيف يوحي بالملابس، لكن الأدمن اختار المجوهرات
    const resolved = resolveCategoryIcon({ name: 'ملابس', icon: 'Gem' });

    expect(resolved).toBe(chosen!.Icon);
  });

  test('falls back to the name guess when no icon is stored', () => {
    const withKeyword = resolveCategoryIcon({ name: 'العناية بالشعر', icon: null });
    const scissors = CATEGORY_ICON_OPTIONS.find(o => o.name === 'Scissors');

    expect(withKeyword).toBe(scissors!.Icon);
  });

  test('ignores an unknown icon name and falls back safely', () => {
    const resolved = resolveCategoryIcon({ name: 'شيء غريب', icon: 'NotARealIcon' });

    expect(resolved).toBe(DEFAULT_CATEGORY_ICON);
  });

  test('returns the default icon for a missing or empty category', () => {
    expect(resolveCategoryIcon(null)).toBe(DEFAULT_CATEGORY_ICON);
    expect(resolveCategoryIcon(undefined)).toBe(DEFAULT_CATEGORY_ICON);
    expect(resolveCategoryIcon({})).toBe(DEFAULT_CATEGORY_ICON);
  });

  test('matches keywords case-insensitively for latin names', () => {
    const phone = CATEGORY_ICON_OPTIONS.find(o => o.name === 'Smartphone');

    expect(resolveCategoryIcon({ name: 'PHONE accessories' })).toBe(phone!.Icon);
  });

  test('distinguishes skin care from hair care', () => {
    const skin = resolveCategoryIcon({ name: 'العناية بالبشرة' });
    const hair = resolveCategoryIcon({ name: 'العناية بالشعر' });

    expect(skin).not.toBe(hair);
  });
});
