
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types/index';
import { ShoppingBag, X, Zap, Gift, ArrowLeft, Star, ZoomIn, X as CloseIcon } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
  onViewDetails: (p: Product) => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose, onAddToCart, onViewDetails }) => {
  const [isZoomOpen, setIsZoomOpen] = React.useState(false);
  
  if (!product) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
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
                  layoutId={`quick-view-image-${product.id}`}
                  src={product.image}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                  alt={product.name}
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  referrerPolicy="no-referrer"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-primaryDark/60 backdrop-blur-md z-[250]"
          />
          <div className="fixed inset-0 z-[260] flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-5xl bg-white rounded-[2rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden pointer-events-auto relative flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-6 left-6 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-primaryDark z-30 hover:bg-primaryDark hover:text-white transition-all shadow-xl border border-gray-100"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Product Image Section */}
              <div 
                className="w-full md:w-1/2 h-80 md:h-auto relative bg-[#F9F7F2] overflow-hidden cursor-zoom-in group"
                onClick={() => setIsZoomOpen(true)}
              >
                <motion.img 
                  layoutId={`quick-view-image-${product.id}`}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Zoom Overlay */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-500 text-primaryDark">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                
                {product.isTrending && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="absolute top-8 right-8 bg-primary text-white px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-xl"
                  >
                    الأكثر مبيعاً
                  </motion.div>
                )}
              </div>

              {/* Product Info Section */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center text-right overflow-y-auto"
              >
                <span className="text-primary font-bold text-[10px] uppercase tracking-[0.4em] mb-4 block">
                  {product.categories && product.categories.length > 0 
                    ? product.categories.join(' • ') 
                    : product.category}
                </span>
                
                <h2 className="text-4xl md:text-5xl text-primaryDark mb-4 leading-tight">
                  {product.name}
                </h2>

                <div className="flex items-center gap-3 justify-end mb-6">
                  <span className="text-xs font-black text-primaryDark">{(product.rating || 5.0).toFixed(1)}</span>
                  <div className="flex items-center gap-0.5 text-accent">
                    {[...Array(5)].map((_, i) => {
                      const starValue = i + 1;
                      const ratingValue = product.rating || 5.0;
                      const isFull = starValue <= Math.floor(ratingValue);
                      const isHalf = !isFull && (starValue - 0.5) <= ratingValue;
                      return (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${
                            isFull 
                              ? 'fill-current' 
                              : (isHalf ? 'fill-current opacity-50' : 'text-gray-100')
                          }`} 
                        />
                      );
                    })}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">({product.reviews || 0} تقييم)</span>
                </div>
                
                <div className="flex items-center gap-3 justify-end mb-8">
                  <span className="text-4xl font-bold text-primaryDark">
                    {product.price.toLocaleString()}
                  </span>
                  <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">ليرة سورية</span>
                </div>
                
                <p className="text-gray-500 text-lg mb-10 leading-relaxed font-medium">
                  {product.description || "تجربة فريدة من نوعها تجمع بين الفخامة والرقي، مصممة خصيصاً لتناسب ذوقكم الرفيع وتضفي لمسة من السحر على مناسباتكم الخاصة."}
                </p>

                <div className="space-y-4">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { onAddToCart(product); onClose(); }}
                    className="w-full bg-primaryDark text-white py-6 rounded-2xl font-bold text-lg shadow-2xl shadow-primaryDark/20 flex items-center justify-center gap-4 transition-all"
                  >
                    <span>أضف للحقيبة</span>
                    <ShoppingBag className="w-6 h-6" />
                  </motion.button>
                  
                  <button 
                    onClick={() => { onViewDetails(product); onClose(); }}
                    className="w-full bg-white text-primaryDark border-2 border-primaryDark/10 py-6 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                  >
                    <span>عرض التفاصيل الكاملة</span>
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-end gap-12">
                   <div className="flex flex-col items-center">
                      <Zap className="w-6 h-6 text-primary mb-2" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">توصيل سريع</span>
                   </div>
                   <div className="flex flex-col items-center">
                      <Gift className="w-6 h-6 text-primary mb-2" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">تغليف فاخر</span>
                   </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default QuickViewModal;
