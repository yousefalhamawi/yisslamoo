type IdentifiableRecord = {
  id?: string;
  slug?: string;
  title?: string;
};

type LegacyPersistedState = {
  products?: IdentifiableRecord[];
  orders?: IdentifiableRecord[];
  customers?: IdentifiableRecord[];
  reviews?: IdentifiableRecord[];
  heroSlides?: IdentifiableRecord[];
};

const isDemoProduct = (product: IdentifiableRecord): boolean =>
  (product.id === '1' && product.slug === 'royal-flower-box') ||
  (product.id === '2' && product.slug === 'leather-office-set');

const isDemoHeroSlide = (slide: IdentifiableRecord): boolean =>
  (slide.id === '1' && slide.title === 'يسلمو') ||
  (slide.id === '2' && slide.title === 'حصري');

const demoOrderIds = new Set(['ORD-1001', 'ORD-1002', 'ORD-1003']);
const demoCustomerIds = new Set(['CUST-001', 'CUST-002']);
const demoReviewIds = new Set(['REV-001']);

/**
 * Removes the exact legacy fixtures that were seeded in browser storage.
 * This never calls Supabase and keeps every record that is not one of those fixtures.
 */
export const removeLegacyDemoData = <T extends LegacyPersistedState>(state: T): T => ({
  ...state,
  products: state.products?.filter((product) => !isDemoProduct(product)),
  orders: state.orders?.filter((order) => !demoOrderIds.has(order.id ?? '')),
  customers: state.customers?.filter((customer) => !demoCustomerIds.has(customer.id ?? '')),
  reviews: state.reviews?.filter((review) => !demoReviewIds.has(review.id ?? '')),
  heroSlides: state.heroSlides?.filter((slide) => !isDemoHeroSlide(slide)),
});
