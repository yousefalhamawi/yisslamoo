import { describe, expect, it } from 'vitest';
import type { Product } from '../types';
import { isProductAvailableForStore, isProductOutOfStock } from './productAvailability';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'product-1',
  name: 'منتج تجريبي',
  price: 1000,
  image: '',
  category: 'العناية',
  description: '',
  features: [],
  stock: 0,
  slug: 'test-product',
  ...overrides,
});

describe('product availability', () => {
  it('shows a regular product only when its stock is positive', () => {
    expect(isProductAvailableForStore(makeProduct({ stock: 1 }))).toBe(true);
    expect(isProductAvailableForStore(makeProduct({ stock: 0 }))).toBe(false);
  });

  it('shows made-to-order products even when their stock is zero', () => {
    expect(isProductAvailableForStore(makeProduct({ stock: 0, is_made_to_order: true }))).toBe(true);
  });

  it('marks only ordinary zero-stock products as out of stock', () => {
    expect(isProductOutOfStock(makeProduct({ stock: 0 }))).toBe(true);
    expect(isProductOutOfStock(makeProduct({ stock: 0, is_made_to_order: true }))).toBe(false);
  });
});
