
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useNotifications } from './contexts/NotificationContext';
import { validateEmail } from './utils/validation';
import { Toaster } from 'react-hot-toast';
import { Routes, Route, useNavigate, useParams, useLocation, Navigate, useSearchParams } from 'react-router-dom';
import Navbar from './components/public/Navbar';
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
import Testimonials from './components/public/Testimonials';
import LoginModal from './components/public/LoginModal';
import QuickViewModal from './components/public/QuickViewModal';
import Preloader from './components/public/Preloader';
import CustomerOrders from './components/public/CustomerOrders';
import CustomerSettings from './components/public/CustomerSettings';
import AdminDashboard from './pages/admin/AdminDashboard';
import CollectionDetailsPage from './components/public/CollectionDetailsPage';
import { PRODUCTS } from './mockData/initialData';
import { Product, User } from './types/index';

type PageState = 'home' | 'shop' | 'details' | 'wishlist' | 'collections' | 'checkout' | 'admin' | 'orders' | 'settings';

import { checkSupabaseConfig } from './supabase';
import { useSharedStore } from './store/useSharedStore';
import { Order, Customer } from './types/admin';
import { orderService } from './services/orderService';
import { customerService } from './services/customerService';
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
  addToCart: (p: Product) => void,
  handleBuyNow: (p: Product) => void,
  wishlist: string[],
  toggleWishlist: (id: string) => void,
  navigateToProduct: (p: Product) => void
}> = ({ products, addToCart, handleBuyNow, wishlist, toggleWishlist, navigateToProduct }) => {
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

  // Real-time orders subscription
  useEffect(() => {
    if (!checkSupabaseConfig()) return;

    // Initial fetch
    const fetchInitialData = async () => {
      try {
        if (checkSupabaseConfig()) {
          const [ordersData, customersData, categoriesData, reviewsData] = await Promise.all([
            orderService.getAll(),
            customerService.getAll(),
            categoryService.getAll(),
            reviewService.getAll()
          ]);
          storeSetOrders(ordersData);
          storeSetCustomers(customersData);
          setCategories(categoriesData);
          storeSetReviews(reviewsData);
        }
        // تحميل سعر الصرف عند بدء التطبيق
        initExchangeRate();
      } catch (err) {
        console.error('Failed to fetch initial data:', err);
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

  const handleLogin = async (data: { id?: string; name: string; email: string; phone: string; password?: string; isRegister: boolean }): Promise<boolean> => {
    const existingCustomer = storeCustomers.find(c => c.email?.toLowerCase() === data.email.toLowerCase());

    // Check if it's a social login (no password provided)
    const isSocialLogin = !data.password;

    if (isSocialLogin) {
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
            console.error('Failed to save social customer to Supabase:', err);
            // Fallback to local store
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
    }

    // Manual login/registration with password
    if (data.isRegister) {
      if (existingCustomer) {
        hotToast.error('هذا البريد الإلكتروني مسجل مسبقاً');
        return false;
      }

      const phoneExists = data.phone && storeCustomers.some(c => c.phone === data.phone);
      if (phoneExists) {
        hotToast.error('فشل رقم الهاتف مسجل مسبقاً');
        return false;
      }

      let customerId = data.id || `CUST-${Date.now()}`;
      const newCustomer: any = {
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        user_id: data.id,
        ordersCount: 0,
        totalSpent: 0,
        lastOrderDate: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      // If data.id is a valid UUID, use it as the primary ID
      if (data.id && data.id.length > 20) {
        newCustomer.id = data.id;
      }

      if (checkSupabaseConfig() && data.id) {
        try {
          const customer = await customerService.getOrCreateCustomer(data.id, newCustomer);
          customerId = customer.id;
          storeAddCustomer(customer);
        } catch (err) {
          console.error('Failed to save customer to Supabase:', err);
          // Fallback to local store if Supabase fails
          const localCustomer = { ...newCustomer, id: customerId };
          storeAddCustomer(localCustomer);
        }
      } else {
        const localCustomer = { ...newCustomer, id: customerId };
        storeAddCustomer(localCustomer);
      }

      const newUser = { id: customerId, name: data.name, email: data.email };
      setUser(newUser);
      storage.setItem('yaslamo_user', newUser);
      hotToast.success(`مرحباً بك، ${data.name}!`);
      return true;
    } else {
      // Login attempt
      if (!existingCustomer) {
        hotToast.error('فشل الحساب غير موجود');
        return false;
      }

      // Check password
      if (existingCustomer.password && data.password !== existingCustomer.password) {
        hotToast.error('كلمة المرور غير صحيحة');
        return false;
      }

      const userToSet = existingCustomer;
      const newUser = { id: userToSet.id, name: userToSet.name, email: userToSet.email };
      setUser(newUser);
      storage.setItem('yaslamo_user', newUser);
      hotToast.success(`أهلاً بك مجدداً، ${userToSet.name}!`);
      return true;
    }
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
                <div className="columns-1 sm:columns-2 lg:columns-4 gap-12 space-y-12">
                  {products.slice(0, 8).map((product, idx) => (
                    <div key={`${product.id}-${idx}`} className="break-inside-avoid">
                      <ProductCard product={product} onAddToCart={addToCart} onClick={navigateToProduct} onQuickView={handleQuickView} isWishlisted={wishlist.includes(product.id)} onToggleWishlist={() => toggleWishlist(product.id)} />
                    </div>
                  ))}
                </div>
              </div>
            </section>
            <CategoriesSection />
            <WhyChooseUs />
            <Bestsellers products={products} onAddToCart={addToCart} onSelectProduct={navigateToProduct} onQuickView={handleQuickView} onViewAll={() => navigateToShop()} wishlist={wishlist} onToggleWishlist={toggleWishlist} />
            <Testimonials />
            <section className="py-32 bg-primaryDark text-white text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(108,43,217,0.1),_transparent)] pointer-events-none" />
              <div className="container mx-auto px-6 max-w-3xl relative z-10">
                <div className="flex items-center justify-center mb-10">
                  <img src="/img/logo/logo-light.png" alt="يسلمو" className="h-20 object-contain" />
                </div>
                <h2 className="text-4xl font-bold mb-8 tracking-tight">كن جزءاً من عالم يسلمو</h2>
                <p className="text-white/60 text-lg mb-12 leading-relaxed max-w-2xl mx-auto font-normal">احصل على عروض حصرية، معاينات للمجموعات القادمة، وخصومات تصل إلى ٢٥٪ لمشتركي النشرة فقط.</p>

                <a href="#" target='_blank'><button className="px-12 py-4 bg-accent text-primaryDark font-bold rounded-2xl shadow-2xl shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all text-lg">إنضم الى عائلتنا على الواتس اب</button></a>
              </div>
            </section>
          </motion.div>
        } />
        <Route path="/shop" element={<ShopWrapper products={products} categories={categories} addToCart={addToCart} navigateToProduct={navigateToProduct} handleQuickView={handleQuickView} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/category/:categorySlug" element={<ShopWrapper products={products} categories={categories} addToCart={addToCart} navigateToProduct={navigateToProduct} handleQuickView={handleQuickView} wishlist={wishlist} toggleWishlist={toggleWishlist} />} />
        <Route path="/product/:productSlug" element={<ProductDetailsWrapper products={products} addToCart={addToCart} handleBuyNow={handleBuyNow} wishlist={wishlist} toggleWishlist={toggleWishlist} navigateToProduct={navigateToProduct} />} />
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
        )}
        <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
        <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
        <QuickViewModal isOpen={isQuickViewOpen} product={quickViewProduct} onClose={() => setIsQuickViewOpen(false)} onAddToCart={addToCart} onViewDetails={navigateToProduct} />

        {location.pathname !== '/checkout' && !location.pathname.startsWith('/admin') && (
          <footer className="bg-white text-primaryDark pt-32 pb-12 border-t border-gray-100">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 mb-24 text-right">
              <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-3 mb-10 justify-start">
                  <img src="/img/logo/logo.png" alt="يسلمو" className="h-12 object-contain cursor-pointer" onClick={() => navigate('/')} />
                </div>
                <p className="text-gray-400 font-normal text-base leading-relaxed mb-10">نحن في "يسلمو" نؤمن بأن كل هدية هي حكاية حب، نصيغها لك بأعلى معايير الفخامة والرقي لتصل بصدق لمن تحب.</p>
              </div>
              <div className="flex flex-col gap-6">
                <h4 className="font-bold text-base mb-4 tracking-tight">اكتشف يسلمو</h4>
                <button onClick={() => navigate('/collections')} className="text-gray-400 font-bold hover:text-primary text-right transition-all text-xs">المجموعات الحصرية</button>
                <button onClick={() => navigate('/wishlist')} className="text-gray-400 font-bold hover:text-primary text-right transition-all text-xs">قائمة أمنياتي</button>
                <button onClick={() => navigate('/')} className="text-gray-400 font-bold hover:text-primary text-right transition-all text-xs">قصة يسلمو</button>
              </div>
              <div className="flex flex-col gap-6">
                <h4 className="font-bold text-base mb-4 tracking-tight">الدعم والمساعدة</h4>
                <a href="#" className="text-gray-400 font-bold hover:text-primary transition-all text-xs">مركز المساعدة</a>
                <a href="#" className="text-gray-400 font-bold hover:text-primary transition-all text-xs">تتبع طلبك</a>
              </div>
              <div className="flex flex-col gap-6">
                <h4 className="font-bold text-base mb-4 tracking-tight">تواصل معنا</h4>
                <p className="text-gray-400 font-bold text-xs"> سوريا, دمشق   </p>
                <p className="text-gray-400 font-bold text-xs">هاتف: +٩٦٦ ٥٠٠ ٠٠٠ ٠٠٠</p>
                <button onClick={() => navigate('/admin')} className="text-gray-400/20 hover:text-primary transition-all text-right text-[8px] mt-4">الإدارة</button>
              </div>
            </div>
            <div className="container mx-auto px-6 border-t border-gray-50 pt-10 text-center flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 text-[9px] font-bold uppercase tracking-[0.3em]">
              <span>جميع الحقوق محفوظة &copy; {new Date().getFullYear()} يسلمو للهدايا الفاخرة.</span>
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
