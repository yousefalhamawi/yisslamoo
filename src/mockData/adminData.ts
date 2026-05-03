
import { Order, Customer, Coupon, Review } from '../types/admin';

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-1001',
    customerName: 'أحمد محمد',
    customerEmail: 'ahmed@example.com',
    phone: '0933123456',
    address: 'دمشق، المزة، شارع الجلاء',
    total: 450000,
    status: 'new',
    date: '2026-03-11T10:30:00Z',
    paymentMethod: 'الدفع عند الاستلام',
    isGift: true,
    giftWrapping: 'تغليف يسلمو الملكي الفاخر',
    giftMessage: 'كل عام وأنت بخير يا أغلى الناس',
    items: [{ name: 'صندوق الورود الأبدية', quantity: 1, price: 450000 }]
  },
  {
    id: 'ORD-1002',
    customerName: 'سارة العلي',
    customerEmail: 'sara@example.com',
    phone: '0944987654',
    address: 'حلب، الشهباء، حي الفرقان',
    total: 1200000,
    status: 'processing',
    date: '2026-03-10T15:45:00Z',
    paymentMethod: 'بطاقة ائتمان',
    items: [{ name: 'صندوق أريج العود', quantity: 1, price: 1200000 }]
  },
  {
    id: 'ORD-1003',
    customerName: 'خالد العتيبي',
    customerEmail: 'khaled@example.com',
    phone: '0955112233',
    address: 'الرياض، حي النخيل',
    total: 680000,
    status: 'shipped',
    date: '2026-03-09T09:20:00Z',
    paymentMethod: 'PayPal',
    items: [{ name: 'عطر سلطان المركز', quantity: 1, price: 680000 }]
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-001',
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '0933123456',
    password: 'Password123',
    ordersCount: 5,
    totalSpent: 2500000,
    lastOrderDate: '2026-03-11',
    joinDate: '2026-01-15T10:00:00Z',
    status: 'active'
  },
  {
    id: 'CUST-002',
    name: 'سارة العلي',
    email: 'sara@example.com',
    phone: '0944987654',
    password: 'Password123',
    ordersCount: 2,
    totalSpent: 1800000,
    lastOrderDate: '2026-03-10',
    joinDate: '2026-02-20T14:30:00Z',
    status: 'active'
  }
];

export const MOCK_COUPONS: Coupon[] = [
  {
    id: 'CPN-001',
    code: 'WELCOME25',
    type: 'percentage',
    value: 25,
    usageLimit: 100,
    usedCount: 45,
    expiryDate: '2026-12-31',
    minOrderAmount: 500000,
    status: 'active'
  }
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'REV-001',
    customer: 'ليلى حسن',
    productName: 'صندوق الورود الأبدية',
    rating: 5,
    comment: 'جودة رائعة وتغليف مذهل، شكراً لكم!',
    date: '2026-03-08',
    status: 'approved'
  }
];

export const SALES_DATA = [
  { name: 'السبت', sales: 4000000 },
  { name: 'الأحد', sales: 3000000 },
  { name: 'الاثنين', sales: 2000000 },
  { name: 'الثلاثاء', sales: 2780000 },
  { name: 'الأربعاء', sales: 1890000 },
  { name: 'الخميس', sales: 2390000 },
  { name: 'الجمعة', sales: 3490000 },
];
