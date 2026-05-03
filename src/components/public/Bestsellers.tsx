
import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../types/index';
import ProductCard from './ProductCard';
import { ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';

interface BestsellersProps {
  products: Product[];
  onAddToCart: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  onViewAll: () => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
}

const Bestsellers: React.FC<BestsellersProps> = ({ products, onAddToCart, onSelectProduct, onQuickView, onViewAll, wishlist, onToggleWishlist }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trendingProducts = products.filter(p => p.isTrending);

  const scroll = (direction: 'next' | 'prev') => {
    if (scrollRef.current) {
      const scrollAmount = 450;
      scrollRef.current.scrollBy({
        left: direction === 'next' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-40 bg-[#FCFBFA] overflow-hidden relative">
      <div className="container mx-auto px-6 lg:px-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-24 text-right gap-12">
          
          <div className="relative order-1">
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6"
            >
              <span className="text-[10px] tracking-[0.4em] text-primary uppercase font-bold">مختارات الصفوة</span>
              <div className="w-12 h-px bg-primary"></div>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-5xl lg:text-7xl text-primaryDark leading-tight tracking-tight"
            >
              الأكثر مبيعاً <br />
              <span className="text-gray-300 font-light text-4xl lg:text-5xl">لهذا الموسم</span>
            </motion.h2>
          </div>

          {/* Navigation Controls */}
          <div className="flex gap-6 order-2 items-center mb-4">
            <button 
              onClick={() => scroll('prev')}
              className="w-14 h-14 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary hover:bg-white hover:shadow-xl transition-all duration-500"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <button 
              onClick={() => scroll('next')}
              className="w-14 h-14 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary hover:bg-white hover:shadow-xl transition-all duration-500"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Products Scroller */}
        <div 
          ref={scrollRef}
          className="flex gap-12 overflow-x-auto pb-24 pt-10 snap-x snap-mandatory hide-scrollbar px-2"
          style={{ scrollPaddingRight: '1rem' }}
        >
          {trendingProducts.map((product, index) => (
            <motion.div 
              key={`${product.id}-${index}`} 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.8 }}
              className="min-w-[320px] sm:min-w-[400px] snap-center relative group"
            >
              <div className="absolute -top-12 -left-4 text-[8rem] text-primary/[0.03] select-none pointer-events-none group-hover:text-primary/[0.06] transition-all duration-700">
                0{index + 1}
              </div>
              
              <ProductCard 
                product={product} 
                onAddToCart={onAddToCart} 
                onClick={onSelectProduct}
                onQuickView={onQuickView}
                isWishlisted={wishlist.includes(product.id)}
                onToggleWishlist={() => onToggleWishlist(product.id)}
              />
            </motion.div>
          ))}
          
          {/* View All Card */}
          <motion.div 
            className="min-w-[320px] sm:min-w-[400px] snap-center flex items-center justify-center p-4"
          >
            <button 
              onClick={onViewAll}
              className="w-full aspect-[4/5] rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center gap-8 group hover:bg-white hover:border-primary transition-all duration-700"
            >
              <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-2xl group-hover:shadow-primary/20">
                <ArrowLeft className="w-8 h-8" />
              </div>
              <div className="text-center">
                <span className="text-2xl text-primaryDark block mb-2">اكتشف المزيد</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">تصفح المجموعة كاملة</span>
              </div>
            </button>
          </motion.div>
        </div>
      </div>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default Bestsellers;
