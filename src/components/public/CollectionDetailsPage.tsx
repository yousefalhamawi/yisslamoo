
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { useCollections } from '../../hooks/useCollections';
import { useSharedStore } from '../../store/useSharedStore';
import { isProductAvailableForStore } from '../../utils/productAvailability';
import ProductCard from './ProductCard';
import { Product } from '../../types/index';

interface CollectionDetailsPageProps {
  onAddToCart: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onQuickView: (p: Product) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
}

const CollectionDetailsPage: React.FC<CollectionDetailsPageProps> = ({
  onAddToCart,
  onSelectProduct,
  onQuickView,
  wishlist,
  onToggleWishlist
}) => {
  const { collectionId } = useParams<{ collectionId: string }>();
  const { collections, loading } = useCollections();
  const { products } = useSharedStore();
  const navigate = useNavigate();

  const collection = useMemo(() => {
    return collections.find(c => c.id === collectionId);
  }, [collections, collectionId]);

  const collectionProducts = useMemo(() => {
    if (!collection) return [];
    // If the collection object has product IDs
    if (collection.products && Array.isArray(collection.products)) {
        // نُخفي المنتجات النافدة فقط، ونبقي منتجات «حسب الطلب» متاحة.
        return products.filter(
          p => collection.products.includes(p.id) && isProductAvailableForStore(p)
        );
    }
    return [];
  }, [collection, products]);

  if (loading && collections.length === 0) {
    return (
      <div className="min-h-screen pt-48 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen pt-48 text-center bg-[#FCFBFA]">
        <h2 className="text-3xl font-bold text-primaryDark mb-6">المجموعة غير موجودة</h2>
        <button 
          onClick={() => navigate('/collections')}
          className="px-8 py-3 bg-primary text-white rounded-xl"
        >
          العودة للمجموعات
        </button>
      </div>
    );
  }

  return (
      <div className="bg-[#FCFBFA] min-h-screen page-offset-lg pb-24" dir="rtl">
          {/* Header */}
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mb-20 animate-in fade-in duration-700">
              <button 
                  onClick={() => navigate('/collections')}
                  className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-12 text-sm font-bold group"
              >
                  <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  <span>العودة للمجموعات</span>
              </button>

              <div className="relative rounded-[4rem] overflow-hidden aspect-[16/9] md:aspect-[21/9] mb-16 shadow-2xl">
                  <img src={collection.image} alt={collection.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primaryDark/90 via-primaryDark/20 to-transparent" />
                  <div className="absolute inset-0 p-8 md:p-24 flex flex-col justify-end items-start text-right">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl"
                      >
                         <span className="text-accent font-bold text-xs uppercase tracking-widest mb-4 block">مجموعة حصرية</span>
                         <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">{collection.name}</h1>
                         <p className="text-white/70 text-base md:text-xl leading-relaxed font-medium">{collection.description}</p>
                      </motion.div>
                  </div>
              </div>

              {/* Products Grid */}
              <div className="flex items-end justify-between mb-16 text-right">
                  <div>
                    <span className="text-primary font-bold uppercase tracking-widest text-[10px] block mb-2">محتويات المجموعة</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-primaryDark tracking-tight">القطع المختارة</h2>
                  </div>
                  <div className="flex items-center gap-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{collectionProducts.length} منتج متاح</span>
                      <div className="w-12 h-px bg-gray-100" />
                  </div>
              </div>

              {collectionProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10 items-stretch">
                      {collectionProducts.map((product) => (
                          <div key={product.id} className="h-full">
                              <ProductCard 
                                  product={product}
                                  onAddToCart={onAddToCart}
                                  onClick={() => navigate(`/product/${product.slug}`)}
                                  onQuickView={onQuickView}
                                  isWishlisted={wishlist.includes(product.id)}
                                  onToggleWishlist={() => onToggleWishlist(product.id)}
                              />
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                        <ShoppingBag className="w-10 h-10 text-gray-200" />
                      </div>
                      <p className="text-gray-400 text-lg font-medium">لا توجد منتجات في هذه المجموعة حالياً</p>
                  </div>
              )}
          </div>
      </div>
  );
};

export default CollectionDetailsPage;
