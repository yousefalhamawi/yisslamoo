
import React from 'react';
import { motion } from 'framer-motion';
import { Product } from '../../types/index';
import { PRODUCTS } from '../../mockData/initialData';
import ProductCard from './ProductCard';

interface WishlistPageProps {
  products: Product[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  onAddToCart: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  onGoShopping: () => void;
}

const WishlistPage: React.FC<WishlistPageProps> = ({ 
  products,
  wishlist, 
  onToggleWishlist, 
  onAddToCart, 
  onSelectProduct,
  onQuickView,
  onGoShopping
}) => {
  const wishlistProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="bg-white min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-6">
        {/* Page Header */}
        <div className="mb-16 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-textMain mb-4"
          >
            قائمة أمنياتك
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg"
          >
            هنا تجد كافة الهدايا التي نالت إعجابك وتفكر في اقتنائها لاحقاً.
          </motion.p>
        </div>

        {wishlistProducts.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch"
          >
            {wishlistProducts.map(product => (
              <div key={product.id} className="h-full">
                <ProductCard 
                  product={product}
                  onAddToCart={onAddToCart}
                  onClick={onSelectProduct}
                  onQuickView={onQuickView}
                  isWishlisted={true}
                  onToggleWishlist={() => onToggleWishlist(product.id)}
                />
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200"
          >
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm text-gray-200">
               <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
               </svg>
            </div>
            <h3 className="text-2xl font-bold text-textMain mb-4">قائمة أمنياتك فارغة</h3>
            <p className="text-gray-400 max-w-md mx-auto mb-10 leading-relaxed">
              يبدو أنك لم تقم بإضافة أي هدايا لمفضلتك بعد. ابدأ الآن باكتشاف مجموعتنا الفريدة.
            </p>
            <button 
              onClick={onGoShopping}
              className="bg-primary text-white font-bold px-12 py-5 rounded-premium shadow-xl shadow-primary/20 hover:scale-105 transition-all"
            >
              ابدأ التسوق الآن
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
