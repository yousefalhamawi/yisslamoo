import { describe, expect, it } from 'vitest';
import { getProductCardLayout } from './productCardLayout';

describe('getProductCardLayout', () => {
  it('uses a horizontal RTL-friendly layout for list view', () => {
    const layout = getProductCardLayout('list');

    expect(layout.card).toContain('flex-row');
    expect(layout.image).toContain('w-[42%]');
    expect(layout.description).toContain('line-clamp-2');
  });

  it('keeps the existing vertical layout for grid view', () => {
    const layout = getProductCardLayout('grid');

    expect(layout.card).toContain('flex-col');
    expect(layout.image).toContain('aspect-[4/5]');
  });
});
