import { describe, expect, it } from 'vitest';
import type { Product } from '../types';
import { getProductsForHomeSection } from './homeProductSections';

const makeProduct = (id: string, home_section?: Product['home_section']): Product => ({
  id,
  name: id,
  price: 1000,
  image: '',
  category: 'الهدايا',
  description: '',
  features: [],
  stock: 1,
  slug: id,
  home_section,
});

describe('getProductsForHomeSection', () => {
  const products = [
    makeProduct('offer', 'offers'),
    makeProduct('new', 'new'),
    makeProduct('all-only', 'all'),
  ];

  it('returns only the products assigned to the selected home section', () => {
    expect(getProductsForHomeSection(products, 'offers').map((product) => product.id)).toEqual(['offer']);
  });

  it('shows every product in the all-products tab', () => {
    expect(getProductsForHomeSection(products, 'all').map((product) => product.id)).toEqual(['offer', 'new', 'all-only']);
  });
});
