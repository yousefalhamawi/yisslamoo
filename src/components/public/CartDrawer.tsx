
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '../../types/index';
import { getColorName, getColorHex } from '../../utils/colorUtils';
import { computeDisplayPrice } from '../../utils/pricingEngine';
import { useSharedStore } from '../../store/useSharedStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Product[];
  onRemove: (cartId: string) => void;
  onUpdateQuantity: (cartId: string, delta: number) => void;
  onCheckout: () => void;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onUpdateQuantity, onCheckout }) => {
  const exchangeRate = useSharedStore((s) => s.exchangeRate);
  const getItemPrice = (item: Product) => computeDisplayPrice(item, exchangeRate);
  const total = items.reduce((sum, item) => sum + (getItemPrice(item) * (item.quantity || 1)), 0);
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const FREE_SHIPPING_THRESHOLD = 2000000; // مثال: 2 مليون ليرة للشحن المجاني
  const progress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110]"
          />
          
          {/* Drawer Content */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-[-20px_0_80px_rgba(0,0,0,0.15)] z-[120] flex flex-col"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-textMain tracking-tighter">حقيبة التسوق</h2>
                <span className="bg-primary/10 text-primary px-2.5 py-0.5 rounded-lg text-xs font-black">
                  {totalQuantity}
                </span>
              </div>
              <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-all group"
              >
                <svg className="w-5 h-5 text-gray-400 group-hover:text-textMain transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Free Shipping Progress Bar */}
            {items.length > 0 && (
              <div className="px-8 py-4 bg-gray-50/50 border-b border-gray-100">
                <div className="flex justify-between text-[11px] font-bold mb-2">
                  <span className="text-primary">
                    {progress >= 100 
                      ? 'مبروك! شحنك الآن مجاني' 
                      : `بقيت لك ${(FREE_SHIPPING_THRESHOLD - total).toLocaleString()} ليرة سورية للشحن المجاني`}
                  </span>
                  <span className="text-gray-400">هدفك: {FREE_SHIPPING_THRESHOLD.toLocaleString()} ليرة سورية</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-primary"
                  />
                  {/* Visual Cues */}
                  <div className="absolute top-0 left-[75%] w-0.5 h-full bg-white/40 z-10" title="75%" />
                  <div className="absolute top-0 left-[100%] w-0.5 h-full bg-white/40 z-10" title="100%" />
                </div>
                <div className="flex justify-between mt-2">
                  <div className={`flex flex-col items-center transition-all duration-500 ${progress >= 75 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-2 h-2 rounded-full mb-1 ${progress >= 75 ? 'bg-primary' : 'bg-gray-300'}`} />
                    <span className="text-[8px] font-black uppercase tracking-tighter">75%</span>
                  </div>
                  <div className={`flex flex-col items-center transition-all duration-500 ${progress >= 100 ? 'opacity-100' : 'opacity-30'}`}>
                    <div className={`w-2 h-2 rounded-full mb-1 ${progress >= 100 ? 'bg-primary' : 'bg-gray-300'}`} />
                    <span className="text-[8px] font-black uppercase tracking-tighter">100%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-10 h-10 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-textMain mb-2">الحقيبة فارغة</h3>
                  <p className="text-gray-400 text-sm mb-8">يبدو أنك لم تختر هداياك بعد. ابدأ استكشاف مجموعاتنا الآن.</p>
                  <button 
                    onClick={onClose}
                    className="px-8 py-3 bg-primary text-white font-bold rounded-xl hover:scale-105 transition-transform"
                  >
                    تسوق الآن
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {items.map((item, idx) => (
                    <motion.div 
                      key={item.cartId || `cart-item-${idx}`}

                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="p-8 group hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="flex gap-6">
                        {/* Image */}
                        <div className="relative w-24 h-32 flex-shrink-0">
                          <img 
                            src={item.image} 
                            className="w-full h-full object-cover rounded-2xl shadow-sm border border-gray-100" 
                            alt={item.name}
                          />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 flex flex-col">
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-textMain group-hover:text-primary transition-colors leading-tight line-clamp-2 pl-4">
                              {item.name}
                            </h3>
                            <button 
                              onClick={() => item.cartId && onRemove(item.cartId)}
                              className="text-gray-300 hover:text-red-500 transition-colors p-1 -mt-1"
                              title="إزالة"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                          
                          {/* Options Summary */}
                          <div className="mt-2 space-y-1">
                            {item.selectedColor && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">اللون</span>
                                <div className="flex items-center gap-1.5">
                                  <div 
                                    className="w-2.5 h-2.5 rounded-full border border-gray-200" 
                                    style={{ 
                                      background: getColorHex(item.selectedColor) === '#FFD700' 
                                        ? 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 45%, #B38728 70%, #FBF5B7 100%)'
                                        : getColorHex(item.selectedColor) === '#C0C0C0'
                                          ? 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 45%, #A9A9A9 70%, #E8E8E8 100%)'
                                          : getColorHex(item.selectedColor) 
                                    }} 
                                  />
                                  <span className="text-[10px] text-gray-500 font-bold">{getColorName(item.selectedColor)}</span>
                                </div>
                              </div>
                            )}
                            {item.selectedEngraving && (
                              <div className="text-[10px] text-gray-400">
                                <span className="font-bold">النقش:</span> <span className="text-primary">{item.selectedEngraving}</span>
                              </div>
                            )}
                            {item.selectedGiftWrapping && (
                              <div className="text-[10px] text-gray-400">
                                <span className="font-bold">التغليف:</span> <span className="text-primary">{item.selectedGiftWrapping}</span>
                              </div>
                            )}
                            {item.selectedGiftMessage && (
                              <div className="text-[10px] text-gray-400 line-clamp-1">
                                "{item.selectedGiftMessage}"
                              </div>
                            )}
                          </div>
                          
                          {/* Price and Quantity Controls */}
                          <div className="mt-auto pt-4 flex justify-between items-end">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-gray-400 font-bold">
                                {getItemPrice(item).toLocaleString()} × {item.quantity || 1}
                              </span>
                              <span className="text-lg font-black text-primary">
                                {(getItemPrice(item) * (item.quantity || 1)).toLocaleString()} ليرة سورية
                              </span>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center bg-gray-100 rounded-xl p-1">
                              <button 
                                onClick={() => item.cartId && onUpdateQuantity(item.cartId, -1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-gray-500 hover:text-primary"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
                                </svg>
                              </button>
                              <span className="w-8 text-center text-sm font-black text-primaryDark">
                                {item.quantity || 1}
                              </span>
                              <button 
                                onClick={() => item.cartId && onUpdateQuantity(item.cartId, 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all text-gray-500 hover:text-primary"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="p-8 bg-white border-t border-gray-100 shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between text-gray-400 text-sm font-bold">
                    <span>المجموع الفرعي</span>
                    <span>{total.toLocaleString()} ليرة سورية</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-400 text-sm font-bold">
                    <span>الشحن</span>
                    <span className={progress >= 100 ? 'text-green-500' : ''}>
                      {progress >= 100 ? 'مجاني' : 'يُحسب عند الدفع'}
                    </span>
                  </div>
                  <div className="h-px bg-gray-50 my-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-textMain font-black text-lg">الإجمالي</span>
                    <span className="text-3xl font-black text-primary">{total.toLocaleString()} ليرة سورية</span>
                  </div>
                </div>
                
                <button 
                  onClick={onCheckout}
                  className="w-full bg-accent text-primaryDark font-black py-5 rounded-2xl shadow-[0_20px_40px_-10px_rgba(255,214,10,0.4)] hover:shadow-[0_25px_50px_-10px_rgba(255,214,10,0.5)] active:scale-95 transition-all text-xl flex items-center justify-center gap-3"
                >
                  إتمام عملية الشراء
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
                
                <p className="mt-6 text-center text-[10px] text-gray-400 font-bold tracking-widest uppercase">
                  توصيل آمن وسريع • دفع مشفر بالكامل
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f3f4f6;
          border-radius: 10px;
        }
      `}</style>
    </AnimatePresence>
  );
};

export default CartDrawer;
