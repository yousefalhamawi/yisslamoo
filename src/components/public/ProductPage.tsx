
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, ChevronDown, LayoutGrid, List, Filter, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '../../types/index';
import { Category } from '../../types/admin';
import ProductCard from './ProductCard';
import { cn } from '../../utils/cn';

interface ProductPageProps {
  products: Product[];
  categories: Category[];
  onAddToCart: (p: Product) => void;
  onSelectProduct: (p: Product) => void;
  onQuickView?: (p: Product) => void;
  initialCategory?: string;
  onCategoryChange?: (category: string) => void;
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ 
  products,
  categories: categoryList,
  onAddToCart, 
  onSelectProduct, 
  onQuickView,
  initialCategory = 'الكل',
  onCategoryChange,
  wishlist,
  onToggleWishlist
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('default');

  const maxProductPrice = useMemo(() => {
    if (!products || products.length === 0) return 5000000;
    return Math.max(...products.map(p => p.price));
  }, [products]);

  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const maxVal = products && products.length > 0 ? Math.max(...products.map(p => p.price)) : 5000000;
    return [0, maxVal];
  });
  const [hasInitializedPrice, setHasInitializedPrice] = useState(false);

  useEffect(() => {
    if (products && products.length > 0 && !hasInitializedPrice) {
      const maxVal = Math.max(...products.map(p => p.price));
      setPriceRange([0, maxVal]);
      setHasInitializedPrice(true);
    }
  }, [products, hasInitializedPrice]);

  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setSelectedCategory(initialCategory);
    setSelectedSubCategory(null);
  }, [initialCategory]);

  const mainCategories = useMemo(() => {
    return categoryList.filter(c => !c.parent_id && c.status === 'active');
  }, [categoryList]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesCategory = selectedCategory === 'الكل';
      
      if (!matchesCategory) {
        // Find the selected category object to get its ID
        const selectedCatObj = categoryList.find(c => c.name === selectedCategory);
        
        if (selectedSubCategory) {
          // If a sub-category is specifically selected
          const subCatObj = categoryList.find(c => c.id === selectedSubCategory);
          
          matchesCategory = 
            (p.sub_category_ids && p.sub_category_ids.includes(selectedSubCategory)) ||
            (p.sub_category_id === selectedSubCategory) || 
            (subCatObj && (p.category === subCatObj.name || p.category === subCatObj.id));
        } else if (selectedCatObj) {
          // If a main category is selected, show products that:
          // 1. Are in the selected category
          // 2. Or belong to any sub-category of the selected category
          const isDirectMatch = 
            (p.categories && p.categories.includes(selectedCategory)) ||
            (p.category === selectedCategory || p.category === selectedCatObj.id);
          
          const subCategoryOfThisMainIds = categoryList
            .filter(c => c.parent_id === selectedCatObj.id)
            .map(c => c.id);
            
          const isSubMatch = 
            (p.sub_category_ids && p.sub_category_ids.some(id => subCategoryOfThisMainIds.includes(id))) ||
            (p.sub_category_id && subCategoryOfThisMainIds.includes(p.sub_category_id));
          
          matchesCategory = isDirectMatch || isSubMatch;
        } else {
          matchesCategory = (p.categories && p.categories.includes(selectedCategory)) || (p.category === selectedCategory);
        }
      }
      
      const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
      return matchesSearch && matchesCategory && matchesPrice;
    });

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'popularity') result.sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0));
    
    return result;
  }, [searchQuery, selectedCategory, selectedSubCategory, sortBy, priceRange, products, categoryList]);

  return (
    <div className="bg-[#FCFBFA] min-h-screen pt-48 lg:pt-56 pb-24">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Editorial Header */}
        <div className="relative mb-24 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.5em] mb-6 block">
              مجموعتنا الحصرية
            </span>
            <h1 className="text-5xl md:text-8xl text-primaryDark mb-8 tracking-tight">
              فن الإهداء
            </h1>
            <div className="w-24 h-[1px] bg-primary/20 mx-auto mb-8" />
            <p className="max-w-2xl mx-auto text-gray-500 text-base md:text-lg leading-relaxed font-medium">
              اكتشف عالمًا من الرقي والجمال، حيث كل قطعة تحكي قصة حب وتقدير. اختر من بين مجموعتنا المختارة بعناية لتجعل لحظاتكم لا تُنسى.
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col lg:flex-row gap-20">
          {/* Refined Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0 space-y-10 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] self-start">
            {/* Search */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-primaryDark uppercase tracking-widest pb-3 border-b border-primary/10 flex items-center justify-between">
                <span>البحث</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              </h3>
              <div className="relative group/search">
                <input 
                  type="text" 
                  dir="rtl"
                  placeholder="ابحث عن قطعة فنية..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#FCFBFA] border border-gray-100 rounded-2xl py-4 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-right text-sm shadow-sm text-textMain placeholder:text-gray-400 font-bold"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within/search:text-primary transition-colors" />
              </div>
            </div>

            {/* Categories */}
            <div dir="rtl" className="space-y-4 text-right">
              <h3 className="text-xs font-black text-primaryDark uppercase tracking-widest pb-3 border-b border-primary/10 flex items-center justify-between">
                <span>التصنيفات</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory('الكل');
                    setSelectedSubCategory(null);
                    if (onCategoryChange) onCategoryChange('الكل');
                  }}
                  className={cn(
                    "w-full px-5 py-4 rounded-2xl transition-all duration-300 flex items-center justify-between group border text-right",
                    selectedCategory === 'الكل' 
                      ? 'bg-primaryDark text-white border-primaryDark shadow-lg shadow-primary/15' 
                      : 'bg-[#FCFBFA] text-textMain border-gray-100 hover:border-primary/20 hover:bg-primary/[0.01]'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-1 rounded-lg transition-all duration-300",
                      selectedCategory === 'الكل' ? "bg-white/20 text-white" : "bg-primary/5 text-primary group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                      {products.length}
                    </span>
                    <ChevronLeft size={14} className={cn(
                      "transition-all duration-300",
                      selectedCategory === 'الكل' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                    )} />
                  </div>
                  <span className="font-bold text-sm">الكل</span>
                </button>

                {mainCategories.map((cat) => {
                  const subCategoryIds = categoryList.filter(c => c.parent_id === cat.id).map(c => c.id);
                  const catProductCount = products.filter(p => 
                    (p.categories && p.categories.includes(cat.name)) ||
                    p.category === cat.name || 
                    p.category === cat.id || 
                    (p.sub_category_ids && p.sub_category_ids.some(id => subCategoryIds.includes(id))) ||
                    (p.sub_category_id && subCategoryIds.includes(p.sub_category_id))
                  ).length;
                  const isSelected = selectedCategory === cat.name;
                  const subCats = categoryList.filter(c => c.parent_id === cat.id && c.status === 'active');
                  
                  return (
                    <div key={cat.id} className="space-y-1.5">
                      <button
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          setSelectedSubCategory(null);
                          if (onCategoryChange) onCategoryChange(cat.name);
                        }}
                        className={cn(
                          "w-full px-5 py-4 rounded-2xl transition-all duration-300 flex items-center justify-between group border text-right",
                          isSelected && !selectedSubCategory
                            ? 'bg-primaryDark text-white border-primaryDark shadow-lg shadow-primary/15' 
                            : isSelected
                              ? 'bg-primary/5 text-primaryDark border-primary/20'
                              : 'bg-[#FCFBFA] text-textMain border-gray-100 hover:border-primary/20 hover:bg-primary/[0.01]'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-1 rounded-lg transition-all duration-300",
                            isSelected && !selectedSubCategory ? "bg-white/20 text-white" : "bg-primary/5 text-primary group-hover:bg-primary/10 group-hover:text-primary"
                          )}>
                            {catProductCount}
                          </span>
                          {subCats.length > 0 ? (
                            <ChevronDown className={cn(
                              "w-4 h-4 transition-all duration-300",
                              isSelected ? "rotate-180 text-primary" : "text-slate-450"
                            )} />
                          ) : (
                            <ChevronLeft size={14} className={cn(
                              "transition-all duration-300",
                              isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
                            )} />
                          )}
                        </div>
                        <span className="font-bold text-sm">{cat.name}</span>
                      </button>

                      {/* Sub-categories */}
                      <AnimatePresence>
                        {isSelected && subCats.length > 0 && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mr-4 pr-3 border-r-2 border-primary/15 space-y-1 overflow-hidden py-2"
                          >
                            {subCats.map((sub) => {
                              const subProductCount = products.filter(p => 
                                (p.sub_category_ids && p.sub_category_ids.includes(sub.id)) ||
                                p.sub_category_id === sub.id
                              ).length;
                              const isSubSelected = selectedSubCategory === sub.id;
                              return (
                                <button
                                  key={sub.id}
                                  onClick={() => setSelectedSubCategory(sub.id)}
                                  className={cn(
                                    "w-full px-4 py-2.5 rounded-xl transition-all duration-200 text-xs font-bold flex items-center justify-between group",
                                    isSubSelected
                                      ? 'bg-primary/10 text-primary'
                                      : 'text-slate-500 hover:text-primary hover:bg-primary/5'
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    {isSubSelected && <div className="w-1 h-1 rounded-full bg-primary" />}
                                    <span>{sub.name}</span>
                                  </div>
                                  <span className={cn(
                                    "text-[9px] font-bold px-1.5 py-0.5 rounded transition-colors",
                                    isSubSelected ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-400"
                                  )}>
                                    {subProductCount}
                                  </span>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-primaryDark uppercase tracking-widest pb-3 border-b border-primary/10 flex items-center justify-between">
                <span>نطاق السعر</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              </h3>
              <div className="space-y-6 px-1">
                <div className="flex items-center justify-between text-xs font-bold text-gray-400">
                  <span className="text-[#1A0E2B]">{priceRange[1].toLocaleString()} ل.س</span>
                  <span className="text-gray-400">الحد الأقصى</span>
                </div>
                
                <input 
                  type="range" 
                  min="0" 
                  max={maxProductPrice} 
                  step={Math.max(1000, Math.floor(maxProductPrice / 100))}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primaryDark focus:outline-none"
                  style={{
                    background: `linear-gradient(to left, #4C1D95 ${((priceRange[1] - 0) / (maxProductPrice - 0)) * 100}%, #f3f4f6 0%)`
                  }}
                />
                
                <div className="grid grid-cols-2 gap-3" dir="rtl">
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-400 font-bold block pr-1">من (ل.س)</span>
                    <input 
                      type="number" 
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-full bg-[#FCFBFA] border border-gray-100 rounded-xl py-3 px-2 text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-textMain shadow-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-gray-400 font-bold block pr-1">إلى (ل.س)</span>
                    <input 
                      type="number" 
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full bg-[#FCFBFA] border border-gray-100 rounded-xl py-3 px-2 text-center text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all text-textMain shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-6 bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50">
              <div className="flex items-center gap-6">
                <div className="flex bg-gray-50 p-1.5 rounded-xl">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-primaryDark shadow-sm' : 'text-gray-400 hover:text-primaryDark'}`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white text-primaryDark shadow-sm' : 'text-gray-400 hover:text-primaryDark'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
                <div className="h-8 w-[1px] bg-gray-100" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {filteredProducts.length} منتج متاح
                </span>
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full sm:w-56 bg-gray-50 border-none rounded-xl px-6 py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all text-right text-xs font-bold appearance-none cursor-pointer"
                  >
                    <option value="default">الأكثر ملاءمة</option>
                    <option value="popularity">الأكثر شعبية</option>
                    <option value="price-low">السعر: من الأقل</option>
                    <option value="price-high">السعر: من الأعلى</option>
                  </select>
                  <ChevronDown className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                
                <button 
                  onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center justify-center gap-3 bg-primaryDark text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-primaryDark/20"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>الفلاتر</span>
                </button>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className={`grid gap-10 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {filteredProducts.map((product, idx) => (
                  <ProductCard 
                    key={`${product.id}-${idx}`}
                    product={product}
                    onAddToCart={onAddToCart}
                    onClick={onSelectProduct}
                    onQuickView={onQuickView}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={() => onToggleWishlist(product.id)}
                  />
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-40 bg-white rounded-[3rem] border border-gray-100 shadow-sm"
              >
                <div className="w-28 h-28 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-10">
                  <ShoppingBag className="w-12 h-12 text-gray-200" />
                </div>
                <h3 className="text-3xl text-primaryDark mb-6">لم نجد ما تبحث عنه</h3>
                <p className="text-gray-400 text-base max-w-xs mx-auto mb-12 leading-relaxed font-medium">
                  للأسف لا توجد نتائج تطابق خياراتك الحالية. جرب تغيير كلمات البحث أو الفلاتر.
                </p>
                <button 
                  onClick={() => {setSearchQuery(''); setSelectedCategory('الكل'); setPriceRange([0, 5000000]);}}
                  className="px-12 py-5 bg-primaryDark text-white rounded-full text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-primary transition-all shadow-2xl shadow-primaryDark/10"
                >
                  إعادة ضبط البحث
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Mobile Filter Drawer */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileFilters(false)}
              className="fixed inset-0 bg-primaryDark/40 backdrop-blur-md z-[200] lg:hidden"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 w-full max-w-sm bg-white z-[210] lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-10 flex items-center justify-between border-b border-gray-50">
                <h3 className="text-2xl text-primaryDark">تصفية النتائج</h3>
                <button 
                  onClick={() => setShowMobileFilters(false)} 
                  className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-primaryDark transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10 space-y-16 text-right">
                {/* Search */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-8 border-b border-gray-50 pb-2">البحث</h4>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="عن ماذا تبحث؟"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-2xl px-8 py-5 pr-14 text-right focus:ring-2 focus:ring-primary/20 transition-all text-sm font-bold"
                    />
                    <Search className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                  </div>
                </div>

                {/* Categories */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-8 border-b border-gray-50 pb-2">التصنيفات</h4>
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        setSelectedCategory('الكل');
                        setSelectedSubCategory(null);
                        if (onCategoryChange) onCategoryChange('الكل');
                      }}
                      className={cn(
                        "w-full text-right px-6 py-5 rounded-2xl transition-all duration-500 flex items-center justify-between group border",
                        selectedCategory === 'الكل' 
                          ? 'bg-primaryDark text-white border-primaryDark shadow-xl shadow-primaryDark/20' 
                          : 'bg-white text-gray-500 border-gray-100'
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <span className={cn(
                          "text-xs font-bold px-3 py-1.5 rounded-xl transition-all duration-500",
                          selectedCategory === 'الكل' ? "bg-white/20 text-white" : "bg-gray-50 text-gray-400"
                        )}>
                          {products.length}
                        </span>
                        <ChevronLeft className={cn(
                          "w-4 h-4 transition-all duration-500",
                          selectedCategory === 'الكل' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                        )} />
                      </div>
                      <span className="font-bold tracking-wide">الكل</span>
                    </button>

                    {mainCategories.map(cat => {
                      const subCats = categoryList.filter(c => c.parent_id === cat.id && c.status === 'active');
                      const subCategoryOfThisMainIds = subCats.map(c => c.id);
                      const isSelected = selectedCategory === cat.name;
                      const catProductCount = products.filter(p => 
                        (p.categories && p.categories.includes(cat.name)) ||
                        p.category === cat.name || 
                        p.category === cat.id || 
                        (p.sub_category_ids && p.sub_category_ids.some(id => subCategoryOfThisMainIds.includes(id))) ||
                        (p.sub_category_id && subCategoryOfThisMainIds.includes(p.sub_category_id))
                      ).length;

                      return (
                        <div key={cat.id} className="space-y-2">
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.name);
                              setSelectedSubCategory(null);
                              if (onCategoryChange) onCategoryChange(cat.name);
                            }}
                            className={cn(
                              "w-full text-right px-6 py-5 rounded-2xl transition-all duration-500 flex items-center justify-between group border",
                              isSelected && !selectedSubCategory
                                ? 'bg-primaryDark text-white border-primaryDark shadow-xl shadow-primaryDark/20' 
                                : isSelected
                                  ? 'bg-primary/5 text-primaryDark border-primary/20'
                                  : 'bg-white text-gray-500 border-gray-100'
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <span className={cn(
                                "text-xs font-bold px-3 py-1.5 rounded-xl transition-all duration-500",
                                isSelected && !selectedSubCategory ? "bg-white/20 text-white" : "bg-gray-50 text-gray-400"
                              )}>
                                {catProductCount}
                              </span>
                              {subCats.length > 0 ? (
                                <ChevronDown className={cn(
                                  "w-4 h-4 transition-all duration-500",
                                  isSelected ? "rotate-180 text-primary" : "text-gray-300"
                                )} />
                              ) : (
                                <ChevronLeft className={cn(
                                  "w-4 h-4 transition-all duration-500",
                                  isSelected ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                                )} />
                              )}
                            </div>
                            <span className="font-bold tracking-wide">{cat.name}</span>
                          </button>

                          {/* Sub-categories on Mobile */}
                          <AnimatePresence>
                            {isSelected && subCats.length > 0 && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mr-4 pr-4 border-r-2 border-primary/10 space-y-1 overflow-hidden py-1"
                              >
                                {subCats.map(sub => {
                                  const subProductCount = products.filter(p => 
                                    (p.sub_category_ids && p.sub_category_ids.includes(sub.id)) ||
                                    p.sub_category_id === sub.id
                                  ).length;
                                  return (
                                    <button
                                      key={sub.id}
                                      onClick={() => setSelectedSubCategory(sub.id)}
                                      className={cn(
                                        "w-full text-right px-4 py-3 rounded-xl transition-all text-[11px] font-bold flex items-center justify-between group",
                                        selectedSubCategory === sub.id
                                          ? 'bg-primary/10 text-primary'
                                          : 'text-gray-400 hover:text-primary hover:bg-primary/5'
                                      )}
                                    >
                                      <span className={cn(
                                        "text-[9px] px-1.5 py-0.5 rounded-md",
                                        selectedSubCategory === sub.id ? "bg-primary/20 text-primary" : "bg-gray-50 text-gray-300"
                                      )}>
                                        {subProductCount}
                                      </span>
                                      <span>{sub.name}</span>
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <h4 className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mb-8 border-b border-gray-50 pb-2">نطاق السعر</h4>
                  <div className="space-y-8">
                    <input 
                      type="range" 
                      min="0" 
                      max={maxProductPrice} 
                      step={Math.max(1000, Math.floor(maxProductPrice / 100))}
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-primaryDark"
                    />
                    <div className="flex items-center justify-between text-sm font-bold text-primaryDark">
                      <span>{priceRange[1].toLocaleString()} ليرة</span>
                      <span>{priceRange[0].toLocaleString()} ليرة</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 border-t border-gray-50 bg-gray-50/50">
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full bg-primaryDark text-white font-bold py-6 rounded-2xl shadow-2xl shadow-primaryDark/20 transition-all hover:bg-primary text-lg uppercase tracking-widest mb-6"
                >
                  تطبيق الفلاتر
                </button>
                <button 
                  onClick={() => {setSearchQuery(''); setSelectedCategory('الكل'); setPriceRange([0, maxProductPrice]); setShowMobileFilters(false);}}
                  className="w-full text-gray-400 font-bold text-[10px] uppercase tracking-widest hover:text-primaryDark transition-colors"
                >
                  إعادة ضبط الكل
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductPage;

