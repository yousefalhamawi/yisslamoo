import type { Product } from '../types';

type ProductAvailabilityFields = Pick<Product, 'stock' | 'is_made_to_order'>;

export const isMadeToOrder = (product: ProductAvailabilityFields): boolean =>
  product.is_made_to_order === true;

export const isProductAvailableForStore = (product: ProductAvailabilityFields): boolean =>
  isMadeToOrder(product) || (product.stock ?? 0) > 0;

export const isProductOutOfStock = (product: ProductAvailabilityFields): boolean =>
  !isProductAvailableForStore(product);
