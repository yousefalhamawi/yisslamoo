/** يبقي عبارة البحث في الرابط قابلة للمشاركة والعودة إليها لاحقاً. */
export const getProductSearchPath = (term: string): string | null => {
  const query = term.trim();
  return query ? `/shop?search=${encodeURIComponent(query)}` : null;
};
