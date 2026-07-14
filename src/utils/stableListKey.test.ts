import { describe, expect, it } from 'vitest';
import { getStableListKey } from './stableListKey';

describe('getStableListKey', () => {
  it('returns a unique non-empty fallback when the primary data identity is missing', () => {
    expect(getStableListKey('', '', 'product', 0)).toBe('product-0');
    expect(getStableListKey(undefined, undefined, 'category', 1)).toBe('category-1');
  });

  it('keeps a valid identity stable when the list is reordered', () => {
    expect(getStableListKey('product-123', 'product-slug', 'product', 2)).toBe('product-123');
  });
});
