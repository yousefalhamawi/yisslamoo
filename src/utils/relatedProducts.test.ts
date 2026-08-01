import { describe, test, expect } from 'vitest';
import { getRelatedProducts, getProductCategories } from './relatedProducts';
import { Product } from '../types/index';

const makeProduct = (overrides: Partial<Product> & { id: string }): Product => ({
  name: `منتج ${overrides.id}`,
  price: 100000,
  image: '',
  category: 'ساعات',
  description: '',
  features: [],
  stock: 10,
  slug: `product-${overrides.id}`,
  ...overrides
});

describe('getProductCategories', () => {
  test('falls back to the legacy category field when categories is empty', () => {
    const product = makeProduct({ id: '1', category: 'عطور', categories: [] });

    expect(getProductCategories(product)).toEqual(['عطور']);
  });

  test('prefers the categories array when it is populated', () => {
    const product = makeProduct({ id: '1', category: 'عطور', categories: ['ساعات', 'هدايا'] });

    expect(getProductCategories(product)).toEqual(['ساعات', 'هدايا']);
  });
});

describe('getRelatedProducts', () => {
  test('returns only products sharing a category with the current product', () => {
    const current = makeProduct({ id: 'current', category: 'ساعات' });
    const all = [
      current,
      makeProduct({ id: 'same', category: 'ساعات' }),
      makeProduct({ id: 'other', category: 'عطور' })
    ];

    const related = getRelatedProducts(current, all);

    expect(related.map(p => p.id)).toEqual(['same']);
  });

  test('excludes the current product from its own suggestions', () => {
    const current = makeProduct({ id: 'current', category: 'ساعات' });
    const all = [current, makeProduct({ id: 'same', category: 'ساعات' })];

    const related = getRelatedProducts(current, all);

    expect(related.some(p => p.id === 'current')).toBe(false);
  });

  test('ranks products from the same sub-category first', () => {
    const current = makeProduct({ id: 'current', sub_category_id: 'sub-1' });
    const all = [
      current,
      makeProduct({ id: 'no-sub', sub_category_id: 'sub-9' }),
      makeProduct({ id: 'same-sub', sub_category_id: 'sub-1' })
    ];

    const related = getRelatedProducts(current, all);

    expect(related[0].id).toBe('same-sub');
  });

  test('ranks in-stock products above out-of-stock ones', () => {
    const current = makeProduct({ id: 'current' });
    const all = [
      current,
      makeProduct({ id: 'sold-out', stock: 0 }),
      makeProduct({ id: 'available', stock: 3 })
    ];

    const related = getRelatedProducts(current, all);

    expect(related[0].id).toBe('available');
  });

  test('caps the result at the requested limit', () => {
    const current = makeProduct({ id: 'current' });
    const all = [
      current,
      ...Array.from({ length: 10 }, (_, i) => makeProduct({ id: `p${i}` }))
    ];

    expect(getRelatedProducts(current, all)).toHaveLength(4);
    expect(getRelatedProducts(current, all, 2)).toHaveLength(2);
  });

  test('returns an empty array when no product shares a category', () => {
    const current = makeProduct({ id: 'current', category: 'ساعات' });
    const all = [current, makeProduct({ id: 'other', category: 'عطور' })];

    expect(getRelatedProducts(current, all)).toEqual([]);
  });

  test('does not mutate the input list', () => {
    const current = makeProduct({ id: 'current' });
    const all = [
      current,
      makeProduct({ id: 'sold-out', stock: 0 }),
      makeProduct({ id: 'available', stock: 3 })
    ];
    const originalOrder = all.map(p => p.id);

    getRelatedProducts(current, all);

    expect(all.map(p => p.id)).toEqual(originalOrder);
  });
});
