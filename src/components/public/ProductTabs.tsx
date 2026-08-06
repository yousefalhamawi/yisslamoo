import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getStableListKey } from '../../utils/stableListKey';
import { Link, useNavigate } from 'react-router-dom';
import {
  Monitor,
  BedDouble,
  HeartPulse,
  Shirt,
  Activity,
  Smartphone,
  Camera,
  Briefcase,
  Heart,
  Tag,
  Eye,
  Trophy,
  Zap,
  Grid,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  Gift,
  ShoppingBag,
  HelpCircle
} from 'lucide-react';
import { HomeProductSection, Product } from '../../types/index';
import ProductCard from './ProductCard';
import { useCategories } from '../../hooks/useCategories';
import { resolveCategoryIcon } from '../../constants/categoryIcons';
import { getProductsForHomeSection } from '../../utils/homeProductSections';

interface TabItem {
  id: HomeProductSection;
  label: string;
  icon: React.ComponentType<any>;
  dataSource: string;
  categoryLink: string;
  disabled?: boolean;
}

const TABS_CONFIG: TabItem[] = [
  {
    id: 'offers',
    label: 'عروض اليوم',
    icon: Tag,
    dataSource: 'offers',
    categoryLink: '/shop'
  },
  {
    id: 'recommended',
    label: 'قد تنال إعجابك',
    icon: Heart,
    dataSource: 'recommended',
    categoryLink: '/shop'
  },
  {
    id: 'new',
    label: 'المنتجات الجديدة',
    icon: Eye,
    dataSource: 'new',
    categoryLink: '/shop'
  },
  {
    id: 'trending',
    label: 'الأكثر رواجاً',
    icon: Zap,
    dataSource: 'trending',
    categoryLink: '/shop'
  },
  {
    id: 'bestsellers',
    label: 'الأكثر مبيعاً',
    icon: Trophy,
    dataSource: 'bestsellers',
    categoryLink: '/shop'
  },
  {
    id: 'all',
    label: 'عرض الكل',
    icon: Grid,
    dataSource: 'all',
    categoryLink: '/shop'
  },
];

const CATEGORIES_CONFIG = [
  { label: 'الكهرباء والالكترونيات', icon: Monitor, link: '/shop?category=electronics' },
  { label: 'أدوات تحسين المنزل', icon: BedDouble, link: '/shop?category=home-improvement' },
  { label: 'الصحة والعناية الشخصية', icon: HeartPulse, link: '/shop?category=health' },
  { label: 'أزياء الرجال والنساء', icon: Shirt, link: '/shop?category=fashion' },
  { label: 'في الهواء الطلق واللياقة البدنية', icon: Activity, link: '/shop?category=sports' },
  { label: 'اكسسوارات الجوالات', icon: Smartphone, link: '/shop?category=mobile' },
  { label: 'الأجهزة الذكية وملحقاتها', icon: Camera, link: '/shop?category=smart' },
  { label: 'اكسسوارات السفر والرحلات', icon: Briefcase, link: '/shop?category=travel' }
];


interface ProductTabsProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
}

const ProductTabs: React.FC<ProductTabsProps> = ({
  products,
  onAddToCart,
  onSelectProduct,
  onQuickView,
  wishlist,
  onToggleWishlist,
}) => {
  const navigate = useNavigate();
  const { categories, loading: categoriesLoading } = useCategories();
  const [activeTab, setActiveTab] = useState<HomeProductSection>('all');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const activeTabConfig = TABS_CONFIG.find(tab => tab.id === activeTab);
  const displayProducts = getProductsForHomeSection(products, activeTab).slice(0, 4);

  // Get active parent categories from database
  const activeDbCategories = categories.filter(c => c.status === 'active' && !c.parent_id);

  // Dynamically map categories with fallback
  const sidebarCategories = activeDbCategories.length > 0
    ? activeDbCategories.map(c => ({
      label: c.name,
      icon: resolveCategoryIcon(c),
      link: `/category/${c.slug}`
    }))
    : CATEGORIES_CONFIG;

  return (
    <section className="py-24 bg-gradient-to-b from-[#FDFCF7] via-[#FAF8F5] to-[#F3F1EC] relative overflow-hidden" dir="rtl">

      {/* Immersive Creative Backdrop Elements */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_rgba(76,29,149,0.03),_transparent_65%)] pointer-events-none blur-3xl" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_rgba(212,175,55,0.03),_transparent_70%)] pointer-events-none blur-2xl" />

      {/* Subtle brand lines */}
      <div className="absolute left-0 right-0 top-12 h-px bg-gradient-to-r from-transparent via-[#4C1D95]/5 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 max-w-7xl relative z-10">

        {/* Creative Section Title Area */}
        <div className="mb-16 text-center lg:text-right relative">
          <div className="flex items-center gap-3 justify-center lg:justify-start mb-4">
            <Sparkles className="w-5 h-5 text-accent animate-spin-slow" />
            <span className="text-[11px] font-extrabold text-primary uppercase tracking-[0.4em] bg-primary/5 px-3.5 py-1.5 rounded-full">
              مجموعات النخبة
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-primaryDark leading-tight tracking-tight">
            عوالم الفخامة <span className="text-accent relative font-light italic">الحصرية</span>
          </h2>
          <p className="text-gray-400 text-sm mt-3 max-w-lg mx-auto lg:mx-0 leading-relaxed">
            تنقل بين التبويبات والتصنيفات لتبحر في تشكيلة فريدة صُممت خصيصاً لتناسب أرقى الأذواق.
          </p>
        </div>

        {/* Layout Grid */}
        <div className="flex flex-col lg:flex-row gap-10 items-stretch">

          {/* Right Sidebar (RTL) - Luxury Category Wheel */}
          <div className="w-full lg:w-[360px] shrink-0 order-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-[3rem] p-6 shadow-[0_25px_60px_-25px_rgba(76,29,149,0.06)] border border-primary/5 h-full flex flex-col justify-start w-full relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(76,29,149,0.01),_transparent_60%)] pointer-events-none" />

              {/* Sidebar Header */}
              <div className="pb-5 mb-5 border-b border-gray-100 flex items-center justify-between text-right relative z-10">
                <span className="text-[17px] font-black text-primaryDark tracking-tight">منتجاتنا </span>
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping"></span>
              </div>

              {/* Categories Vertical List */}
              <div className="flex flex-col gap-2 relative z-10">
                {sidebarCategories.map((cat, idx) => {
                  const Icon = cat.icon;
                  const isHovered = activeCategory === idx;
                  return (
                    <Link
                      key={idx}
                      to={cat.link}
                      onMouseEnter={() => setActiveCategory(idx)}
                      onMouseLeave={() => setActiveCategory(null)}
                      className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-gradient-to-l hover:from-primary/5 hover:to-transparent text-gray-600 hover:text-primaryDark hover:translate-x-[-6px] transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-9 h-9 rounded-xl bg-gray-50 group-hover:bg-[#4C1D95] flex items-center justify-center transition-all duration-300 shadow-sm border border-gray-100/50 group-hover:rotate-6">
                          <Icon className="w-5 h-5 text-gray-400 group-hover:text-accent transition-colors" />
                        </div>
                        <span className="text-[13.5px] font-extrabold leading-none tracking-tight">{cat.label}</span>
                      </div>

                      <ChevronLeft className="w-4.5 h-4.5 text-gray-300 group-hover:text-accent group-hover:scale-110 transition-all" />
                    </Link>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Main Content Area (Left side in RTL) */}
          {/* min-w-0 ضروري: بدونه لا ينكمش العمود تحت عرض محتواه فيخرج من الحاوية */}
          <div className="flex-1 min-w-0 order-2 flex flex-col justify-between">

            {/* Highly Creative Tab Switcher */}
            <div className="bg-[#4C1D95] rounded-3xl p-3.5 shadow-[0_25px_60px_-25px_rgba(46,16,101,0.15)] mb-10 border border-white/5 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(212,175,55,0.08),_transparent_50%)] pointer-events-none" />
              <div className="grid grid-cols-3 md:grid-cols-6 gap-1.5 sm:gap-2 relative z-10">
                {TABS_CONFIG.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = tab.id === activeTab;
                  const isDisabled = tab.disabled;

                  return (
                    <motion.button
                      key={tab.id}
                      disabled={isDisabled}
                      whileHover={!isDisabled ? { y: -2 } : {}}
                      whileTap={!isDisabled ? { scale: 0.97 } : {}}
                      onClick={() => !isDisabled && setActiveTab(tab.id)}
                      className={`
                        min-w-0 flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-[11px] whitespace-nowrap transition-all duration-300 relative
                        ${isDisabled
                          ? 'text-white/30 bg-transparent cursor-not-allowed opacity-50'
                          : isActive
                            ? 'text-[#4C1D95] bg-white shadow-xl shadow-black/10 scale-[1.03]'
                            : 'text-white/70 hover:text-white hover:bg-white/5 bg-transparent'
                        }
                      `}
                    >
                      {/* Active glow indicator */}
                      {isActive && (
                        <motion.span
                          layoutId="activeGlow"
                          className="absolute inset-0 rounded-2xl border-2 border-accent/30 pointer-events-none"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <Icon className={`relative z-10 w-4 h-4 shrink-0 ${isActive ? 'text-[#FF6F61] opacity-100' : 'text-white/40'}`} />
                      <span className="relative z-10">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Asymmetrical / Asymmetric Creative Product Grid */}
            <div className="relative min-h-[480px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, scale: 0.98, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -15 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  // 4 أعمدة تبدأ من xl فقط: قبلها العمود ضيّق بسبب الشريط الجانبي
                  className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 xl:gap-6 items-stretch"
                >
                  {displayProducts.map((product, index) => {
                    const isFav = wishlist.includes(product.id);
                    // Asymmetric heights for creative magazine layout look
                    return (
                      <motion.div
                        key={getStableListKey(product.id, product.slug, 'product', index)}
                        layout
                        whileHover={{ y: -8, scale: 1.01 }}
                        className="h-full bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-[2rem] lg:rounded-[2.5rem] p-0 overflow-hidden shadow-[0_20px_50px_-25px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_-20px_rgba(76,29,149,0.12)] border border-white/40 flex flex-col relative group cursor-pointer transition-all duration-500"
                      >
                        <ProductCard
                          product={product}
                          onAddToCart={onAddToCart}
                          onClick={onSelectProduct}
                          onQuickView={onQuickView}
                          isWishlisted={isFav}
                          onToggleWishlist={() => onToggleWishlist(product.id)}
                        />
                      </motion.div>
                    );
                  })}
                  {displayProducts.length === 0 && (
                    <div className="col-span-full rounded-3xl border-2 border-dashed border-primary/10 bg-white/60 px-6 py-16 text-center">
                      <p className="text-sm font-bold text-gray-400">لا توجد منتجات ضمن هذا القسم حالياً.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Creative Outline View More Button */}
            {activeTabConfig && (
              <div className="mt-20 text-center relative z-20">
                <Link
                  to={activeTabConfig.categoryLink}
                  className="inline-flex items-center gap-3 px-10 py-4 bg-transparent border-2 border-primaryDark/10 text-primaryDark font-extrabold rounded-2xl hover:bg-[#4C1D95] hover:text-white hover:border-[#4C1D95] transition-all duration-300 shadow-sm hover:shadow-xl hover:translate-y-[-2px] group"
                >
                  <span>استكشف المزيد من {activeTabConfig.label}</span>
                  <ArrowRight className="w-5 h-5 rotate-180 transition-transform group-hover:-translate-x-1.5" />
                </Link>
              </div>
            )}

          </div>

        </div>

      </div>
    </section>
  );
};

export default ProductTabs;
