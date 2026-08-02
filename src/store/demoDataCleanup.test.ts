import { describe, expect, it } from 'vitest';
import { removeLegacyDemoData } from './demoDataCleanup';

describe('removeLegacyDemoData', () => {
  it('removes only the known seeded demo records from browser storage', () => {
    const cleaned = removeLegacyDemoData({
      products: [
        { id: '1', slug: 'royal-flower-box' },
        { id: 'real-product', slug: 'real-product' },
      ],
      orders: [{ id: 'ORD-1001' }, { id: 'ORD-real' }],
      customers: [{ id: 'CUST-001' }, { id: 'customer-real' }],
      reviews: [{ id: 'REV-001' }, { id: 'review-real' }],
      heroSlides: [
        { id: '1', title: 'يسلمو' },
        { id: 'slide-real', title: 'عرض حقيقي' },
      ],
    });

    expect(cleaned.products).toEqual([{ id: 'real-product', slug: 'real-product' }]);
    expect(cleaned.orders).toEqual([{ id: 'ORD-real' }]);
    expect(cleaned.customers).toEqual([{ id: 'customer-real' }]);
    expect(cleaned.reviews).toEqual([{ id: 'review-real' }]);
    expect(cleaned.heroSlides).toEqual([{ id: 'slide-real', title: 'عرض حقيقي' }]);
  });

  it('preserves unrecognised data without changing it', () => {
    const persistedState = {
      products: [{ id: '1', slug: 'a-real-product' }],
      orders: [{ id: 'ORD-1004' }],
      customers: [{ id: 'CUST-003' }],
      reviews: [{ id: 'REV-002' }],
      heroSlides: [{ id: '1', title: 'عرض حقيقي' }],
    };

    expect(removeLegacyDemoData(persistedState)).toEqual(persistedState);
  });
});
