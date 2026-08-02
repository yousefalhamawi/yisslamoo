import type { HomeProductSection, Product } from '../types';

export const HOME_PRODUCT_SECTION_OPTIONS: ReadonlyArray<{
  id: HomeProductSection;
  label: string;
}> = [
  { id: 'offers', label: 'عروض اليوم' },
  { id: 'recommended', label: 'قد تنال إعجابك' },
  { id: 'new', label: 'المنتجات الجديدة' },
  { id: 'trending', label: 'الأكثر رواجاً' },
  { id: 'bestsellers', label: 'الأكثر مبيعاً' },
  { id: 'all', label: 'عرض الكل' },
];

export const getProductsForHomeSection = (
  products: Product[],
  section: HomeProductSection,
): Product[] => section === 'all'
  ? products
  : products.filter((product) => product.home_section === section);
