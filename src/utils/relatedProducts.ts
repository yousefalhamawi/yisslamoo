import { Product } from '../types/index';

export const RELATED_PRODUCTS_LIMIT = 4;

/** يرجّع فئات المنتج مع دعم الحقل القديم `category` والجديد `categories` */
export const getProductCategories = (product: Product): string[] => {
  const categories =
    product.categories && product.categories.length > 0
      ? product.categories
      : [product.category];

  return categories.filter(Boolean);
};

/**
 * يختار المنتجات المقترحة من نفس فئة المنتج الحالي.
 * الأولوية لما يشترك بنفس الفئة الفرعية، ثم لما هو متوفر في المخزون.
 */
export const getRelatedProducts = (
  product: Product,
  allProducts: Product[],
  limit: number = RELATED_PRODUCTS_LIMIT
): Product[] => {
  if (!product || !Array.isArray(allProducts)) return [];

  const currentCategories = getProductCategories(product);
  const currentSubCategoryId = product.sub_category_id;

  const sameCategory = allProducts.filter(candidate => {
    if (!candidate || candidate.id === product.id) return false;
    return getProductCategories(candidate).some(category =>
      currentCategories.includes(category)
    );
  });

  const relevanceScore = (candidate: Product): number => {
    const matchesSubCategory =
      !!currentSubCategoryId && candidate.sub_category_id === currentSubCategoryId;

    return (matchesSubCategory ? 2 : 0) + (candidate.stock > 0 ? 1 : 0);
  };

  return [...sameCategory]
    .sort((a, b) => relevanceScore(b) - relevanceScore(a))
    .slice(0, limit);
};
