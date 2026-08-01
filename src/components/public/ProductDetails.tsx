import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from '../../utils/toast';
import { useNotifications } from '../../contexts/NotificationContext';
import { Product } from '../../types/index';
import { Review } from '../../types/admin';
import { reviewService } from '../../services/reviewService';
import ProductCard from './ProductCard';
import { Link } from 'react-router-dom';
import { getColorName, getColorHex } from '../../utils/colorUtils';
import { usePricedProduct } from '../../hooks/usePricedProduct';
import { getRelatedProducts } from '../../utils/relatedProducts';
import { ChevronLeft, ChevronRight, Share2, Heart, ShoppingBag, Gift, PenTool, MessageSquare, Truck, RotateCcw, ShieldCheck, Star, ZoomIn, X as CloseIcon } from 'lucide-react';

interface ProductDetailsProps {
  product: Product;
  /** كل منتجات المتجر — تُستخدم لاقتراح منتجات من نفس الفئة */
  allProducts: Product[];
  onAddToCart: (p: Product) => void;
  onBuyNow: (p: Product) => void;
  onBack: () => void;
  onSelectProduct: (p: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
}

const MAX_MESSAGE_LENGTH = 150;
const MAX_ENGRAVING_LENGTH = 20;

const ProductDetails: React.FC<ProductDetailsProps> = ({
  product,
  allProducts,
  onAddToCart,
  onBuyNow,
  onBack,
  onSelectProduct,
  isWishlisted,
  onToggleWishlist
}) => {
  const images = product?.images && product.images.length > 0 ? product.images : [product?.image || ''];
  const { displayPrice, displayOldPrice } = usePricedProduct(product);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { addNotification } = useNotifications();

  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [isGiftWrapEnabled, setIsGiftWrapEnabled] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.availableColors?.[0]);
  const [engravingText, setEngravingText] = useState('');
  const [activeTab, setActiveTab] = useState('الوصف');
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    comment: '',
    customer: ''
  });

  const fetchReviews = async () => {
    if (!product?.id) return;
    setIsLoadingReviews(true);
    try {
      const data = await reviewService.getByProduct(product.id);
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product?.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim() || !newReview.customer.trim()) {
      toast.error('يرجى ملء جميع الخانات');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await reviewService.add({
        productId: product.id,
        productName: product.name,
        customer: newReview.customer,
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString()
      });

      toast.success('شكرًا لتقييمك! سيتم مراجعة التقييم ونشره قريباً.');
      setNewReview({ rating: 5, comment: '', customer: '' });
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال التقييم');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  useEffect(() => {
    setCurrentIndex(0);
    setGiftMessage('');
    setEngravingText('');
    setSelectedColor(product.availableColors?.[0]);
    setIsGiftWrapEnabled(false);
    setIsGift(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);

  const handleAddToCartWithExtras = () => {
    onAddToCart({
      ...product,
      selectedGiftWrapping: isGift && isGiftWrapEnabled ? 'تغليف يسلمو الملكي الفاخر' : undefined,
      selectedGiftMessage: isGift ? giftMessage : undefined,
      selectedColor: selectedColor,
      selectedEngraving: isGift ? engravingText : undefined,
    });
  };

  const handleBuyNowWithExtras = () => {
    onBuyNow({
      ...product,
      selectedGiftWrapping: isGift && isGiftWrapEnabled ? 'تغليف يسلمو الملكي الفاخر' : undefined,
      selectedGiftMessage: isGift ? giftMessage : undefined,
      selectedColor: selectedColor,
      selectedEngraving: isGift ? engravingText : undefined,
    });
  };

  const relatedProducts = useMemo(
    () => getRelatedProducts(product, allProducts),
    [allProducts, product]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white min-h-screen page-offset pb-20 font-sans selection:bg-accent selection:text-primaryDark"
    >
      {/* Zoom Modal */}
      <AnimatePresence>
        {isZoomOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
            onClick={() => setIsZoomOpen(false)}
          >
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-8 left-8 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors z-50 overflow-hidden backdrop-blur-md"
              onClick={(e) => { e.stopPropagation(); setIsZoomOpen(false); }}
            >
              <CloseIcon className="w-6 h-6" />
            </motion.button>

            <motion.img
              layoutId={`product-image-${currentIndex}`}
              src={images[currentIndex]}
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              alt={product.name}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              referrerPolicy="no-referrer"
            />

            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-12 flex justify-center gap-4 px-6 pointer-events-none">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                    className={`w-3 h-3 rounded-full transition-all pointer-events-auto ${currentIndex === i ? 'bg-accent w-8' : 'bg-white/20 hover:bg-white/40'}`}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Breadcrumbs / Back */}
        <nav className="flex items-center gap-2 text-[10px] text-gray-400 mb-12 uppercase tracking-[0.3em]">
          <button onClick={onBack} className="hover:text-accent transition-colors">المتجر</button>
          <ChevronLeft className="w-3 h-3 rotate-180" />
          <Link
            to={`/shop?category=${encodeURIComponent(product.categories?.[0] || product.category)}`}
            className="text-gray-300 hover:text-accent transition-colors"
          >
            {product.categories && product.categories.length > 0 ? product.categories[0] : product.category}
          </Link>
          <ChevronLeft className="w-3 h-3 rotate-180" />
          <span className="text-primaryDark font-bold">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-24 items-start">
          {/* Left: Gallery */}
          <div className="lg:col-span-7 flex flex-col-reverse lg:flex-row gap-6">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex lg:flex-col gap-4 overflow-x-auto lg:overflow-y-auto lg:max-h-[600px] no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`relative w-20 lg:w-24 aspect-square flex-shrink-0 overflow-hidden rounded-2xl transition-all duration-300 border-2 ${currentIndex === i ? 'border-accent shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div
              className="relative flex-1 aspect-[4/5] bg-[#FBFBFB] overflow-hidden rounded-[2.5rem] border border-gray-100 group shadow-sm cursor-zoom-in"
              onClick={() => setIsZoomOpen(true)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  layoutId={`product-image-${currentIndex}`}
                  key={currentIndex}
                  src={images[currentIndex]}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="w-full h-full object-cover"
                  alt={product.name}
                  referrerPolicy="no-referrer"
                />
              </AnimatePresence>

              {/* Zoom Overlay */}
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                <div className="w-16 h-16 bg-white/90 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-500 text-primaryDark">
                  <ZoomIn className="w-6 h-6" />
                </div>
              </div>

              {images.length > 1 && (
                <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev - 1 + images.length) % images.length); }}
                    className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl text-primaryDark flex items-center justify-center hover:bg-accent transition-all pointer-events-auto"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev + 1) % images.length); }}
                    className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl text-primaryDark flex items-center justify-center hover:bg-accent transition-all pointer-events-auto"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-primaryDark text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">جديد</span>
                )}
                {product.discountPrice && (
                  <span className="bg-accent text-primaryDark text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">خصم خاص</span>
                )}
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <Link
                to={`/shop?category=${encodeURIComponent(product.categories?.[0] || product.category)}`}
                className="text-[10px] font-bold tracking-[0.3em] text-accent uppercase hover:text-primaryDark transition-colors"
              >
                {product.categories && product.categories.length > 0
                  ? product.categories.join(' • ')
                  : product.category}
              </Link>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    addNotification({
                      title: 'تم نسخ الرابط',
                      message: 'تم نسخ رابط المنتج إلى الحافظة بنجاح.',
                      type: 'info'
                    });
                  }}
                  className="w-10 h-10 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-accent hover:text-primaryDark transition-all"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onToggleWishlist}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isWishlisted ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'}`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-primaryDark mb-4 leading-tight tracking-tight">{product.name}</h1>

            <div className="flex items-center gap-4 mb-8 justify-end">
              <span className="text-sm font-black text-primaryDark">{(product.rating || 5.0).toFixed(1)}</span>
              <div className="flex items-center gap-1 text-accent">
                {[...Array(5)].map((_, i: number) => {
                  const starValue = i + 1;
                  const ratingValue = product.rating || 5.0;
                  const isFull = starValue <= Math.floor(ratingValue);
                  const isHalf = !isFull && (starValue - 0.5) <= ratingValue;
                  return (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${isFull
                          ? 'fill-current'
                          : (isHalf ? 'fill-current opacity-50' : 'text-gray-200')
                        }`}
                    />
                  );
                })}
              </div>
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase pb-0.5">
                ({reviews.length || product.reviews || 0} تقييم)
              </span>
            </div>

            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-3xl font-bold text-primaryDark">{displayPrice.toLocaleString()}</span>
              <span className="text-sm font-bold text-accent uppercase tracking-widest">ليرة سورية</span>
              {displayOldPrice && (
                <span className="text-lg text-gray-300 line-through">{displayOldPrice.toLocaleString()}</span>
              )}
            </div>

            <p className="text-base text-gray-500 leading-relaxed mb-12 font-normal">
              {product.description}
            </p>

            {/* Customization Options */}
            <div className="space-y-10 mb-12">
              {/* Colors */}
              {product.availableColors && product.availableColors.length > 0 && (
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                  <label className="block text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-6">
                    اللون المختار: <span className="text-primaryDark ml-2">{getColorName(selectedColor || '')}</span>
                  </label>
                  <div className="flex gap-4">
                    {product.availableColors.map((color, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all duration-300 p-1 ${selectedColor === color ? 'border-accent scale-110 shadow-lg' : 'border-transparent hover:scale-105'}`}
                      >
                        <div
                          className="w-full h-full rounded-full shadow-inner"
                          style={{
                            background: getColorHex(color) === '#FFD700'
                              ? 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 45%, #B38728 70%, #FBF5B7 100%)'
                              : getColorHex(color) === '#C0C0C0'
                                ? 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 45%, #A9A9A9 70%, #E8E8E8 100%)'
                                : getColorHex(color)
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gift Toggle Section */}
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <button
                  onClick={() => setIsGift(!isGift)}
                  className="flex items-center justify-between w-full group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isGift ? 'bg-accent text-primaryDark' : 'bg-gray-100 text-gray-400'}`}>
                      <Gift className="w-6 h-6" />
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-bold text-primaryDark">إضافة لمسة إهداء خاصة</span>
                      <span className="block text-[10px] text-gray-400 mt-1 uppercase tracking-widest">اجعلها ذكرى لا تُنسى</span>
                    </div>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-all relative p-1 ${isGift ? 'bg-accent' : 'bg-gray-200'}`}>
                    <motion.div
                      animate={{ x: isGift ? -24 : 0 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {isGift && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-8 space-y-8">
                        {product.canEngrave && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">نقش الاسم بالليزر (+٧٥ ليرة سورية)</label>
                              <span className="text-[10px] font-bold text-accent">{engravingText.length}/{MAX_ENGRAVING_LENGTH}</span>
                            </div>
                            <input
                              type="text"
                              maxLength={MAX_ENGRAVING_LENGTH}
                              value={engravingText}
                              onChange={(e) => setEngravingText(e.target.value)}
                              placeholder="الاسم المراد نقشه..."
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-accent transition-all"
                            />
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">رسالة الإهداء</label>
                            <span className="text-[10px] font-bold text-accent">{giftMessage.length}/{MAX_MESSAGE_LENGTH}</span>
                          </div>
                          <textarea
                            rows={4}
                            maxLength={MAX_MESSAGE_LENGTH}
                            value={giftMessage}
                            onChange={(e) => setGiftMessage(e.target.value)}
                            placeholder="اكتب رسالتك الرقيقة هنا..."
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-accent transition-all resize-none"
                          />
                        </div>

                        <button
                          onClick={() => setIsGiftWrapEnabled(!isGiftWrapEnabled)}
                          className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${isGiftWrapEnabled ? 'border-accent bg-accent/5' : 'border-gray-100 bg-white'}`}
                        >
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isGiftWrapEnabled ? 'border-accent bg-accent' : 'border-gray-200'}`}>
                            {isGiftWrapEnabled && <div className="w-2 h-2 rounded-full bg-primaryDark" />}
                          </div>
                          <span className="text-xs font-bold text-primaryDark">تغليف يسلمو الملكي الفاخر (+٥٠ ليرة سورية)</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={handleAddToCartWithExtras}
                className="flex-1 bg-primaryDark text-white py-5 rounded-2xl text-xs font-bold tracking-[0.2em] uppercase hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl hover:shadow-primaryDark/20"
              >
                <ShoppingBag className="w-5 h-5" />
                أضف للسلة
              </button>
              <button
                onClick={handleBuyNowWithExtras}
                className="flex-1 bg-accent text-primaryDark py-5 rounded-2xl text-xs font-bold tracking-[0.2em] uppercase hover:bg-accent/90 transition-all shadow-xl hover:shadow-accent/20"
              >
                شراء الآن
              </button>
            </div>

            {/* Trust Bar */}
            <div className="grid grid-cols-3 gap-4 py-8 border-t border-b border-gray-50">
              <div className="flex flex-col items-center text-center gap-2">
                <Truck className="w-5 h-5 text-accent" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">شحن سريع</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 border-x border-gray-50">
                <ShieldCheck className="w-5 h-5 text-accent" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">ضمان الجودة</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RotateCcw className="w-5 h-5 text-accent" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">إرجاع سهل</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Width Tabs Section */}
        <div className="mt-24 pt-24 border-t border-gray-100">
          <div className="flex flex-col items-center">
            {/* Tabs Header */}
            <div className="flex justify-center gap-10 md:gap-20 border-b border-gray-100 w-full mb-16">
              {['الوصف', 'المواصفات', 'التقييمات', 'التوصيل'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-xs md:text-sm font-bold uppercase tracking-[0.2em] pb-6 border-b-2 transition-all relative ${activeTab === tab ? 'border-accent text-primaryDark' : 'border-transparent text-gray-300 hover:text-gray-400'}`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent" />
                  )}
                </button>
              ))}
            </div>

            <div className="w-full max-w-5xl mx-auto min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeTab === 'الوصف' && (
                    <div className="text-right px-1 md:px-4">
                      <div className="max-w-4xl mx-auto text-sm md:text-base text-gray-500 leading-8 md:leading-9 font-normal whitespace-pre-line">
                        {product.longDescription || product.description}
                      </div>
                    </div>
                  )}
                  {activeTab === 'التقييمات' && (
                    <div className="space-y-16">
                      {/* Summary */}
                      <div className="flex flex-col md:flex-row gap-12 items-center bg-gray-50/50 p-10 md:p-16 rounded-[3.5rem] border border-gray-100">
                        <div className="text-center min-w-[200px]">
                          <div className="text-7xl font-black text-primaryDark mb-4">{product.rating || 5.0}</div>
                          <div className="flex justify-center gap-1 mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-6 h-6 ${i < Math.floor(product.rating || 5) ? 'fill-accent text-accent' : 'text-gray-200'}`} />
                            ))}
                          </div>
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">بناءً على {reviews.length || 0} تقييم</div>
                        </div>

                        <div className="flex-1 w-full space-y-3">
                          {[5, 4, 3, 2, 1].map((num) => (
                            <div key={num} className="flex items-center gap-6">
                              <span className="text-xs font-bold text-gray-400 w-6">{num}</span>
                              <div className="flex-1 h-2 bg-white rounded-full overflow-hidden shadow-inner">
                                <div
                                  className="h-full bg-accent"
                                  style={{ width: `${reviews.length ? (reviews.filter(r => Math.round(r.rating) === num).length / reviews.length) * 100 : (num === 5 ? 100 : 0)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Leave a Review */}
                      <div className="bg-white border border-gray-100 p-10 md:p-16 rounded-[3.5rem] shadow-sm">
                        <h4 className="text-2xl font-bold text-primaryDark mb-10">أضف تقييمك الخاص</h4>
                        <form onSubmit={handleSubmitReview} className="space-y-8">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3 text-right">
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">الاسم الكامل</label>
                              <input
                                type="text"
                                value={newReview.customer}
                                onChange={(e) => setNewReview({ ...newReview, customer: e.target.value })}
                                placeholder="مثال: أحمد المحمد"
                                className="w-full bg-gray-50 border border-transparent rounded-[1.5rem] px-8 py-5 text-base focus:bg-white focus:border-accent transition-all outline-none"
                              />
                            </div>
                            <div className="space-y-3 text-right">
                              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">التقييم</label>
                              <div className="flex gap-4 p-5 bg-gray-50 rounded-[1.5rem]">
                                {[1, 2, 3, 4, 5].map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => setNewReview({ ...newReview, rating: num })}
                                    className={`p-1 transition-all hover:scale-125 ${newReview.rating >= num ? 'text-accent' : 'text-gray-200'}`}
                                  >
                                    <Star className={`w-8 h-8 ${newReview.rating >= num ? 'fill-current' : ''}`} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3 text-right">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">تعليقك</label>
                            <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              rows={6}
                              placeholder="شاركنا رأيك في جودة المنتج والتغليف..."
                              className="w-full bg-gray-50 border border-transparent rounded-[1.5rem] px-8 py-6 text-base focus:bg-white focus:border-accent transition-all outline-none resize-none"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="w-full md:w-auto bg-primaryDark text-white px-16 py-5 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50 shadow-xl"
                          >
                            {isSubmittingReview ? 'جاري الإرسال...' : 'إرسال التقييم'}
                          </button>
                        </form>
                      </div>

                      {/* Reviews List */}
                      <div className="space-y-12">
                        {reviews.length === 0 ? (
                          <div className="text-center py-24 bg-gray-50/50 rounded-[3.5rem] border border-dashed border-gray-200">
                            <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <p className="text-gray-400 text-lg font-medium">لا توجد تقييمات منشورة لهذا المنتج بعد. كن أول من يقيمه!</p>
                          </div>
                        ) : (
                          reviews.map((review) => (
                            <div key={review.id} className="flex gap-10 items-start border-b border-gray-50 pb-12 last:border-0">
                              <div className="w-16 h-16 rounded-[1.5rem] bg-accent/10 flex items-center justify-center text-accent font-bold text-2xl flex-shrink-0">
                                {review.customer[0]}
                              </div>
                              <div className="flex-1 space-y-4">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-xl font-bold text-primaryDark">{review.customer}</h5>
                                  <span className="text-xs text-gray-300 font-medium">{new Date(review.date).toLocaleDateString('ar-SY')}</span>
                                </div>
                                <div className="flex gap-1 text-accent">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-100'}`} />
                                  ))}
                                </div>
                                <p className="text-gray-500 text-lg leading-relaxed">{review.comment}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  {activeTab === 'المواصفات' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Render manual features */}
                      {(() => {
                        // Robust parsing for specifications if it's a string
                        let specs = product.specifications || {};
                        if (typeof specs === 'string') {
                          try {
                            specs = JSON.parse(specs);
                          } catch (e) {
                            specs = {};
                          }
                        }

                        // Robust parsing for features if it's a string
                        let featuresToRender = product.features || [];
                        if (typeof featuresToRender === 'string') {
                          try {
                            featuresToRender = JSON.parse(featuresToRender);
                          } catch (e) {
                            featuresToRender = [];
                          }
                        }

                        const hasSpecs = specs.material || specs.weight || specs.dimensions;
                        const hasFeatures = Array.isArray(featuresToRender) && featuresToRender.length > 0;

                        if (!hasSpecs && !hasFeatures) {
                          return (
                            <div className="col-span-full text-center py-20 bg-gray-50 rounded-[2.5rem]">
                              <p className="text-gray-400 text-sm font-medium">لا توجد مواصفات متوفرة لهذا المنتج حالياً</p>
                            </div>
                          );
                        }

                        return (
                          <>
                            {specs.material && (
                              <div className="flex justify-between items-center p-8 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right">الخامة المصنعة</span>
                                <span className="text-lg font-bold text-primaryDark">{specs.material}</span>
                              </div>
                            )}
                            {specs.weight && (
                              <div className="flex justify-between items-center p-8 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right">الوزن التقديري</span>
                                <span className="text-lg font-bold text-primaryDark">{specs.weight}</span>
                              </div>
                            )}
                            {specs.dimensions && (
                              <div className="flex justify-between items-center p-8 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right">الأبعاد والمقاسات</span>
                                <span className="text-lg font-bold text-primaryDark">{specs.dimensions}</span>
                              </div>
                            )}
                            {Array.isArray(featuresToRender) && featuresToRender.length > 0 && (
                              featuresToRender.filter(f => f && f.name && f.value).map((feature, idx) => (
                                <div key={`feature-${idx}`} className="flex justify-between items-center p-8 bg-gray-50 rounded-[1.5rem] border border-gray-100">
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-right">{feature.name}</span>
                                  <span className="text-lg font-bold text-primaryDark">{feature.value}</span>
                                </div>
                              ))
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                  {activeTab === 'التوصيل' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="flex gap-8 items-start p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <Truck className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-primaryDark mb-3">توصيل ملكي سريع</p>
                          <p className="text-lg text-gray-400 leading-relaxed">خلال ٢-٣ أيام عمل داخل دمشق، و٣-٥ أيام لباقي المحافظات السورية. نضمن وصول هديتكم بأعلى معايير السلامة والأناقة.</p>
                        </div>
                      </div>
                      <div className="flex gap-8 items-start p-10 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-accent/10 flex items-center justify-center flex-shrink-0">
                          <RotateCcw className="w-8 h-8 text-accent" />
                        </div>
                        <div>
                          <p className="text-xl font-bold text-primaryDark mb-3">سياسة الإرجاع المرنة</p>
                          <p className="text-lg text-gray-400 leading-relaxed">نحن نثق بجودتنا، لذا نوفر لك إمكانية الإرجاع خلال ١٤ يوماً من الاستلام في حال وجود أي ملاحظة على الجودة أو التغليف.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-40">
            <div className="flex flex-col items-center mb-16">
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] mb-4">مختاراتنا لك</span>
              <h2 className="text-3xl font-bold text-primaryDark tracking-tight">قد يعجبك أيضاً</h2>
              <div className="w-12 h-1 bg-accent mt-6 rounded-full" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((rp, idx) => (
                <ProductCard
                  key={`${rp.id}-${idx}`}
                  product={rp}
                  onAddToCart={onAddToCart}
                  onClick={onSelectProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductDetails;
