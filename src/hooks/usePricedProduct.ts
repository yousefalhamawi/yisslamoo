import { useMemo } from 'react';
import { Product } from '../types/index';
import { useSharedStore } from '../store/useSharedStore';
import {
  computeDisplayPrice,
  computeOldDisplayPrice,
  formatSYP,
  getAdminPriceInfo,
} from '../utils/pricingEngine';

/**
 * Hook مساعد يحسب سعر عرض منتج واحد بناءً على سعر الصرف الحالي.
 * مُحسَّن باستخدام useMemo — يُعيد الحساب فقط عند تغيير المنتج أو سعر الصرف.
 */
export const usePricedProduct = (product: Product) => {
  const exchangeRate = useSharedStore((s) => s.exchangeRate);

  return useMemo(() => {
    const displayPrice = computeDisplayPrice(product, exchangeRate);
    const displayOldPrice = computeOldDisplayPrice(product, exchangeRate);
    const adminInfo = getAdminPriceInfo(product, exchangeRate);

    return {
      /** السعر النهائي للعرض بالليرة السورية */
      displayPrice,
      /** السعر القديم (المشطوب) بالليرة السورية */
      displayOldPrice,
      /** السعر بالليرة منسقاً (مثال: ٥٥٠ ل.س) */
      formattedPrice: formatSYP(displayPrice),
      /** السعر القديم منسقاً */
      formattedOldPrice: displayOldPrice ? formatSYP(displayOldPrice) : undefined,
      /** وضع التسعير الحالي للمنتج */
      pricingMode: (product.pricing_mode ?? 'manual') as 'auto' | 'manual',
      /** السعر بالدولار (للأدمن فقط) */
      priceUSD: product.price_usd,
      /** معلومات تفصيلية للأدمن */
      adminInfo,
      /** سعر الصرف المُستخدم في الحساب */
      exchangeRate,
    };
  }, [product, exchangeRate]);
};

/**
 * Hook خفيف — يُعيد فقط السعر النهائي (بدون حسابات إضافية)
 * مناسب للمكونات التي تحتاج السعر فقط (مثل Cart)
 */
export const useProductDisplayPrice = (
  product: Pick<Product, 'price' | 'price_usd' | 'price_syp_manual' | 'pricing_mode'>
): number => {
  const exchangeRate = useSharedStore((s) => s.exchangeRate);
  return useMemo(
    () => computeDisplayPrice(product, exchangeRate),
    [product, exchangeRate]
  );
};
