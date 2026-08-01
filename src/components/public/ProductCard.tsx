
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { toast } from '../../utils/toast';
import { Product } from '../../types/index';
import { ShoppingBag, Heart, Share2, Eye, Plus, Minus, Star } from 'lucide-react';
import { useCategories } from '../../hooks/useCategories';
import { getColorHex, getColorName } from '../../utils/colorUtils';
import { useSharedStore } from '../../store/useSharedStore';
import { usePricedProduct } from '../../hooks/usePricedProduct';
import { getProductCardLayout, ProductCardLayout } from '../../utils/productCardLayout';

const MAX_ENGRAVING_LENGTH = 20;

interface ProductCardProps {
  product: Product;
  onAddToCart: (p: Product) => void;
  onClick: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  layout?: ProductCardLayout;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, onClick, onQuickView, isWishlisted, onToggleWishlist, layout = 'grid' }) => {
  const { categories } = useCategories();
  const { reviews } = useSharedStore();
  const { displayPrice, displayOldPrice } = usePricedProduct(product);
  
  const productReviews = reviews.filter(r => r.productId === product.id && r.status === 'approved');
  const dynamicReviewsCount = productReviews.length;
  const dynamicRating = dynamicReviewsCount > 0 
    ? productReviews.reduce((acc, r) => acc + r.rating, 0) / dynamicReviewsCount 
    : 0;

  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.availableColors?.[0]);
  
  const subCategoryName = product.sub_category_id 
    ? categories.find(c => c.id === product.sub_category_id)?.name 
    : null;
  const [engravingText, setEngravingText] = useState('');
  const [isGiftWrapped, setIsGiftWrapped] = useState(false);
  const [selectedWrappingStyle, setSelectedWrappingStyle] = useState('كلاسيكي');
  const [giftMessage, setGiftMessage] = useState('');
  const [hoveredColor, setHoveredColor] = useState<string | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const layoutClasses = getProductCardLayout(layout);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart({
      ...product,
      selectedColor,
      selectedEngraving: engravingText || undefined,
      selectedGiftWrapping: isGiftWrapped ? selectedWrappingStyle : undefined,
      selectedGiftMessage: isGiftWrapped ? giftMessage : undefined,
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('تم نسخ الرابط للمشاركة');
    }
  };

  const renderStars = () => {
    return (
      <div className="flex items-center gap-1.5" dir="rtl">
        <span className="text-sm font-black text-primaryDark">{dynamicRating.toFixed(1)}</span>
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => {
            const starValue = i + 1;
            const isFull = starValue <= Math.floor(dynamicRating);
            const isHalf = !isFull && (starValue - 0.5) <= dynamicRating;
            
            return (
              <Star 
                key={i} 
                className={`w-3.5 h-3.5 ${
                  isFull 
                    ? 'fill-accent text-accent' 
                    : (isHalf ? 'text-accent fill-accent opacity-50' : 'text-gray-200 fill-gray-200')
                }`} 
              />
            );
          })}
        </div>
        <span className="text-[11px] font-bold text-gray-400 mr-1">({dynamicReviewsCount} تقييم)</span>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`group relative flex w-full bg-white overflow-hidden rounded-3xl border border-gray-100/50 hover:border-accent/30 transition-all duration-500 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] ${layoutClasses.card}`}
    >
      {/* Image Section */}
      <div className={`relative overflow-hidden bg-[#FBFBFB] ${layoutClasses.image}`}>
        <Link 
          to={`/product/${product.sku || product.slug || 'undefined'}`}
          className="block w-full h-full"
        >
          <img 
            src={product.image} 
            className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110" 
            alt={product.name}
            referrerPolicy="no-referrer"
          />
        </Link>
        
        {/* Floating Badges */}
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex flex-col items-end gap-1 sm:gap-2 z-10 max-w-[85%]">
          {product.badge_text && (
            <span className="bg-white/95 text-primaryDark text-[9px] sm:text-[10px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-sm truncate max-w-full">
              {product.badge_text}
            </span>
          )}
          {product.isNew && (
            <span className="bg-primaryDark text-white text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest shadow-sm">جديد</span>
          )}
          {product.discountPrice && (
            <span className="bg-accent text-primaryDark text-[9px] sm:text-[10px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest shadow-sm">خصم</span>
          )}
        </div>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 flex flex-col gap-1.5 sm:gap-2 translate-x-[-10px] opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 z-10">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(); }}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg backdrop-blur-md ${
              isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-primaryDark hover:bg-red-500 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
          </button>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onQuickView?.(product); }}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 text-primaryDark flex items-center justify-center shadow-lg backdrop-blur-md hover:bg-accent hover:text-primaryDark transition-all duration-300"
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button 
            onClick={handleShare}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 text-primaryDark flex items-center justify-center shadow-lg backdrop-blur-md hover:bg-accent hover:text-primaryDark transition-all duration-300"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Add to Cart Bar */}
        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(e); }}
            className="w-full bg-primaryDark text-white py-2.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-normal sm:tracking-[0.2em] flex items-center justify-center gap-1.5 sm:gap-3 shadow-2xl hover:bg-primaryDark/90 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            أضف للحقيبة
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className={`${layoutClasses.content} flex flex-col flex-grow text-right min-w-0`}>
        {/* Categories & SKU */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {subCategoryName && (
              <>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                  {subCategoryName}
                </span>
                <span className="text-gray-300 text-[10px] px-0.5">/</span>
              </>
            )}
            <Link 
              to={`/shop?category=${encodeURIComponent(product.category)}`}
              className="text-[11px] font-bold text-accent hover:text-primaryDark transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {product.category}
            </Link>
          </div>
          {product.sku && (
            <span className="text-[9px] font-mono font-medium text-gray-400 bg-gray-100/50 px-1.5 py-0.5 rounded" dir="ltr">
              #{product.sku}
            </span>
          )}
        </div>

        {/* Title */}
        <Link 
          to={`/product/${product.sku || product.slug || 'undefined'}`}
          className="text-[13px] sm:text-[15px] font-bold text-primaryDark mb-2 line-clamp-2 hover:text-accent transition-colors leading-normal"
        >
          {product.name}
        </Link>

        <p className={`text-xs sm:text-sm leading-6 text-gray-400 mb-3 ${layoutClasses.description}`}>
          {product.description}
        </p>

        {/* Rating */}
        <div className="flex justify-start mb-3">
          {renderStars()}
        </div>
        
        {/* Price */}
        <div className="mt-auto flex items-baseline gap-1 pt-1">
          {displayOldPrice && (
            <span className="text-[13px] font-bold text-gray-300 line-through mr-2">
              {displayOldPrice.toLocaleString()}
            </span>
          )}
          <span className="text-[17px] sm:text-[22px] font-black text-primaryDark tracking-tight">
            {displayPrice.toLocaleString()}
          </span>
          <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 mr-1">ليرة سورية</span>
        </div>


        {/* Color Options */}
        {product.availableColors && product.availableColors.length > 0 && (
          <div className="flex gap-2 mb-4 justify-end">
            {product.availableColors.map(color => (
              <button
                key={color}
                onClick={(e) => { e.stopPropagation(); setSelectedColor(color); }}
                className={`w-5 h-5 rounded-full border-2 transition-all ${selectedColor === color ? 'border-accent scale-125 shadow-sm' : 'border-transparent hover:scale-110'}`}
                style={{ 
                  background: getColorHex(color) === '#FFD700' 
                    ? 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 45%, #B38728 70%, #FBF5B7 100%)'
                    : getColorHex(color) === '#C0C0C0'
                      ? 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 45%, #A9A9A9 70%, #E8E8E8 100%)'
                      : getColorHex(color) 
                }}
                title={getColorName(color)}
              />
            ))}
          </div>
        )}

        {/* Customization Toggle */}
        {(product.canEngrave || true) && (
          <div className="mt-3 pt-3 border-t border-gray-100/60">
            <div className="w-full flex justify-end">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowCustomization(!showCustomization); }}
                className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-primaryDark transition-colors"
              >
                {showCustomization ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                <span>تخصيص الهدية</span>
              </button>
            </div>

            <AnimatePresence>
              {showCustomization && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="pt-4 space-y-4">
                    {product.canEngrave && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-gray-500">نقش الاسم</span>
                          <span className="text-[9px] text-gray-300">{engravingText.length}/{MAX_ENGRAVING_LENGTH}</span>
                        </div>
                        <input 
                          type="text"
                          placeholder="أدخل النص هنا..."
                          maxLength={MAX_ENGRAVING_LENGTH}
                          value={engravingText}
                          onChange={(e) => setEngravingText(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2 text-[10px] focus:outline-none focus:border-accent transition-all"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <button 
                        onClick={() => setIsGiftWrapped(!isGiftWrapped)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${isGiftWrapped ? 'bg-accent/5 border-accent text-primaryDark' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                      >
                        <span className="text-[10px] font-bold">تغليف كهدية</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${isGiftWrapped ? 'border-accent bg-accent' : 'border-gray-300'}`}>
                          {isGiftWrapped && <div className="w-1.5 h-1.5 rounded-full bg-primaryDark" />}
                        </div>
                      </button>

                      {isGiftWrapped && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-3 pt-2"
                        >
                          <div className="flex gap-2">
                            {['كلاسيكي', 'ملكي', 'عصري'].map(style => (
                              <button
                                key={style}
                                onClick={() => setSelectedWrappingStyle(style)}
                                className={`flex-1 py-2 rounded-lg text-[8px] font-bold transition-all ${selectedWrappingStyle === style ? 'bg-primaryDark text-white' : 'bg-white border border-gray-100 text-gray-400'}`}
                              >
                                {style}
                              </button>
                            ))}
                          </div>
                          <textarea 
                            placeholder="رسالة الهدية..."
                            value={giftMessage}
                            onChange={(e) => setGiftMessage(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-xl px-4 py-2 text-[10px] min-h-[60px] resize-none focus:outline-none focus:border-accent transition-all"
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
