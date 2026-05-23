
import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { Product } from '../types/index';
import { Order, Customer, Review, HeroSlide } from '../types/admin';
import { PRODUCTS } from '../mockData/initialData';
import { MOCK_ORDERS, MOCK_CUSTOMERS, MOCK_REVIEWS } from '../mockData/adminData';
import { unpoison } from '../utils/unpoison';
import { DEFAULT_EXCHANGE_RATE } from '../utils/pricingEngine';
import { exchangeRateService } from '../services/exchangeRateService';

// Custom storage using IndexedDB via idb-keyval
const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      // Try to get from IndexedDB first
      const value = await get(name);
      if (value) return value;

      // Fallback to localStorage for migration
      const localValue = localStorage.getItem(name);
      if (localValue) {
        // Migrate to IndexedDB
        await set(name, localValue);
        // We keep it in localStorage for now to be safe, or we could remove it
        return localValue;
      }
    } catch (error) {
      console.error(`Error reading ${name} from IndexedDB:`, error);
    }
    return null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await set(name, value);
    } catch (error) {
      console.error(`Error writing ${name} to IndexedDB:`, error);
      // If IndexedDB fails (rare), we don't want to crash the whole app, but we should log it
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await del(name);
    } catch (error) {
      console.error(`Error removing ${name} from IndexedDB:`, error);
    }
  },
};

interface SharedStore {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  reviews: Review[];
  heroSlides: HeroSlide[];
  setProducts: (products: Product[]) => void;
  setOrders: (orders: Order[]) => void;
  setCustomers: (customers: Customer[]) => void;
  setReviews: (reviews: Review[]) => void;
  setHeroSlides: (slides: HeroSlide[]) => void;
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  addReview: (review: Review) => void;
  updateReview: (id: string, updates: Partial<Review>) => void;
  deleteReview: (id: string) => void;
  addHeroSlide: (slide: HeroSlide) => void;
  updateHeroSlide: (id: string, updates: Partial<HeroSlide>) => void;
  deleteHeroSlide: (id: string) => void;
  // ── سعر الصرف ───────────────────────────────────────────────
  /** سعر صرف الدولار الحالي (ليرة سورية / $) */
  exchangeRate: number;
  /** تاريخ آخر تحديث لسعر الصرف */
  exchangeRateUpdatedAt: string | null;
  /** تحديث سعر الصرف في الذاكرة */
  setExchangeRate: (rate: number, updatedAt?: string) => void;
  /** تحميل سعر الصرف من Supabase عند بدء التطبيق */
  initExchangeRate: () => Promise<void>;
}

export const useSharedStore = create<SharedStore>()(
  persist(
    (set, get) => ({
      products: PRODUCTS.map(p => unpoison(p)),
      orders: MOCK_ORDERS,
      customers: MOCK_CUSTOMERS,
      reviews: MOCK_REVIEWS,
      heroSlides: [
        {
          id: '1',
          title: 'يسلمو',
          subtitle: 'ارتقِ بهداياك مع مجموعاتنا الفاخرة',
          image: 'https://images.unsplash.com/photo-1607344645866-009c320b63e0?q=80&w=2000',
          link: '/shop',
          bgColor: 'bg-[#CEE9FB]',
          textPosition: 'center-right'
        },
        {
          id: '2',
          title: 'حصري',
          subtitle: 'تشكيلة جديدة من الهدايا الخشبية',
          image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=2000',
          link: '/category/wooden-gifts',
          bgColor: 'bg-[#FBE4E4]',
          textPosition: 'center-right'
        }
      ],
      setProducts: (products) => set({ products: products.map(p => unpoison(p)) }),
      setOrders: (orders) => set({ orders }),
      setCustomers: (customers) => set({ customers }),
      setReviews: (reviews) => set({ reviews }),
      setHeroSlides: (heroSlides) => set({ heroSlides }),
      addProduct: (product) => set({ products: [unpoison(product), ...get().products] }),
      updateProduct: (id, updates) => set({
        products: get().products.map(p => p.id === id ? { ...p, ...unpoison(updates) } : p)
      }),
      deleteProduct: (id) => set({
        products: get().products.filter(p => p.id !== id)
      }),
      addOrder: (order) => set({ orders: [order, ...get().orders] }),
      updateOrder: (id, updates) => set({
        orders: get().orders.map(o => o.id === id ? { ...o, ...updates } : o)
      }),
      deleteOrder: (id) => set({
        orders: get().orders.filter(o => o.id !== id)
      }),
      addCustomer: (customer) => set({ customers: [customer, ...get().customers] }),
      updateCustomer: (id, updates) => set({
        customers: get().customers.map(c => c.id === id ? { ...c, ...updates } : c)
      }),
      deleteCustomer: (id) => set({
        customers: get().customers.filter(c => c.id !== id)
      }),
      addReview: (review) => set({ reviews: [review, ...get().reviews] }),
      updateReview: (id, updates) => set({
        reviews: get().reviews.map(r => r.id === id ? { ...r, ...updates } : r)
      }),
      deleteReview: (id) => set({
        reviews: get().reviews.filter(r => r.id !== id)
      }),
      addHeroSlide: (slide) => set({ heroSlides: [...get().heroSlides, slide] }),
      updateHeroSlide: (id, updates) => set({
        heroSlides: get().heroSlides.map(s => s.id === id ? { ...s, ...updates } : s)
      }),
      deleteHeroSlide: (id) => set({
        heroSlides: get().heroSlides.filter(s => s.id !== id)
      }),
      // ── سعر الصرف ──────────────────────────────────────────────
      exchangeRate: DEFAULT_EXCHANGE_RATE,
      exchangeRateUpdatedAt: null,
      setExchangeRate: (rate, updatedAt) => set({
        exchangeRate: rate,
        exchangeRateUpdatedAt: updatedAt ?? new Date().toISOString(),
      }),
      initExchangeRate: async () => {
        try {
          const rate = await exchangeRateService.getRate();
          set({ exchangeRate: rate, exchangeRateUpdatedAt: new Date().toISOString() });
        } catch (e) {
          console.warn('initExchangeRate: فشل جلب سعر الصرف، سيُستخدم القيمة الافتراضية', e);
        }
      },
    }),
    {
      name: 'shared-store',
      storage: createJSONStorage(() => idbStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Unpoison all products when rehydrating from storage
          state.products = (state.products || []).map(p => unpoison(p));
        }
      },
    }
  )
);
