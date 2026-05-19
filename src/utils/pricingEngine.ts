import { Product } from '../types/index';

/**
 * محرك التسعير الديناميكي — يسلمو للهدايا
 *
 * Pure Functions — لا استدعاءات خارجية، لا side effects.
 * يُستخدم في كل مكان يحتاج عرض سعر منتج للعميل أو للأدمن.
 */

// ================================================================
// الثوابت
// ================================================================
export const DEFAULT_EXCHANGE_RATE = 110; // ل.س مقابل كل $1
export const FALLBACK_PRICE = 0;

// ================================================================
// دوال الحساب الأساسية
// ================================================================

/**
 * احتساب السعر النهائي للعرض بالليرة السورية
 *
 * - وضع تلقائي: price_usd × exchangeRate
 * - وضع يدوي:   price_syp_manual مباشرة
 * - Fallback:   الحقل القديم price (للتوافق مع المنتجات القديمة)
 */
export function computeDisplayPrice(
  product: Pick<Product, 'price' | 'price_usd' | 'price_syp_manual' | 'pricing_mode'>,
  exchangeRate: number
): number {
  if (!exchangeRate || exchangeRate <= 0) {
    exchangeRate = DEFAULT_EXCHANGE_RATE;
  }

  if (product.pricing_mode === 'auto' && product.price_usd && product.price_usd > 0) {
    return Math.round(product.price_usd * exchangeRate);
  }

  // وضع يدوي — أو أي حالة أخرى
  if (product.price_syp_manual && product.price_syp_manual > 0) {
    return product.price_syp_manual;
  }

  // Fallback للحقل القديم (المنتجات التي لم تُهاجَر بعد)
  return product.price ?? FALLBACK_PRICE;
}

/**
 * احتساب السعر القديم (المشطوب) للعرض بالليرة السورية
 */
export function computeOldDisplayPrice(
  product: Pick<Product, 'oldPrice' | 'price_usd' | 'pricing_mode'>,
  exchangeRate: number
): number | undefined {
  if (!exchangeRate || exchangeRate <= 0) {
    exchangeRate = DEFAULT_EXCHANGE_RATE;
  }

  if (!product.oldPrice || product.oldPrice <= 0) return undefined;

  // إذا كان المنتج في وضع تلقائي، السعر القديم يُحسب كنسبة من السعر الحالي
  // (السعر القديم المخزون يُعامل كـ USD في الوضع التلقائي أيضاً)
  if (product.pricing_mode === 'auto') {
    return Math.round(product.oldPrice * exchangeRate);
  }

  return product.oldPrice;
}

/**
 * حساب السعر بالدولار من سعر بالليرة (للعرض المعلوماتي فقط)
 */
export function convertSYPtoUSD(priceInSYP: number, exchangeRate: number): number {
  if (!exchangeRate || exchangeRate <= 0) return 0;
  return Math.round((priceInSYP / exchangeRate) * 100) / 100;
}

/**
 * حساب السعر بالليرة من سعر بالدولار
 */
export function convertUSDtoSYP(priceInUSD: number, exchangeRate: number): number {
  if (!exchangeRate || exchangeRate <= 0) return 0;
  return Math.round(priceInUSD * exchangeRate);
}

// ================================================================
// دوال التنسيق
// ================================================================

/**
 * تنسيق السعر بالليرة السورية للعرض للعميل
 */
export function formatSYP(amount: number): string {
  return `${amount.toLocaleString('ar-SY')} ل.س`;
}

/**
 * تنسيق السعر بالدولار للعرض للأدمن
 */
export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ================================================================
// دوال التحقق
// ================================================================

/**
 * التحقق من صحة سعر الصرف
 */
export function isValidExchangeRate(rate: number): boolean {
  return typeof rate === 'number' && rate > 0 && rate < 10_000_000 && isFinite(rate);
}

/**
 * التحقق من صحة سعر المنتج بالدولار
 */
export function isValidUSDPrice(price: number): boolean {
  return typeof price === 'number' && price > 0 && isFinite(price);
}

/**
 * معاينة سعر لوحة التحكم — يُعيد معلومات مفصلة للأدمن
 */
export function getAdminPriceInfo(
  product: Pick<Product, 'price' | 'price_usd' | 'price_syp_manual' | 'pricing_mode' | 'oldPrice'>,
  exchangeRate: number
): {
  displayPrice: number;
  displayOldPrice: number | undefined;
  priceUSD: number | undefined;
  pricingMode: 'auto' | 'manual';
  label: string;
} {
  const displayPrice = computeDisplayPrice(product, exchangeRate);
  const displayOldPrice = computeOldDisplayPrice(product, exchangeRate);
  const pricingMode = (product.pricing_mode as 'auto' | 'manual') ?? 'manual';

  return {
    displayPrice,
    displayOldPrice,
    priceUSD: product.price_usd,
    pricingMode,
    label: pricingMode === 'auto'
      ? `تلقائي ($${product.price_usd} × ${exchangeRate} = ${formatSYP(displayPrice)})`
      : `يدوي (${formatSYP(displayPrice)})`,
  };
}
