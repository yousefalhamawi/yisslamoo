
import React from 'react';

/** وضع التسعير: تلقائي (USD × سعر الصرف) أو يدوي (سعر ثابت بالليرة) */
export type PricingMode = 'auto' | 'manual';

import { Address } from './admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  addresses?: Address[];
  avatar?: string;
}

export interface Product {
  id: string;
  name: string;
  /** السعر بالليرة السورية — يُستخدم للعرض وللتوافق مع الكود القديم */
  price: number;
  oldPrice?: number;
  image: string;
  images?: string[];
  category: string;
  categories?: string[];
  sub_category_id?: string | null;
  sub_category_ids?: string[];
  description: string;
  longDescription?: string;
  features: { name: string; value: string }[];
  stock: number;
  isTrending?: boolean;
  isNew?: boolean;
  discountPrice?: number;
  canEngrave?: boolean;
  slug: string;
  sku?: string;
  specifications?: {
    material?: string;
    weight?: string;
    dimensions?: string;
  };
  rating?: number;
  reviews?: number;
  availableColors?: string[];
  popularityScore?: number;
  badge_text?: string;
  selectedEngraving?: string;
  selectedColor?: string;
  selectedGiftWrapping?: string;
  selectedGiftMessage?: string;
  cartId?: string;
  quantity?: number;
  // ── حقول نظام التسعير الديناميكي ──────────────────────────────
  /** السعر الداخلي بالدولار الأمريكي (يدخله الأدمن متضمناً الربح) */
  price_usd?: number;
  /** السعر اليدوي الثابت بالليرة السورية (يُستخدم في وضع manual) */
  price_syp_manual?: number;
  /** وضع التسعير: 'auto' = USD×سعر الصرف | 'manual' = سعر يدوي ثابت */
  pricing_mode?: PricingMode;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  image: string;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}
