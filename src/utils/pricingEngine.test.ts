import { describe, expect, it } from 'vitest';
import { getProductDisplayPrices } from './pricingEngine';

describe('getProductDisplayPrices', () => {
  it('calculates the same current and previous SYP prices for an auto-priced product', () => {
    expect(getProductDisplayPrices({
      price: 1_000,
      oldPrice: 1_800_000,
      price_usd: 10,
      pricing_mode: 'auto',
    }, 120_000)).toEqual({
      price: 1_200_000,
      oldPrice: 1_800_000,
    });
  });
});
