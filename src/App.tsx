
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useNotifications } from './contexts/NotificationContext';
import { validateEmail } from './utils/validation';
import { Toaster } from 'react-hot-toast';
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
import Bestsellers from './components/public/Bestsellers';
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
import { PRODUCTS } from './mockData/initialData';
import { Product, User } from './types/index';

type PageState = 'home' | 'shop' | 'details' | 'wishlist' | 'collections' | 'checkout' | 'admin' | 'orders' | 'settings';

import { checkSupabaseConfig } from './supabase';
import { useSharedStore } from './store/useSharedStore';
import { Order, Customer } from './types/admin';
import { orderService } from './services/orderService';
import { customerService } from './services/customerService';
import { productService } from './services/productService';
import { toast as hotToast } from 'react-hot-toast';
import { storage } from './services/storage';

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

  return (
    <ProductPage
      products={products}
      categories={categories}
      onAddToCart={addToCart}
      onSelectProduct={navigateToProduct}
      onQuickView={handleQuickView}
      initialCategory={category}
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
  loading: boolean,
  addToCart: (p: Product) => void,
  handleBuyNow: (p: Product) => void,
  wishlist: string[],
  toggleWishlist: (id: string) => void,
  navigateToProduct: (p: Product) => void
}> = ({ products, loading, addToCart, handleBuyNow, wishlist, toggleWishlist, navigateToProduct }) => {
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

    // Initial fetch
    const fetchInitialData = async () => {
      if (!checkSupabaseConfig()) return;

      // 1. Fetch public data: products, categories, reviews
      try {
        const [productsData, categoriesData, reviewsData] = await Promise.all([
          productService.getAll().catch(err => {
            console.error('Failed to fetch products from Supabase, using mock fallback:', err);
            return [];
          }),
          categoryService.getAll().catch(err => {
            console.error('Failed to fetch categories from Supabase, using mock fallback:', err);
            return [];
          }),
          reviewService.getAll().catch(err => {
            console.error('Failed to fetch reviews from Supabase, using mock fallback:', err);
            return [];
          })
        ]);

        if (productsData && productsData.length > 0) {
          storeSetProducts(productsData);
        }
        if (categoriesData && categoriesData.length > 0) {
          setCategories(categoriesData);
        }
        if (reviewsData && reviewsData.length > 0) {
          storeSetReviews(reviewsData);
        }
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

    return () => {
      orderSubscription.unsubscribe();
      customerSubscription.unsubscribe();
    };
  }, []);
  const [cartItems, setCartItems] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

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
      const sessionActive = sessionStorage.getItem('yaslamo_session_active') === 'true';

      if (rememberMe && loginTimeStr) {
        const loginTime = parseInt(loginTimeStr, 10);
        if (Date.now() - loginTime > 15 * 24 * 60 * 60 * 1000) { // 15 days
          handleLogout();
        } else {
          sessionStorage.setItem('yaslamo_session_active', 'true');
        }
      } else if (!rememberMe && !sessionActive) {
        // Session not remembered and browser was restarted
        handleLogout();
      } else {
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
      // Save to local store for immediate UI update
      storeAddOrder(newOrder);

      // Save to Supabase
      if (checkSupabaseConfig()) {
        await orderService.create(newOrder);
      }

      // Update customer stats if logged in
      if (user) {
        const customer = storeCustomers.find(c => c.email === user.email);
        if (customer) {
          storeUpdateCustomer(customer.id, {
            ordersCount: customer.ordersCount + 1,
            totalSpent: customer.totalSpent + total,
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

      const product = PRODUCTS.find(p => p.id === id);
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
              products={products}
              onAddToCart={addToCart}
              onSelectProduct={navigateToProduct}
              onQuickView={handleQuickView}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
            />

            {!user && (
              <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative bg-primaryDark rounded-[4rem] p-12 md:p-24 overflow-hidden shadow-[0_50px_100px_-20px_rgba(108,43,217,0.4)]"
                  >
                    <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-[100px]" />
                    <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-primary/30 rounded-full blur-[100px]" />
                    <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity }} className="flex items-center justify-center mb-12">
                        <img src="/img/logo/logo.png" alt="يسلمو" className="h-24 object-contain" />
                      </motion.div>
                      <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tighter leading-tight">انضم إلى <span className="text-accent">نخبة</span> يسلمو <br />واكتشف الفخامة بمعناها الحقيقي</h2>
                      <p className="text-white/70 text-lg md:text-xl font-normal mb-16 leading-relaxed">سجل دخولك الآن للحصول على أسعار حصرية، تتبع طلباتك، والوصول إلى مجموعات الهدايا المحدودة قبل الجميع.</p>
                      <div className="flex flex-col sm:flex-row gap-8 w-full justify-center">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsLoginModalOpen(true)} className="px-12 py-5 bg-accent text-primaryDark font-bold rounded-2xl text-xl shadow-2xl shadow-accent/20 hover:shadow-accent/40 transition-all">دخول سريع</motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setIsLoginModalOpen(true)} className="px-12 py-5 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl text-xl hover:bg-white/20 transition-all">إنشاء حساب جديد</motion.button>
                      </div>
                      <div className="mt-16 flex items-center gap-10 opacity-40">
                        <div className="flex flex-col items-center"><span className="text-2xl font-bold text-white">+١٠ك</span><span className="text-[9px] font-bold text-accent uppercase tracking-widest">عضو متميز</span></div>
                        <div className="w-px h-10 bg-white/20" /><div className="flex flex-col items-center"><span className="text-2xl font-bold text-white">★ ★ ★ ★ ★</span><span className="text-[9px] font-bold text-accent uppercase tracking-widest">تقييم الخدمة</span></div>
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
                  <button onClick={() => navigateToShop()} className="text-primary font-bold flex items-center gap-3 hover:gap-6 transition-all hidden md:flex text-xl"><span>تصفح الكل</span><svg className="w-6 h-6 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 items-stretch">
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
            <Bestsellers products={products} onAddToCart={addToCart} onSelectProduct={navigateToProduct} onQuickView={handleQuickView} onViewAll={() => navigateToShop()} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
            <section className="py-32 bg-primaryDark text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(108,43,217,0.1),_transparent)] pointer-events-none" />
              <div className="container mx-auto px-6 max-w-3xl relative z-10">
                <div className="flex items-center justify-center mb-10">
                  <img src="/img/logo/logo-light.png" alt="يسلمو" className="h-20 object-contain" />
                </div>
                <h2 className="text-4xl font-bold mb-8 tracking-tight">كن جزءاً من عالم يسلمو</h2>
                <p className="text-white/60 text-lg mb-12 leading-relaxed max-w-2xl mx-auto font-normal">احصل على عروض حصرية، معاينات للمجموعات القادمة، وخصومات تصل إلى ٢٥٪ لمشتركي النشرة فقط.</p>

                <a href="https://whatsapp.com/channel/yaslamo" target='_blank'>
                  <button className="px-12 py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold rounded-2xl shadow-2xl shadow-[#25D366]/20 hover:scale-[1.02] active:scale-95 transition-all text-lg flex items-center justify-center gap-3 mx-auto">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 16 16">
                      <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                    </svg>
                    <span>إنضم الى عائلتنا على الواتس اب</span>
                  </button>
                </a>
              </div>
            </section>
          </motion.div>
        } />
        <Route path="/shop" element={<ShopWrapper products={products} categories={categories} addToCart={addToCart} navigateToProduct={navigateToProduct} handleQuickView={handleQuickView} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/category/:categorySlug" element={<ShopWrapper products={products} categories={categories} addToCart={addToCart} navigateToProduct={navigateToProduct} handleQuickView={handleQuickView} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/product/:productSlug" element={<ProductDetailsWrapper products={products} loading={!isInitialDataLoaded} addToCart={addToCart} handleBuyNow={handleBuyNow} wishlist={wishlist} toggleWishlist={toggleWishlist} navigateToProduct={navigateToProduct} />} />
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
              onOpenLogin={() => setIsLoginModalOpen(true)}
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
                  <a href="https://facebook.com/yaslamo" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37] bg-white transition-all duration-300 hover:scale-105" title="فيسبوك">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                    </svg>
                  </a>
                  <a href="https://instagram.com/yaslamo" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37] bg-white transition-all duration-300 hover:scale-105" title="إنستغرام">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                    </svg>
                  </a>
                  <a href="https://tiktok.com/@yaslamo" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37] bg-white transition-all duration-300 hover:scale-105" title="تيكتوك">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.99 1.15 2.37 1.93 3.86 2.19v3.81c-1.63-.09-3.2-.67-4.52-1.65-.21-.15-.41-.32-.61-.5v6.52c-.05 1.89-.73 3.73-1.94 5.17-1.44 1.76-3.66 2.76-5.94 2.72-2.02.04-4.01-.76-5.46-2.18-1.57-1.47-2.45-3.59-2.4-5.78-.07-2.31.97-4.55 2.74-6.02 1.63-1.42 3.83-2.13 5.99-1.92v3.91c-1.18-.18-2.4.15-3.32.93-.93.75-1.45 1.89-1.41 3.09-.04 1.18.45 2.33 1.32 3.12.92.87 2.21 1.29 3.44 1.1 1.25-.14 2.35-.94 2.87-2.08.3-.59.43-1.25.4-1.91V.02z" />
                    </svg>
                  </a>
                  <a href="https://x.com/yaslamo" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37] bg-white transition-all duration-300 hover:scale-105" title="اكس">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <a href="https://threads.net/@yaslamo" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37] bg-white transition-all duration-300 hover:scale-105" title="تريدز">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M6.321 6.016c-.27-.18-1.166-.802-1.166-.802.756-1.081 1.753-1.502 3.132-1.502.975 0 1.803.327 2.394.948s.928 1.509 1.005 2.644q.492.207.905.484c1.109.745 1.719 1.86 1.719 3.137 0 2.716-2.226 5.075-6.256 5.075C4.594 16 1 13.987 1 7.994 1 2.034 4.482 0 8.044 0 9.69 0 13.55.243 15 5.036l-1.36.353C12.516 1.974 10.163 1.43 8.006 1.43c-3.565 0-5.582 2.171-5.582 6.79 0 4.143 2.254 6.343 5.63 6.343 2.777 0 4.847-1.443 4.847-3.556 0-1.438-1.208-2.127-1.27-2.127-.236 1.234-.868 3.31-3.644 3.31-1.618 0-3.013-1.118-3.013-2.582 0-2.09 1.984-2.847 3.55-2.847.586 0 1.294.04 1.663.114 0-.637-.54-1.728-1.9-1.728-1.25 0-1.566.405-1.967.868ZM8.716 8.19c-2.04 0-2.304.87-2.304 1.416 0 .878 1.043 1.168 1.6 1.168 1.02 0 2.067-.282 2.232-2.423a6.2 6.2 0 0 0-1.528-.161"/>
                    </svg>
                  </a>
                  <a href="https://whatsapp.com/channel/yaslamo" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#D4AF37] hover:border-[#D4AF37] bg-white transition-all duration-300 hover:scale-105" title="قناة الواتساب">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12c0 2.17.7 4.19 1.9 5.86L2.5 21.5l3.8-1.3C7.88 21.3 9.87 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-4h2v4zm0-6h-2V8h2v2z" />
                    </svg>
                  </a>
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
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-bold leading-none mb-1">الدعم الفني والتقني</p>
                      <a href="https://wa.me/963930000000" target="_blank" rel="noopener noreferrer" className="font-bold text-xs text-gray-900 hover:text-[#D4AF37] transition-colors" dir="ltr">+963 930 000 000</a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-start">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200/60 flex items-center justify-center text-[#D4AF37] shrink-0">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 16 16">
                        <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232"/>
                      </svg>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-bold leading-none mb-1">الشكاوى والاقتراحات</p>
                      <a href="https://wa.me/963930111222" target="_blank" rel="noopener noreferrer" className="font-bold text-xs text-gray-900 hover:text-[#D4AF37] transition-colors" dir="ltr">+963 930 111 222</a>
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
