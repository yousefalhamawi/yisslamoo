
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useNotifications } from './contexts/NotificationContext';
import { validateEmail } from './utils/validation';
import { Toaster } from './utils/toast';
import { Routes, Route, useNavigate, useParams, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import Navbar from './components/public/Navbar';
import TopBar from './components/public/TopBar';
import Hero from './components/public/Hero';
import CategoryCircles from './components/public/CategoryCircles';
import ProductCard from './components/public/ProductCard';
import ProductDetails from './components/public/ProductDetails';
import ProductPage from './components/public/ProductPage';
import WishlistPage from './components/public/WishlistPage';
import CollectionsPage from './components/public/CollectionsPage';
import CheckoutPage from './components/public/CheckoutPage';
import CartDrawer from './components/public/CartDrawer';
import CategoriesSection from './components/public/CategoriesSection';
import WhyChooseUs from './components/public/WhyChooseUs';
import ProductTabs from './components/public/ProductTabs';
import LoginModal from './components/public/LoginModal';
import QuickViewModal from './components/public/QuickViewModal';
import Preloader from './components/public/Preloader';
import CustomerOrders from './components/public/CustomerOrders';
import CustomerSettings from './components/public/CustomerSettings';
import AdminDashboard from './pages/admin/AdminDashboard';
import CollectionDetailsPage from './components/public/CollectionDetailsPage';
import OurStoryPage from './components/public/OurStoryPage';
import PoliciesPage from './components/public/PoliciesPage';
import { Product, User } from './types/index';
import { SOCIAL_LINKS } from './constants/socialLinks';
import {
  IconFacebook,
  IconInstagram,
  IconTiktok,
  IconX,
  IconThreads,
  IconTelegram,
  IconPinterest,
  IconWhatsapp
} from './components/common/SocialIcons';

/** روابط التواصل المعروضة في الفوتر — كل واحدة بأيقونتها */
const FOOTER_SOCIAL_LINKS = [
  { href: SOCIAL_LINKS.facebook, label: 'فيسبوك', Icon: IconFacebook },
  { href: SOCIAL_LINKS.instagram, label: 'إنستغرام', Icon: IconInstagram },
  { href: SOCIAL_LINKS.tiktok, label: 'تيكتوك', Icon: IconTiktok },
  { href: SOCIAL_LINKS.x, label: 'إكس', Icon: IconX },
  { href: SOCIAL_LINKS.threads, label: 'ثريدز', Icon: IconThreads },
  { href: SOCIAL_LINKS.telegram, label: 'تيليغرام', Icon: IconTelegram },
  { href: SOCIAL_LINKS.pinterest, label: 'بينتريست', Icon: IconPinterest },
  { href: SOCIAL_LINKS.whatsappChannel, label: 'قناة الواتساب', Icon: IconWhatsapp }
] as const;

type PageState = 'home' | 'shop' | 'details' | 'wishlist' | 'collections' | 'checkout' | 'admin' | 'orders' | 'settings';

import { checkSupabaseConfig } from './supabase';
import { useSharedStore } from './store/useSharedStore';
import { ArrowLeft } from 'lucide-react';
import { Order, Customer } from './types/admin';
import { orderService } from './services/orderService';
import { customerService } from './services/customerService';
import { productService } from './services/productService';
import { exchangeRateService } from './services/exchangeRateService';
import { toast as hotToast } from './utils/toast';
import { storage } from './services/storage';
import { getCustomerSessionAction } from './utils/customerSessionPolicy';
import { isProductAvailableForStore } from './utils/productAvailability';

import { categoryService } from './services/categoryService';
import { reviewService } from './services/reviewService';
import { Category } from './types/admin';

// Wrapper Components
const ShopWrapper: React.FC<{
  products: Product[],
  categories: Category[],
  addToCart: (p: Product) => void,
  navigateToProduct: (p: Product) => void,
  handleQuickView: (p: Product) => void,
  wishlist: string[],
  toggleWishlist: (id: string) => void
}> = ({ products, categories, addToCart, navigateToProduct, handleQuickView, wishlist, toggleWishlist }) => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const category = useMemo(() => {
    if (categorySlug === 'all') return 'الكل';
    const found = categories.find(c => c.slug === categorySlug);
    if (found) return found.name;
    return searchParams.get('category') || 'الكل';
  }, [categorySlug, categories, searchParams]);

  const searchTerm = searchParams.get('search') || '';

  return (
    <ProductPage
      // إعادة البناء عند تغيّر نص البحث لتحديث الحالة الابتدائية للحقل
      key={`shop-${searchTerm}`}
      products={products}
      categories={categories}
      onAddToCart={addToCart}
      onSelectProduct={navigateToProduct}
      onQuickView={handleQuickView}
      initialCategory={category}
      initialSearch={searchTerm}
      onCategoryChange={(cat) => {
        const found = categories.find(c => c.name === cat);
        if (found && found.slug !== 'all') {
          navigate(`/category/${found.slug}`);
        } else {
          navigate('/shop');
        }
      }}
      wishlist={wishlist}
      onToggleWishlist={toggleWishlist}
    />
  );
};

const ProductDetailsWrapper: React.FC<{
  products: Product[],
  /** القائمة المتوفرة فقط — للمنتجات المقترحة، حتى لا نقترح نافداً */
  availableProducts: Product[],
  loading: boolean,
  addToCart: (p: Product) => void,
  handleBuyNow: (p: Product) => void,
  wishlist: string[],
  toggleWishlist: (id: string) => void,
  navigateToProduct: (p: Product) => void
}> = ({ products, availableProducts, loading, addToCart, handleBuyNow, wishlist, toggleWishlist, navigateToProduct }) => {
  const { productSlug } = useParams<{ productSlug: string }>();
  const navigate = useNavigate();

  // Decode the slug to handle Arabic characters correctly
  let decodedSlug = '';
  try {
    decodedSlug = productSlug ? decodeURIComponent(productSlug) : '';
  } catch (e) {
    console.error('Error decoding product slug', e);
    return <Navigate to="/shop" replace />;
  }

  if (decodedSlug === 'undefined' || !decodedSlug) {
    return <Navigate to="/shop" replace />;
  }

  const product = products.find(p => p.slug === decodedSlug || p.slug === productSlug);

  if (!product) {
    if (loading) {
      return (
        <div className="min-h-screen bg-[#FCFBFA] flex items-center justify-center pt-32 pb-24" dir="rtl">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#2E1065] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-500 font-bold text-lg">جاري تحميل تفاصيل المنتج...</p>
          </div>
        </div>
      );
    }
    console.warn(`Product not found for slug: ${productSlug}`);
    return <Navigate to="/shop" />;
  }

  return (
    <ProductDetails
      product={product}
      allProducts={availableProducts}
      onAddToCart={addToCart}
      onBuyNow={handleBuyNow}
      onBack={() => navigate('/shop')}
      onSelectProduct={navigateToProduct}
      isWishlisted={wishlist.includes(product.id)}
      onToggleWishlist={() => toggleWishlist(product.id)}
    />
  );
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPreloader, setShowPreloader] = useState(true);
  const {
    products: storeProducts,
    setProducts: storeSetProducts,
    addOrder: storeAddOrder,
    updateOrder: storeUpdateOrder,
    deleteOrder: storeDeleteOrder,
    setOrders: storeSetOrders,
    addCustomer: storeAddCustomer,
    customers: storeCustomers,
    updateCustomer: storeUpdateCustomer,
    setCustomers: storeSetCustomers,
    deleteCustomer: storeDeleteCustomer,
    setReviews: storeSetReviews,
    initExchangeRate,
    exchangeRate,
  } = useSharedStore();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);

  // Real-time orders subscription
  useEffect(() => {
    if (!checkSupabaseConfig()) return;

    void initExchangeRate();

    // Initial fetch
    const fetchInitialData = async () => {
      if (!checkSupabaseConfig()) return;

      // 1. Fetch public data: products, categories, reviews
      try {
        const [productsResult, categoriesResult, reviewsResult, ordersResult, customersResult] = await Promise.allSettled([
          productService.getAll(),
          categoryService.getAll(),
          reviewService.getAll(),
          orderService.getAll(),
          customerService.getAll(),
        ]);

        if (productsResult.status === 'fulfilled') storeSetProducts(productsResult.value);
        else console.error('Failed to fetch products from Supabase:', productsResult.reason);

        if (categoriesResult.status === 'fulfilled') setCategories(categoriesResult.value);
        else console.error('Failed to fetch categories from Supabase:', categoriesResult.reason);

        if (reviewsResult.status === 'fulfilled') storeSetReviews(reviewsResult.value);
        else console.error('Failed to fetch reviews from Supabase:', reviewsResult.reason);

        if (ordersResult.status === 'fulfilled') storeSetOrders(ordersResult.value);
        else console.error('Failed to fetch orders from Supabase:', ordersResult.reason);

        if (customersResult.status === 'fulfilled') storeSetCustomers(customersResult.value);
        else console.error('Failed to fetch customers from Supabase:', customersResult.reason);
      } finally {
        setIsInitialDataLoaded(true);
      }
    };
    fetchInitialData();

    // Subscribe to changes
    const orderSubscription = orderService.subscribeToOrders((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;

      if (eventType === 'INSERT') {
        const exists = useSharedStore.getState().orders.some(o => o.id === newRecord.id);
        if (!exists) storeAddOrder(newRecord as Order);
      } else if (eventType === 'UPDATE') {
        storeUpdateOrder(newRecord.id, newRecord as Partial<Order>);
      } else if (eventType === 'DELETE') {
        storeDeleteOrder(oldRecord.id);
      }
    });

    const customerSubscription = customerService.subscribeToCustomers((payload) => {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      if (eventType === 'INSERT') {
        const exists = useSharedStore.getState().customers.some(c => c.id === newRecord.id);
        if (!exists) storeAddCustomer(newRecord as Customer);
      } else if (eventType === 'UPDATE') {
        storeUpdateCustomer(newRecord.id, newRecord as Partial<Customer>);
      } else if (eventType === 'DELETE') {
        storeDeleteCustomer(oldRecord.id);
      }
    });

    const exchangeRateSubscription = exchangeRateService.subscribeToRate((rate, updatedAt) => {
      useSharedStore.getState().setExchangeRate(rate, updatedAt);
    });

    return () => {
      orderSubscription.unsubscribe();
      customerSubscription.unsubscribe();
      exchangeRateSubscription.unsubscribe();
    };
  }, []);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    setIsCartOpen(false);
  }, [location.pathname, location.search]);

  const { user: authUser, signOut: authSignOut } = useAuth();
  const { addNotification } = useNotifications();
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (authUser) {
        let userData: User = {
          id: authUser.id,
          name: authUser.user_metadata?.full_name || 'عميل',
          email: authUser.email || ''
        };

        // Try to fetch full customer data from Supabase
        if (checkSupabaseConfig()) {
          try {
            const customer = await customerService.getById(authUser.id);
            if (customer) {
              userData = {
                ...userData,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
                address: customer.address
              };
            }
          } catch (err) {
            console.error('Failed to fetch customer data:', err);
          }
        }

        setUser(userData);
        storage.setItem('yaslamo_user', userData);
      } else {
        setUser(null);
        storage.removeItem('yaslamo_user');
      }
    };
    fetchUserData();
  }, [authUser]);

  // Session enforcement
  useEffect(() => {
    if (!user) return;
    if (location.pathname.startsWith('/admin')) return; // handled in AdminDashboard

    const enforceCustomerSession = async () => {
      const rememberMe = localStorage.getItem('yaslamo_remember_me') === 'true';
      const loginTimeStr = localStorage.getItem('yaslamo_login_time');
      const loginTime = loginTimeStr ? parseInt(loginTimeStr, 10) : null;
      const action = getCustomerSessionAction({
        rememberMe,
        loginTime: Number.isNaN(loginTime) ? null : loginTime,
        now: Date.now(),
      });

      if (action === 'sign_out') {
        handleLogout();
      } else {
        // sessionStorage is unique per tab. It cannot be used as a reason to
        // invalidate the shared Supabase session in another tab.
        sessionStorage.setItem('yaslamo_session_active', 'true');
      }
    };

    enforceCustomerSession();
  }, [user, location.pathname]);

  // Quick View State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  // Use products from store
  const products = storeProducts;

  // منتجات القوائم العامة: نخفي النافد فقط، ونُبقي منتجات «حسب الطلب» ظاهرة.
  // صفحة تفاصيل المنتج تستقبل القائمة الكاملة، فالوصول المباشر برابط
  // منتج نافد يبقى ممكناً مع عرض حالته، لكنه لا يظهر ضمن التصفّح.
  const availableProducts = useMemo(
    () => products.filter(isProductAvailableForStore),
    [products]
  );

  useEffect(() => {
    const loadSavedData = async () => {
      const savedWishlist = await storage.getItem<string[]>('yaslamo_wishlist', []);
      setWishlist(savedWishlist);
    };

    loadSavedData();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const handleCompleteOrder = async (checkoutData: any) => {
    if (cartItems.length === 0) return;

    const subtotal = cartItems.reduce((sum, item) => {
      const itemPrice = item.pricing_mode === 'auto' && item.price_usd
        ? Math.round(item.price_usd * exchangeRate)
        : (item.price_syp_manual ?? item.price);
      return sum + ((itemPrice || 0) * (item.quantity || 1));
    }, 0);
    const shipping = subtotal > 2000000 ? 0 : 50000;
    const discount = checkoutData.discount || 0;
    const total = subtotal + shipping - discount;

    const paymentMethodLabels: Record<string, string> = {
      card: 'بطاقة ائتمانية / مدى',
      apple: 'Apple Pay',
      tabby: 'Tabby (قسطها على 4)',
      cash: 'الدفع عند الاستلام'
    };

    const giftItem = cartItems.find(item => item.selectedGiftWrapping || item.selectedGiftMessage);
    const recipientNames = (Array.isArray(checkoutData.recipientNames) && checkoutData.recipientNames.length > 0)
      ? checkoutData.recipientNames
      : null;

    const newOrder: Order = {
      id: `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      customerName: checkoutData.fullName || user?.name || 'عميل زائر',
      customerEmail: checkoutData.email || user?.email || '',
      phone: checkoutData.phone || '05xxxxxxxx',
      address: `${checkoutData.city || ''}, ${checkoutData.district || ''}, ${checkoutData.street || ''}`.replace(/^, |, $/g, '').replace(/, , /g, ', ').trim(),
      total: total,
      status: 'new',
      date: new Date().toISOString(),
      paymentMethod: paymentMethodLabels[checkoutData.paymentMethod] || checkoutData.paymentMethod,
      isGift: !!giftItem || !!recipientNames,
      giftWrapping: giftItem?.selectedGiftWrapping,
      giftMessage: giftItem?.selectedGiftMessage,
      recipientNames: recipientNames,
      couponCode: checkoutData.couponCode,
      discount: discount,
      // ── Snapshot وقت الشراء ──
      exchange_rate_at_purchase: checkoutData.exchange_rate_at_purchase ?? exchangeRate,
      final_price_syp: checkoutData.final_price_syp ?? total,
      items: cartItems.map(item => ({
        id: item.cartId || `item-${Math.random().toString(36).substring(2, 9)}`,
        // معرّف المنتج الحقيقي — الخادم يجلب به السعر من جدول products
        productId: item.id,
        name: item.name,
        quantity: item.quantity || 1,
        price: item.price,
        image: item.image,
        selectedGiftWrapping: item.selectedGiftWrapping,
        selectedGiftMessage: item.selectedGiftMessage,
        selectedColor: item.selectedColor,
        selectedEngraving: item.selectedEngraving,
      }))
    };

    const loadingToast = hotToast.loading('جاري تأكيد طلبك...');

    try {
      // الخادم هو مصدر الحقيقة للمبالغ: نحفظ أولاً ثم نعرض ما أعاده.
      // بهذا لا يظهر طلب وهمي محلياً إذا رفض الخادم، ولا يُعرض إجمالي
      // محسوب في المتصفح قد يخالف الإجمالي المخزَّن فعلياً.
      const savedOrder = checkSupabaseConfig()
        ? await orderService.create(newOrder)
        : newOrder;

      storeAddOrder(savedOrder);

      // Update customer stats if logged in
      if (user) {
        const customer = storeCustomers.find(c => c.email === user.email);
        if (customer) {
          storeUpdateCustomer(customer.id, {
            ordersCount: customer.ordersCount + 1,
            totalSpent: customer.totalSpent + (savedOrder.total ?? total),
            lastOrderDate: new Date().toISOString().split('T')[0]
          });
        }
      }

      hotToast.success('تم تأكيد طلبك بنجاح!', { id: loadingToast });
      setCartItems([]);
      navigate('/');

      addNotification({
        title: 'تم إرسال طلبك بنجاح!',
        message: `شكراً لك ${user?.name || ''}، تم استلام طلبك برقم ${newOrder.id}. سنقوم بالتواصل معك قريباً.`,
        type: 'success',
        action: {
          label: 'عرض طلباتي',
          onClick: () => navigate('/orders')
        }
      });
    } catch (err: any) {
      console.error('Failed to save order:', err);
      const errorMsg = err.message || 'فشل في تأكيد الطلب، يرجى المحاولة مرة أخرى';
      hotToast.error(errorMsg, { id: loadingToast });
    }
  };

  const handleBuyNow = (product: Product) => {
    const cartProduct = {
      ...product,
      quantity: 1,
      cartId: `${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    };
    setCartItems([cartProduct]);
    navigate('/checkout');
  };

  const handleLogin = async (data: { id?: string; name: string; email: string; phone: string; isRegister: boolean }): Promise<boolean> => {
    const existingCustomer = storeCustomers.find(c => c.email?.toLowerCase() === data.email.toLowerCase());

    if (!existingCustomer) {
      const newCustomer: any = {
        name: data.name || 'عميل يسلمو',
        email: data.email,
        phone: data.phone || '',
        user_id: data.id,
        ordersCount: 0,
        totalSpent: 0,
        lastOrderDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      if (checkSupabaseConfig() && data.id) {
        try {
          const customer = await customerService.getOrCreateCustomer(data.id, newCustomer);
          storeAddCustomer(customer);
          const newUser = { id: customer.id, name: customer.name, email: customer.email };
          setUser(newUser);
          storage.setItem('yaslamo_user', newUser);
          hotToast.success(`مرحباً بك، ${customer.name}!`);
          return true;
        } catch (err) {
          console.error('Failed to save customer to Supabase:', err);
          const customerId = data.id || `CUST-${Date.now()}`;
          storeAddCustomer({ ...newCustomer, id: customerId });
          const newUser = { id: customerId, name: newCustomer.name, email: newCustomer.email };
          setUser(newUser);
          storage.setItem('yaslamo_user', newUser);
          hotToast.success(`مرحباً بك، ${newCustomer.name}!`);
          return true;
        }
      } else {
        const customerId = data.id || `CUST-${Date.now()}`;
        storeAddCustomer({ ...newCustomer, id: customerId });
        const newUser = { id: customerId, name: newCustomer.name, email: newCustomer.email };
        setUser(newUser);
        storage.setItem('yaslamo_user', newUser);
        hotToast.success(`مرحباً بك، ${newCustomer.name}!`);
        return true;
      }
    }

    const userToSet = existingCustomer;
    const newUser = { id: userToSet.id, name: userToSet.name, email: userToSet.email };
    setUser(newUser);
    storage.setItem('yaslamo_user', newUser);
    hotToast.success(`مرحباً بك، ${userToSet.name}!`);
    return true;
  };

  const handleLogout = async () => {
    try {
      await authSignOut();
      setUser(null);
      storage.removeItem('yaslamo_user');
      localStorage.removeItem('yaslamo_remember_me');
      localStorage.removeItem('yaslamo_login_time');
      sessionStorage.removeItem('yaslamo_session_active');
      addNotification({
        title: 'تم تسجيل الخروج',
        message: 'تم تسجيل خروجك بنجاح. نأمل رؤيتك قريباً!',
        type: 'info'
      });
    } catch (error) {
      console.error("Logout error:", error);
      hotToast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const toggleWishlist = (id: string) => {
    setWishlist(prev => {
      const isRemoving = prev.includes(id);
      const next = isRemoving ? prev.filter(i => i !== id) : [...prev, id];
      storage.setItem('yaslamo_wishlist', next);

      const product = products.find(p => p.id === id);
      if (product) {
        addNotification({
          title: isRemoving ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة للمفضلة',
          message: isRemoving ? `تمت إزالة ${product.name} من قائمة رغباتك` : `تمت إضافة ${product.name} إلى قائمة رغباتك`,
          type: 'info',
          action: {
            label: 'عرض المفضلة',
            onClick: () => navigate('/wishlist')
          }
        });
      }

      return next;
    });
  };

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existingItemIndex = prev.findIndex(item =>
        item.id === product.id &&
        item.selectedColor === product.selectedColor &&
        item.selectedEngraving === product.selectedEngraving &&
        item.selectedGiftWrapping === product.selectedGiftWrapping &&
        item.selectedGiftMessage === product.selectedGiftMessage
      );

      if (existingItemIndex > -1) {
        const newCart = [...prev];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: (newCart[existingItemIndex].quantity || 1) + 1
        };
        return newCart;
      }

      const cartProduct = {
        ...product,
        quantity: 1,
        cartId: `${product.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      };
      return [...prev, cartProduct];
    });

    addNotification({
      title: 'تمت الإضافة للسلة',
      message: `تمت إضافة ${product.name} إلى سلة التسوق الخاصة بك`,
      type: 'success',
      action: {
        label: 'عرض السلة',
        onClick: () => setIsCartOpen(true)
      }
    });
  };

  const updateCartQuantity = (cartId: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.cartId === cartId) {
          const newQuantity = (item.quantity || 1) + delta;
          return { ...item, quantity: Math.max(0, newQuantity) };
        }
        return item;
      }).filter(item => (item.quantity || 0) > 0);
    });
  };

  const removeFromCart = (cartId: string) => {
    setCartItems(prev => prev.filter(item => item.cartId !== cartId));
  };

  const navigateToProduct = (product: Product) => {
    navigate(`/product/${product.slug}`);
  };

  const navigateToShop = (categoryName: string = 'الكل') => {
    if (categoryName === 'الكل') {
      navigate('/shop');
      return;
    }
    const found = categories.find(c => c.name === categoryName);
    if (found) {
      navigate(`/category/${found.slug}`);
    } else {
      navigate('/shop');
    }
  };

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const renderContent = () => {
    return (
      <Routes>
        <Route path="/" element={
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Hero />
            <CategoryCircles />
            <ProductTabs
              products={availableProducts}
              onAddToCart={addToCart}
              onSelectProduct={navigateToProduct}
              onQuickView={handleQuickView}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
            />

            {!user && (
              <section className="py-16 md:py-20 relative overflow-hidden">
                <div className="container mx-auto px-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative bg-primaryDark rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-14 overflow-hidden shadow-[0_28px_65px_-24px_rgba(108,43,217,0.32)]"
                  >
                    <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/30 rounded-full blur-[100px]" />
                    <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
                      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity }} className="flex items-center justify-center mb-6 md:mb-8">
                        <img src="/img/logo/logo-light.png" alt="يسلمو" className="h-14 md:h-16 object-contain" />
                      </motion.div>
                      <h2 className="text-2xl md:text-4xl font-bold text-white mb-4 md:mb-5 tracking-tight leading-snug">انضم إلى <span className="text-accent">نخبة</span> يسلمو <br />واكتشف الفخامة بمعناها الحقيقي</h2>
                      <p className="text-white/70 text-sm md:text-base font-normal mb-8 md:mb-10 leading-7 md:leading-8 max-w-2xl">سجل دخولك الآن للحصول على أسعار حصرية، تتبع طلباتك، والوصول إلى مجموعات الهدايا المحدودة قبل الجميع.</p>
                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 w-full justify-center">
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setIsLoginModalOpen(true)} className="px-8 md:px-10 py-3.5 bg-accent text-primaryDark font-bold rounded-2xl text-base shadow-xl shadow-accent/15 hover:shadow-accent/30 transition-all">دخول سريع</motion.button>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setIsLoginModalOpen(true)} className="px-8 md:px-10 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl text-base hover:bg-white/20 transition-all">إنشاء حساب جديد</motion.button>
                      </div>
                      <div className="mt-8 md:mt-10 flex items-center gap-6 opacity-40">
                        <div className="flex flex-col items-center"><span className="text-lg font-bold text-white">+١٠ك</span><span className="text-[8px] font-bold text-accent uppercase tracking-widest">عضو متميز</span></div>
                        <div className="w-px h-8 bg-white/20" /><div className="flex flex-col items-center"><span className="text-lg font-bold text-white">★ ★ ★ ★ ★</span><span className="text-[8px] font-bold text-accent uppercase tracking-widest">تقييم الخدمة</span></div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </section>
            )}
            <section id="collection" className="py-24 bg-white">
              <div className="container mx-auto px-6">
                <div className="flex items-end justify-between mb-24 text-right">
                  <div><span className="text-primary font-bold uppercase tracking-widest text-xs block mb-4">مختارات يسلمو</span><h2 className="text-4xl lg:text-5xl font-bold text-primaryDark tracking-tighter">هدايا منتقاة بعناية</h2></div>
                  <button onClick={() => navigateToShop()} className="text-primary font-bold flex items-center gap-3 hover:gap-6 transition-all hidden md:flex text-xl"><span>تصفح الكل</span><ArrowLeft className="w-6 h-6" strokeWidth={2} /></button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8 items-stretch">
                  {products.slice(0, 8).map((product, idx) => (
                    <div key={`${product.id}-${idx}`} className="h-full">
                      <ProductCard product={product} onAddToCart={addToCart} onClick={navigateToProduct} onQuickView={handleQuickView} isWishlisted={wishlist.includes(product.id)} onToggleWishlist={() => toggleWishlist(product.id)} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <CategoriesSection />
            <WhyChooseUs />
            <section className="py-20 md:py-24 bg-primaryDark text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(108,43,217,0.1),_transparent)] pointer-events-none" />
              <div className="container mx-auto px-6 max-w-3xl relative z-10">
                <div className="flex items-center justify-center mb-6">
                  <img src="/img/logo/logo-light.png" alt="يسلمو" className="h-14 md:h-16 object-contain" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-5 tracking-tight">كن جزءاً من عالم يسلمو</h2>
                <p className="text-white/65 text-base md:text-lg mb-8 leading-relaxed max-w-xl mx-auto font-normal">احصل على عروض حصرية، معاينات للمجموعات القادمة، وخصومات تصل إلى ٢٥٪ لمشتركي النشرة فقط.</p>

                <a href={SOCIAL_LINKS.whatsappChannel} target="_blank" rel="noopener noreferrer">
                  <button className="px-8 md:px-10 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-2xl shadow-2xl shadow-[#25D366]/20 hover:scale-[1.02] active:scale-95 transition-all text-base flex items-center justify-center gap-2.5 mx-auto">
                    <IconWhatsapp className="w-5 h-5" />
                    <span>إنضم الى عائلتنا على الواتس اب</span>
                  </button>
                </a>
              </div>
            </section>
          </motion.div>
        } />
        <Route path="/shop" element={<ShopWrapper products={availableProducts} categories={categories} addToCart={addToCart} navigateToProduct={navigateToProduct} handleQuickView={handleQuickView} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/category/:categorySlug" element={<ShopWrapper products={availableProducts} categories={categories} addToCart={addToCart} navigateToProduct={navigateToProduct} handleQuickView={handleQuickView} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/product/:productSlug" element={<ProductDetailsWrapper products={products} availableProducts={availableProducts} loading={!isInitialDataLoaded} addToCart={addToCart} handleBuyNow={handleBuyNow} wishlist={wishlist} toggleWishlist={toggleWishlist} navigateToProduct={navigateToProduct} />} />
        <Route path="/collection/:collectionId" element={
          <CollectionDetailsPage
            onAddToCart={addToCart}
            onSelectProduct={navigateToProduct}
            onQuickView={handleQuickView}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        } />
        <Route path="/collections" element={<CollectionsPage onCollectionClick={(id) => navigate(`/collection/${id}`)} />} />
        <Route path="/wishlist" element={<WishlistPage products={products} wishlist={wishlist} onToggleWishlist={toggleWishlist} onAddToCart={addToCart} onSelectProduct={navigateToProduct} onQuickView={handleQuickView} onGoShopping={() => navigate('/shop')} />} />
        <Route path="/checkout" element={
          <CheckoutPage
            items={cartItems}
            user={user}
            customers={storeCustomers}
            onBack={() => navigate('/')}
            onCompleteOrder={handleCompleteOrder}
            onUpdateCustomer={async (id, updates) => {
              const exists = storeCustomers.some(c => c.id === id);

              if (checkSupabaseConfig()) {
                try {
                  if (exists && !id.startsWith('CUST-')) {
                    const updated = await customerService.update(id, updates);
                    storeUpdateCustomer(id, updated);
                  } else {
                    const created = await customerService.add({ ...updates } as Customer);
                    storeAddCustomer(created);
                  }
                } catch (err) {
                  console.error('Failed to update/add customer in Supabase:', err);
                  // Fallback to local store
                  if (exists) storeUpdateCustomer(id, updates);
                  else storeAddCustomer({ id, ...updates } as Customer);
                }
              } else {
                if (exists) storeUpdateCustomer(id, updates);
                else storeAddCustomer({ id, ...updates } as Customer);
              }
            }}
          />
        } />
        <Route path="/orders" element={user ? <CustomerOrders user={user} onBack={() => navigate('/')} /> : <Navigate to="/" />} />
        <Route path="/settings" element={user ? (
          <CustomerSettings
            user={user}
            customers={storeCustomers}
            onUpdateUser={(updatedUser) => {
              setUser(updatedUser);
              storage.setItem('yaslamo_user', updatedUser);
            }}
            onUpdateCustomer={async (id, updates) => {
              const exists = storeCustomers.some(c => c.id === id);

              if (checkSupabaseConfig()) {
                try {
                  if (exists && !id.startsWith('CUST-')) {
                    const updated = await customerService.update(id, updates);
                    storeUpdateCustomer(id, updated);
                  } else {
                    const created = await customerService.add({ ...updates } as Customer);
                    storeAddCustomer(created);
                  }
                } catch (err) {
                  console.error('Failed to update/add customer in Supabase:', err);
                  // Fallback to local store
                  if (exists) storeUpdateCustomer(id, updates);
                  else storeAddCustomer({ id, ...updates } as Customer);
                }
              } else {
                if (exists) storeUpdateCustomer(id, updates);
                else storeAddCustomer({ id, ...updates } as Customer);
              }
            }}
            onBack={() => navigate('/')}
          />
        ) : <Navigate to="/" />} />
        <Route path="/about" element={<OurStoryPage />} />
        <Route path="/policies" element={<PoliciesPage />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Routes>
    );
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {showPreloader && (
          <Preloader onComplete={() => setShowPreloader(false)} />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-white selection:bg-accent selection:text-primaryDark text-right">
        <Toaster position="top-left" />
        {location.pathname !== '/admin' && !location.pathname.startsWith('/admin') && (
          <>
            <TopBar />
            <Navbar
              cartCount={cartItems.length}
              wishlistCount={wishlist.length}
              onOpenCart={() => setIsCartOpen(true)}
              onNavigate={(page) => {
                if (page === 'shop') navigate('/shop');
                else if (page === 'home') navigate('/');
                else navigate(`/${page}`);
              }}
              user={user}
              onOpenLogin={() => { setIsCartOpen(false); setIsLoginModalOpen(true); }}
              onLogout={handleLogout}
            />
          </>
        )}
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
        <QuickViewModal isOpen={isQuickViewOpen} product={quickViewProduct} onClose={() => setIsQuickViewOpen(false)} onAddToCart={addToCart} onViewDetails={navigateToProduct} />

        {location.pathname !== '/checkout' && !location.pathname.startsWith('/admin') && (
          <footer className="bg-gray-50 text-gray-800 pt-24 pb-12 border-t border-[#D4AF37]/20 relative overflow-hidden">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20 text-right relative z-10">
              {/* Brand Section */}
              <div className="flex flex-col items-start col-span-1">
                <div className="flex flex-col mb-5 items-start">
                  <img src="/img/logo/logo.png" alt="يسلمو" className="h-12 object-contain cursor-pointer transition-transform hover:scale-105" onClick={() => navigate('/')} />
                  <span className="text-[10px] text-[#D4AF37] font-bold tracking-widest mt-2 uppercase">تأسس عام 2024</span>
                </div>
                <p className="text-gray-600 font-light text-xs leading-relaxed mb-6 max-w-sm">
                  نحن في "يسلمو" نؤمن بأن كل هدية هي حكاية حب، نصيغها لك بأعلى معايير الفخامة والرقي لتصل بصدق لمن تحب.
                </p>

                {/* Social Media Links */}
                <div className="flex items-center gap-3 justify-start flex-wrap">
                  {FOOTER_SOCIAL_LINKS.map(({ href, label, Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={label}
                      aria-label={label}
                      className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37] bg-white transition-all duration-300 hover:scale-105"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Column 2: Policies & Terms */}
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-sm text-gray-900 tracking-wide relative pb-3 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-6 after:h-[1.5px] after:bg-[#D4AF37]">السياسات والشروط</h4>
                <div className="flex flex-col gap-3.5 mt-2">
                  <button onClick={() => navigate('/policies?tab=privacy')} className="text-gray-600 hover:text-[#D4AF37] text-right transition-all text-xs hover:translate-x-[-4px] duration-300">سياسة الخصوصية</button>
                  <button onClick={() => navigate('/policies?tab=terms')} className="text-gray-600 hover:text-[#D4AF37] text-right transition-all text-xs hover:translate-x-[-4px] duration-300">الشروط والأحكام</button>
                  <button onClick={() => navigate('/policies?tab=refund')} className="text-gray-600 hover:text-[#D4AF37] text-right transition-all text-xs hover:translate-x-[-4px] duration-300">الاستبدال والاسترجاع</button>
                </div>
              </div>

              {/* Column 3: Help & Support */}
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-sm text-gray-900 tracking-wide relative pb-3 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-6 after:h-[1.5px] after:bg-[#D4AF37]">الدعم والمساعدة</h4>
                <div className="flex flex-col gap-3.5 mt-2">
                  <button onClick={() => navigate('/about')} className="text-gray-600 hover:text-[#D4AF37] text-right transition-all text-xs hover:translate-x-[-4px] duration-300">قصتنا (يسلمو)</button>
                  <button onClick={() => navigate('/policies?tab=privacy')} className="text-gray-600 hover:text-[#D4AF37] text-right transition-all text-xs hover:translate-x-[-4px] duration-300">مركز المساعدة</button>
                  <button onClick={() => navigate('/orders')} className="text-gray-600 hover:text-[#D4AF37] text-right transition-all text-xs hover:translate-x-[-4px] duration-300">تتبع طلبك</button>
                </div>
              </div>

              {/* Column 4: Contact Us */}
              <div className="flex flex-col gap-4">
                <h4 className="font-bold text-sm text-gray-900 tracking-wide relative pb-3 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-6 after:h-[1.5px] after:bg-[#D4AF37]">تواصل معنا</h4>
                <div className="flex flex-col gap-5 mt-2">
                  <div className="flex items-center gap-3 justify-start">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200/60 flex items-center justify-center text-[#D4AF37] shrink-0">
                      <IconWhatsapp className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-bold leading-none mb-1">الدعم الفني والتقني</p>
                      <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="font-bold text-xs text-gray-900 hover:text-[#D4AF37] transition-colors" dir="ltr">{SOCIAL_LINKS.whatsappDisplayNumber}</a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-start">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200/60 flex items-center justify-center text-[#D4AF37] shrink-0">
                      <IconWhatsapp className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-bold leading-none mb-1">الشكاوى والاقتراحات</p>
                      <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" className="font-bold text-xs text-gray-900 hover:text-[#D4AF37] transition-colors" dir="ltr">{SOCIAL_LINKS.whatsappDisplayNumber}</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="container mx-auto px-6 border-t border-gray-200/60 pt-8 text-center flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
              <div className="text-right text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                تأسس عام 2024 | جميع الحقوق محفوظة &copy; {new Date().getFullYear()} يسلمو للهدايا الفاخرة.
              </div>

              <div className="flex items-center gap-3 flex-wrap justify-center md:justify-end">
                <span className="px-2.5 py-1 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[9px] text-[#A88B2A] font-bold tracking-wider">تغليف فاخر</span>
                <span className="px-2.5 py-1 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[9px] text-[#A88B2A] font-bold tracking-wider">توصيل ملكي آمن</span>
                <span className="px-2.5 py-1 rounded-lg border border-[#D4AF37]/20 bg-[#D4AF37]/5 text-[9px] text-[#A88B2A] font-bold tracking-wider">خيارات دفع آمنة</span>
              </div>
            </div>
          </footer>
        )}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          onRemove={removeFromCart}
          onUpdateQuantity={updateCartQuantity}
          onCheckout={() => { setIsCartOpen(false); navigate('/checkout'); }}
        />
      </div>
    </>
  );
};

export default App;
