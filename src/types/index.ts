
import React from 'react';

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
