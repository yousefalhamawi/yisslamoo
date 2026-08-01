
import {
  LayoutDashboard,
  Package,
  ListTree,
  ShoppingCart,
  Users,
  Ticket,
  Warehouse,
  Truck,
  CreditCard,
  BarChart3,
  Star,
  Settings,
  UserCircle,
  Bell,
  Image as ImageIcon
} from 'lucide-react';

export type AdminPageState =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'orders'
  | 'customers'
  | 'coupons'
  | 'inventory'
  | 'analytics'
  | 'reviews'
  | 'collections'
  | 'settings'
  | 'pricing'
  | 'profile'
  | 'staff'
  | 'slider';

export interface AdminNavItem {
  id: AdminPageState;
  label: string;
  icon: any;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { id: 'products', label: 'المنتجات', icon: Package },
  { id: 'categories', label: 'التصنيفات', icon: ListTree },
  { id: 'orders', label: 'الطلبات', icon: ShoppingCart },
  { id: 'customers', label: 'العملاء', icon: Users },
  { id: 'coupons', label: 'الكوبونات', icon: Ticket },
  { id: 'inventory', label: 'المخزون', icon: Warehouse },
  { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
  { id: 'collections', label: 'المواسم', icon: ListTree },
  { id: 'reviews', label: 'التقييمات', icon: Star },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
  { id: 'profile', label: 'الملف الشخصي', icon: UserCircle },
  { id: 'staff', label: 'إدارة الفريق', icon: Users },
  { id: 'slider', label: 'السلايدر', icon: ImageIcon },
];

export interface OrderItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  selectedColor?: string;
  selectedEngraving?: string;
  selectedGiftWrapping?: string;
  selectedGiftMessage?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail?: string;
  phone: string;
  address: string;
  total: number;
  status: 'new' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  paymentMethod: string;
  items: OrderItem[];
  isGift?: boolean;
  giftWrapping?: string;
  giftMessage?: string;
  recipientNames?: string[] | null;
  couponCode?: string;
  discount?: number;
  // ── بيانات وقت الشراء (ثبات الطلبات القديمة) ───────────────────
  /** سعر صرف الدولار لحظة إنشاء الطلب */
  exchange_rate_at_purchase?: number;
  /** السعر الإجمالي بالليرة وقت الطلب (محفوظ لأغراض التدقيق) */
  final_price_syp?: number;
}

export interface Address {
  id: string;
  customer_id: string;
  full_name: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  building: string;
  notes?: string;
  is_default: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  addresses?: Address[];
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  joinDate?: string;
  status: 'active' | 'blocked';
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: string;
  minOrderAmount: number;
  status: 'active' | 'expired' | 'disabled';
}

export interface Review {
  id: string;
  productId?: string;
  customer: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  productsCount?: number;
  status: 'active' | 'inactive';
  image: string;
  parent_id?: string | null;
  /** اسم أيقونة lucide-react المختارة من لوحة التحكم — فارغ يعني استنتاجها من الاسم */
  icon?: string | null;
}

export interface Collection {
  id: string;
  name: string;
  image: string;
  description: string;
  products: string[];
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  bgColor: string;
  titleColor?: string;
  subtitleColor?: string;
  buttonText?: string;
  textPosition?: string;
  mobileTextPosition?: string;
}
