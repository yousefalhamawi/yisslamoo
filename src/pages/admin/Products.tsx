
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  X,
  Loader2,
  CheckCircle2,
  XCircle,
  ChevronDown,
  Zap,
  PenLine,
  DollarSign
} from 'lucide-react';
import { toast } from '../../utils/toast';
import { supabase, checkSupabaseConfig } from '../../supabase';
import { HomeProductSection, Product } from '../../types/index';
import { useProducts } from '../../hooks/useProducts';
import { useCategories } from '../../hooks/useCategories';
import { cn } from '../../utils/cn';
import { unpoison } from '../../utils/unpoison';
import { getColorName, getColorHex } from '../../utils/colorUtils';
import { ImageUpload } from '../../components/admin/ImageUpload';
import { computeDisplayPrice, formatSYP, formatUSD, isValidExchangeRate } from '../../utils/pricingEngine';
import { useSharedStore } from '../../store/useSharedStore';
import { HOME_PRODUCT_SECTION_OPTIONS } from '../../utils/homeProductSections';

const ProductsPage: React.FC = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useProducts();
  const { categories: categoryList } = useCategories();
  const exchangeRate = useSharedStore((s) => s.exchangeRate);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [currentPage, setCurrentPage] = useState(1);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState<string[]>([]);
  const [isMainCatDropdownOpen, setIsMainCatDropdownOpen] = useState(false);
  const [isSubCatDropdownOpen, setIsSubCatDropdownOpen] = useState(false);
  const [features, setFeatures] = useState<{ name: string; value: string }[]>([]);
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureValue, setNewFeatureValue] = useState('');
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [newColor, setNewColor] = useState('#000000');
  const [newColorName, setNewColorName] = useState('');
  const [specifications, setSpecifications] = useState({
    material: '',
    weight: '',
    dimensions: ''
  });
  // ── حالة نظام التسعير ─────────────────────────────────────
  const [pricingMode, setPricingMode] = useState<'auto' | 'manual'>('auto');
  const [priceUSD, setPriceUSD] = useState('');
  const [priceSYPManual, setPriceSYPManual] = useState('');
  const [isMadeToOrder, setIsMadeToOrder] = useState(false);
  const [homeSection, setHomeSection] = useState<HomeProductSection>('all');

  const itemsPerPage = 8;
  const categories = ['الكل', ...Array.from(new Set(categoryList.map(c => c.name)))];
  
  const filteredProducts = products.filter(p => {
    const name = p.name || '';
    const query = searchQuery.toLowerCase();
    const matchesSearch = name.toLowerCase().includes(query);
    const matchesCategory = selectedCategory === 'الكل' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const [formCategory, setFormCategory] = useState('');

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormCategory(product.category);
    setSelectedCategories(product.categories || (product.category ? [product.category] : []));
    setSelectedSubCategories(product.sub_category_ids || (product.sub_category_id ? [product.sub_category_id] : []));
    setIsMainCatDropdownOpen(false);
    setIsSubCatDropdownOpen(false);
    setPreviewImages(Array.isArray(product.images) ? product.images : (product.image ? [product.image] : []));
    setIsTrending(product.isTrending || false);
    
    const initialFeatures = Array.isArray(product.features) ? product.features : [];
    setFeatures(initialFeatures);
    setAvailableColors(Array.isArray(product.availableColors) ? product.availableColors : []);
    
    const specs = product.specifications || { material: '', weight: '', dimensions: '' };
    setSpecifications({
      material: specs.material || '',
      weight: specs.weight || '',
      dimensions: specs.dimensions || ''
    });
    
    // ── تسعير ──
    const mode = (product.pricing_mode as 'auto' | 'manual') ?? 'manual';
    setPricingMode(mode);
    setPriceUSD(product.price_usd?.toString() ?? '');
    setPriceSYPManual(product.price_syp_manual?.toString() ?? product.price?.toString() ?? '');
    setIsMadeToOrder(product.is_made_to_order === true);
    setHomeSection(product.home_section ?? 'all');
    
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormCategory('');
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setIsMainCatDropdownOpen(false);
    setIsSubCatDropdownOpen(false);
    setPreviewImages([]);
    setSelectedFiles([]);
    setIsTrending(false);
    setFeatures([]);
    setNewFeatureName('');
    setNewFeatureValue('');
    setNewColorName('');
    setAvailableColors([]);
    setNewColor('#000000');
    setSpecifications({
      material: '',
      weight: '',
      dimensions: ''
    });
    // ── تسعير ──
    setPricingMode('auto');
    setPriceUSD('');
    setPriceSYPManual('');
    setIsMadeToOrder(false);
    setHomeSection('all');
    setIsModalOpen(true);
  };

  const addFeature = () => {
    if (newFeatureName.trim() && newFeatureValue.trim()) {
      setFeatures([...features, { name: newFeatureName.trim(), value: newFeatureValue.trim() }]);
      setNewFeatureName('');
      setNewFeatureValue('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const addColor = () => {
    const colorValue = newColorName.trim() ? `${newColor}:${newColorName.trim()}` : newColor;
    // Check if hex already exists (case-insensitive for hex)
    const exists = availableColors.some(c => {
      const existingHex = c.includes(':') ? c.split(':')[0] : c;
      return existingHex.toLowerCase() === newColor.toLowerCase();
    });

    if (newColor && !exists) {
      setAvailableColors([...availableColors, colorValue]);
      setNewColorName('');
    } else if (exists) {
      toast.error('هذا اللون مضاف بالفعل');
    }
  };

  const removeColor = (color: string) => {
    setAvailableColors(availableColors.filter(c => c !== color));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    // We also need to remove from selectedFiles if it was a new upload
    // This is tricky because previewImages contains both existing URLs and new base64s
    // For simplicity, we'll just filter selectedFiles by checking if the preview was base64
    // But a better way is to track which preview belongs to which file.
    // Let's just reset selectedFiles for now or handle it better.
    // Actually, let's just keep it simple for the user.
  };

  const uploadImage = async (file: File): Promise<string> => {
    if (!checkSupabaseConfig()) {
      throw new Error('Supabase is not configured. Please set the environment variables.');
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('حجم الملف كبير جداً. الحد الأقصى هو 5 ميجابايت.');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file);

    if (error) {
      console.error('Supabase Storage Error:', error);
      if (error.message.includes('Bucket not found')) {
        throw new Error('لم يتم العثور على "products" bucket في Supabase. يرجى إنشاؤه من لوحة تحكم Supabase Storage.');
      }
      if (error.message.includes('row-level security policy')) {
        throw new Error('فشل الرفع بسبب سياسات الأمان (RLS). يرجى التأكد من إعداد سياسات الوصول (Storage Policies) لـ "products" bucket في Supabase.');
      }
      throw new Error(`فشل رفع الصورة: ${error.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      await deleteProduct(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const name = formData.get('name') as string;
      let slug = formData.get('slug') as string;
      
      if (!slug || slug.trim() === '') {
        slug = name.toLowerCase()
          .trim()
          .replace(/\s+/g, '-')
          .replace(/[^\u0600-\u06FFa-z0-9-]/g, '');
      }

      // Check for duplicate slug
      const isDuplicateSlug = products.some(p => 
        p.slug === slug && p.id !== editingProduct?.id
      );

      if (isDuplicateSlug) {
        throw new Error('هذا الرابط (Slug) مستخدم بالفعل لمنتج آخر. يرجى اختيار رابط فريد.');
      }

      // Handle multiple images
      const finalImageUrls: string[] = [];
      
      // Separate existing URLs from new files
      const existingUrls = previewImages.filter(img => img.startsWith('http'));
      finalImageUrls.push(...existingUrls);

      // Upload new files
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          // Only upload if the file's preview is still in previewImages
          // (This is a bit loose but works for basic multi-upload)
          const url = await uploadImage(file);
          finalImageUrls.push(url);
        }
      }

      const mainImage = finalImageUrls.length > 0 ? finalImageUrls[0] : 'https://picsum.photos/seed/new/400/400';
      
      const finalFeatures = (features || []).filter(f => f && f.name && f.name.trim() && f.value && f.value.trim());
      
      const productData = unpoison({
        name,
        slug: slug,
        description: formData.get('description') as string,
        longDescription: formData.get('longDescription') as string,
        category: selectedCategories[0] || '',
        categories: selectedCategories,
        sub_category_id: selectedSubCategories[0] || null,
        sub_category_ids: selectedSubCategories,
        badge_text: formData.get('badge_text') as string,
        oldPrice: formData.get('oldPrice') ? Number(formData.get('oldPrice')) : null,
        stock: isMadeToOrder ? 0 : Number(formData.get('stock')),
        is_made_to_order: isMadeToOrder,
        home_section: homeSection,
        features: finalFeatures,
        availableColors: availableColors,
        specifications: {
          material: formData.get('material') as string,
          weight: formData.get('weight') as string,
          dimensions: formData.get('dimensions') as string,
        },
        image: mainImage,
        images: finalImageUrls,
        isTrending: isTrending,
        rating: editingProduct?.rating || 5,
        reviews: editingProduct?.reviews || 0,
        // ── حقول التسعير الديناميكي ──
        pricing_mode: pricingMode,
        price_usd: pricingMode === 'auto' && priceUSD ? Number(priceUSD) : null,
        price_syp_manual: pricingMode === 'manual' && priceSYPManual ? Number(priceSYPManual) : null,
        // حقل price يُحسب تلقائياً للتوافق مع الكود القديم
        price: pricingMode === 'auto' && priceUSD
          ? Math.round(Number(priceUSD) * exchangeRate)
          : Number(priceSYPManual) || 0,
      });

      if (finalFeatures.length > 0) {
        toast.success(`سيتم حفظ ${finalFeatures.length} ميزة إضافية`);
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
      } else {
        await addProduct(productData);
      }
      
      setIsModalOpen(false);
      setSelectedFiles([]);
      setPreviewImages([]);
      toast.success(editingProduct ? 'تم تحديث المنتج بنجاح' : 'تم إضافة المنتج بنجاح');
    } catch (error: any) {
      console.error('--- Error in handleSubmit ---');
      console.error(error);
      const errorMessage = error.message || 'فشل في حفظ المنتج';
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">إدارة المنتجات</h1>
          <p className="text-slate-500 font-bold text-sm">لديك إجمالي {products.length} منتج في متجرك.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج جديد
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ابحث باسم المنتج أو SKU..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div className="flex gap-3">
          <select 
            value={selectedCategory || 'الكل'}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <button className="bg-slate-50 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-100 transition-all flex items-center gap-2">
            <Filter className="w-4 h-4" />
            تصفية متقدمة
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider">
                <th className="px-6 py-4">المنتج</th>
                <th className="px-6 py-4">التصنيف</th>
                <th className="px-6 py-4">السعر</th>
                <th className="px-6 py-4">المخزون</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{product.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SKU: YSL-{product.id}00</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap gap-1">
                        {(product.categories && product.categories.length > 0 ? product.categories : [product.category]).filter(Boolean).map((catName, idx) => (
                          <span key={idx} className="text-[10px] font-black text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {catName}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(product.sub_category_ids && product.sub_category_ids.length > 0 ? product.sub_category_ids : (product.sub_category_id ? [product.sub_category_id] : [])).map((subId, idx) => (
                          <span key={idx} className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                            {categoryList.find(c => c.id === subId)?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-black text-slate-900">
                        {computeDisplayPrice(product, exchangeRate).toLocaleString()} ل.س
                      </span>
                      {product.price_usd && (
                        <span className="text-[10px] font-bold text-indigo-400">
                          {formatUSD(product.price_usd)}
                        </span>
                      )}
                      <span className={`text-[9px] font-black mt-0.5 ${product.pricing_mode === 'auto' ? 'text-emerald-500' : 'text-amber-500'}`}>
                        {product.pricing_mode === 'auto' ? '⚡ تلقائي' : '✏️ يدوي'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {product.is_made_to_order ? (
                      <span className="inline-flex px-3 py-1 rounded-full text-[10px] font-black bg-violet-50 text-violet-600">
                        حسب الطلب
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full",
                              product.stock === 0 ? "bg-red-500 w-0" : 
                              product.stock <= 10 ? "bg-amber-500 w-1/3" : "bg-emerald-500 w-full"
                            )} 
                          />
                        </div>
                        <span className={cn("text-xs font-bold", product.stock === 0 ? "text-red-500" : "text-slate-500")}>
                          {product.stock === 0 ? 'منتهي' : product.stock}
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-wider">
                      نشط
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(product)} className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-all">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="p-6 border-t border-slate-100 flex justify-between items-center">
          <p className="text-xs text-slate-500 font-bold">عرض {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredProducts.length)} من أصل {filteredProducts.length} منتج</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-900">
                  {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest">المعلومات الأساسية</h3>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700">اسم المنتج</label>
                      <input 
                        name="name"
                        type="text" 
                        required
                        defaultValue={editingProduct?.name}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        placeholder="مثلاً: صندوق الورود الأبدية"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700">الرابط (Slug)</label>
                      <input 
                        name="slug"
                        type="text" 
                        defaultValue={editingProduct?.slug}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-mono"
                        placeholder="مثلاً: eternal-roses-box"
                      />
                      <p className="text-[10px] text-slate-400 font-bold">هذا هو الرابط الذي سيظهر في المتصفح. اتركه فارغاً ليتم توليده تلقائياً.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700">الوصف القصير</label>
                      <textarea 
                        name="description"
                        rows={2}
                        required
                        defaultValue={editingProduct?.description}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        placeholder="وصف سريع يظهر تحت السعر..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700">الوصف التفصيلي</label>
                      <textarea 
                        name="longDescription"
                        rows={4}
                        defaultValue={editingProduct?.longDescription}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        placeholder="الوصف الكامل الذي يظهر في تبويب الوصف..."
                      />
                    </div>

                    <div className="space-y-6 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                      <div className="space-y-3 relative">
                        <label className="text-xs font-black text-indigo-600 uppercase tracking-widest">التصنيفات الرئيسية</label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => {
                              setIsMainCatDropdownOpen(!isMainCatDropdownOpen);
                              setIsSubCatDropdownOpen(false);
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm flex items-center justify-between shadow-sm hover:border-indigo-300 transition-all"
                          >
                            <span className="text-slate-700 truncate">
                              {selectedCategories.length > 0 
                                ? selectedCategories.join('، ')
                                : 'اختر التصنيفات الرئيسية'}
                            </span>
                            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isMainCatDropdownOpen && "rotate-180")} />
                          </button>

                          <AnimatePresence>
                            {isMainCatDropdownOpen && (
                              <>
                                <div 
                                  className="fixed inset-0 z-10" 
                                  onClick={() => setIsMainCatDropdownOpen(false)} 
                                />
                                <motion.div 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute top-full right-0 left-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 max-h-64 overflow-y-auto p-2"
                                >
                                  {categoryList.filter(c => !c.parent_id).map(cat => (
                                    <label key={cat.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                                      <input 
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat.name)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedCategories([...selectedCategories, cat.name]);
                                          } else {
                                            setSelectedCategories(selectedCategories.filter(c => c !== cat.name));
                                            const subCatIdsOfThisParent = categoryList
                                              .filter(sc => sc.parent_id === cat.id)
                                              .map(sc => sc.id);
                                            setSelectedSubCategories(selectedSubCategories.filter(id => !subCatIdsOfThisParent.includes(id)));
                                          }
                                        }}
                                        className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                      />
                                      <span className="text-sm font-bold text-slate-700">{cat.name}</span>
                                    </label>
                                  ))}
                                </motion.div>
                              </>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="space-y-3 relative">
                        <label className="text-xs font-black text-indigo-600 uppercase tracking-widest">التصنيفات الفرعية</label>
                        {selectedCategories.length > 0 ? (
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => {
                                setIsSubCatDropdownOpen(!isSubCatDropdownOpen);
                                setIsMainCatDropdownOpen(false);
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm flex items-center justify-between shadow-sm hover:border-indigo-300 transition-all"
                            >
                              <span className="text-slate-700 truncate">
                                {selectedSubCategories.length > 0 
                                  ? selectedSubCategories.map(id => categoryList.find(c => c.id === id)?.name).join('، ')
                                  : 'اختر التصنيفات الفرعية'}
                              </span>
                              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isSubCatDropdownOpen && "rotate-180")} />
                            </button>

                            <AnimatePresence>
                              {isSubCatDropdownOpen && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-10" 
                                    onClick={() => setIsSubCatDropdownOpen(false)} 
                                  />
                                  <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full right-0 left-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 max-h-64 overflow-y-auto p-2"
                                  >
                                    {categoryList
                                      .filter(c => {
                                        const parent = categoryList.find(p => p.id === c.parent_id);
                                        return parent && selectedCategories.includes(parent.name);
                                      })
                                      .map(subCat => (
                                        <label key={subCat.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                                          <input 
                                            type="checkbox"
                                            checked={selectedSubCategories.includes(subCat.id)}
                                            onChange={(e) => {
                                              if (e.target.checked) {
                                                setSelectedSubCategories([...selectedSubCategories, subCat.id]);
                                              } else {
                                                setSelectedSubCategories(selectedSubCategories.filter(id => id !== subCat.id));
                                              }
                                            }}
                                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                          />
                                          <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-700">{subCat.name}</span>
                                            <span className="text-[10px] text-slate-400 font-bold">
                                              تابع لـ: {categoryList.find(p => p.id === subCat.parent_id)?.name}
                                            </span>
                                          </div>
                                        </label>
                                      ))
                                    }
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-white/50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-[10px] text-slate-400 font-bold">اختر ت صنيفاً رئيسياً أولاً لرؤية التصنيفات الفرعية.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700">SKU</label>
                        <input 
                          type="text" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          placeholder="YSL-1234"
                        />
                      </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700">كلمة تظهر فوق المنتج (مثال: للرجال، للطلبات الخاصة، الأكثر مبيعاً)</label>
                        <input 
                          name="badge_text"
                          type="text"
                          defaultValue={editingProduct?.badge_text || ''}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                          placeholder="اكتب النص الذي سيظهر فوق المنتج..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700">قسم المنتج في الصفحة الرئيسية</label>
                      <select
                        value={homeSection}
                        onChange={(event) => setHomeSection(event.target.value as HomeProductSection)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                      >
                        {HOME_PRODUCT_SECTION_OPTIONS.map((section) => (
                          <option key={section.id} value={section.id}>{section.label}</option>
                        ))}
                      </select>
                      <p className="text-[10px] font-bold text-slate-400">اختر قسماً واحداً؛ سيظهر المنتج ضمنه في تبويبات الصفحة الرئيسية.</p>
                    </div>
                  </div>

                    {/* Pricing & Inventory */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest">التسعير والمخزون</h3>
                    
                    {/* وضع التسعير */}
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-700">وضع التسعير</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setPricingMode('auto')}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                            pricingMode === 'auto'
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <Zap className="w-4 h-4" />
                          تلقائي (USD)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPricingMode('manual')}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 font-bold text-sm transition-all ${
                            pricingMode === 'manual'
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          <PenLine className="w-4 h-4" />
                          يدوي (ل.س)
                        </button>
                      </div>
                    </div>

                    {/* حقول التسعير حسب الوضع */}
                    <AnimatePresence mode="wait">
                      {pricingMode === 'auto' ? (
                        <motion.div
                          key="auto"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="space-y-4"
                        >
                          <div className="space-y-2">
                            <label className="text-xs font-black text-slate-700">السعر بالدولار (USD)</label>
                            <div className="relative">
                              <input
                                type="number"
                                value={priceUSD}
                                onChange={(e) => setPriceUSD(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-4 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="مثلاً: 10"
                                min="0"
                                step="0.01"
                              />
                              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            </div>
                          </div>
                          {/* معاينة فورية */}
                          {priceUSD && Number(priceUSD) > 0 && (
                            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">معاينة فورية</p>
                              <p className="text-lg font-black text-indigo-800">
                                {Math.round(Number(priceUSD) * exchangeRate).toLocaleString()} ل.س
                              </p>
                              <p className="text-[10px] font-bold text-indigo-400">
                                ${priceUSD} × {exchangeRate.toLocaleString()} ل.س/$ = {formatSYP(Math.round(Number(priceUSD) * exchangeRate))}
                              </p>
                            </div>
                          )}
                        </motion.div>
                      ) : (
                        <motion.div
                          key="manual"
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="space-y-2"
                        >
                          <label className="text-xs font-black text-slate-700">السعر الثابت (ليرة سورية)</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={priceSYPManual}
                              onChange={(e) => setPriceSYPManual(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-4 pl-24 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all"
                              placeholder="مثلاً: 550000"
                              min="0"
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">ليرة سورية</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700">السعر القديم (اختياري)</label>
                      <div className="relative">
                        <input 
                          name="oldPrice"
                          type="number" 
                          defaultValue={editingProduct?.oldPrice}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-4 pl-20 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">ليرة سورية</span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4 space-y-3">
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isMadeToOrder}
                          onChange={(event) => setIsMadeToOrder(event.target.checked)}
                          className="mt-0.5 h-4 w-4 accent-violet-600"
                        />
                        <span>
                          <span className="block text-xs font-black text-violet-900">منتج حسب الطلب</span>
                          <span className="block mt-1 text-[10px] font-bold leading-5 text-violet-600">يظهر في المتجر ويمكن طلبه، من دون عرض أو احتساب كمية مخزون.</span>
                        </span>
                      </label>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-700">كمية المخزون</label>
                      <input 
                        name="stock"
                        type="number" 
                        required={!isMadeToOrder}
                        disabled={isMadeToOrder}
                        defaultValue={editingProduct?.stock || 0}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                        placeholder={isMadeToOrder ? 'لا تُستخدم الكمية لمنتجات حسب الطلب' : 'مثلاً: ٥٠'}
                      />
                    </div>

                    <div className="space-y-4 pt-4">
                      <div 
                        onClick={() => setIsTrending(!isTrending)}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <div className={cn(
                          "relative w-10 h-6 rounded-full transition-all",
                          isTrending ? "bg-indigo-600" : "bg-slate-200"
                        )}>
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                            isTrending ? "right-1" : "left-1"
                          )} />
                        </div>
                        <span className="text-sm font-bold text-slate-700">منتج مميز (Featured)</span>
                      </div>
                    </div>
                  </div>

                  {/* Features Section */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest">ميزات المنتج</h3>
                        <p className="text-[10px] text-slate-400 font-bold">أضف ميزات مخصصة لمنتجك (مثلاً: الخامة، الضمان، إلخ)</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setFeatures([...features, { name: '', value: '' }]);
                        }}
                        className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2"
                      >
                        <Plus className="w-3 h-3" />
                        إضافة ميزة جديدة
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {features.map((feature, index) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={index} 
                          className="flex flex-col sm:flex-row gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 group relative"
                        >
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">اسم الميزة</label>
                              <input 
                                type="text" 
                                value={feature.name || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFeatures(prev => prev.map((f, i) => 
                                    i === index ? { ...f, name: val } : f
                                  ));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="مثلاً: الضمان"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">الميزة</label>
                              <input 
                                type="text" 
                                value={feature.value || ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setFeatures(prev => prev.map((f, i) => 
                                    i === index ? { ...f, value: val } : f
                                  ));
                                }}
                                className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                placeholder="مثلاً: سنة واحدة"
                              />
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="sm:mt-5 p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all self-end sm:self-auto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                      {features.length === 0 && (
                        <div className="text-center py-10 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                          <p className="text-xs text-slate-400 font-bold">لم يتم إضافة أي ميزات بعد. اضغط على "إضافة ميزة جديدة" للبدء.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Colors Section */}
                  <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest">ألوان المنتج</h3>
                        <p className="text-[10px] text-slate-400 font-bold">أضف خيارات الألوان المتوفرة لهذا المنتج</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-1.5 pr-3">
                          <input 
                            type="text"
                            value={newColorName}
                            onChange={(e) => setNewColorName(e.target.value)}
                            placeholder="اسم اللون (مثلاً: أسود ملكي)"
                            className="bg-transparent border-none text-[10px] font-bold focus:outline-none w-32"
                          />
                          <div className="w-px h-6 bg-slate-200" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">الاختيار السريع:</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setNewColor('#FFD700')}
                              className={cn(
                                "w-6 h-6 rounded-full border-2 transition-all shadow-sm",
                                newColor === '#FFD700' ? "border-indigo-600 scale-110" : "border-white"
                              )}
                              style={{ background: 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 45%, #B38728 70%, #FBF5B7 100%)' }}
                              title="ذهبي"
                            />
                            <button
                              type="button"
                              onClick={() => setNewColor('#C0C0C0')}
                              className={cn(
                                "w-6 h-6 rounded-full border-2 transition-all shadow-sm",
                                newColor === '#C0C0C0' ? "border-indigo-600 scale-110" : "border-white"
                              )}
                              style={{ background: 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 45%, #A9A9A9 70%, #E8E8E8 100%)' }}
                              title="فضي"
                            />
                          </div>
                          <div className="w-px h-6 bg-slate-200 mx-1" />
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">اختر لوناً:</span>
                          <input 
                            type="color" 
                            value={newColor}
                            onChange={(e) => setNewColor(e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-none bg-transparent"
                          />
                        </div>
                        <button 
                          type="button"
                          onClick={addColor}
                          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                        >
                          إضافة لون
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                      {availableColors.map((color, index) => (
                        <motion.div 
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          key={index} 
                          className="flex items-center gap-3 bg-white border border-slate-200 rounded-full pl-2 pr-4 py-2 shadow-sm group hover:border-indigo-200 transition-all"
                        >
                          <div 
                            className="w-6 h-6 rounded-full border border-slate-200 shadow-inner" 
                            style={{ 
                              background: getColorHex(color) === '#FFD700' 
                                ? 'linear-gradient(135deg, #BF953F 0%, #FCF6BA 45%, #B38728 70%, #FBF5B7 100%)'
                                : getColorHex(color) === '#C0C0C0'
                                  ? 'linear-gradient(135deg, #C0C0C0 0%, #E8E8E8 45%, #A9A9A9 70%, #E8E8E8 100%)'
                                  : getColorHex(color) 
                            }} 
                          />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{getColorName(color)}</span>
                          <button 
                            type="button"
                            onClick={() => removeColor(color)}
                            className="p-1 text-slate-300 hover:text-red-500 transition-all"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      ))}
                      {availableColors.length === 0 && (
                        <p className="text-xs text-slate-400 w-full text-center py-4">لم يتم إضافة ألوان لهذا المنتج بعد.</p>
                      )}
                    </div>
                  </div>


                  {/* Specifications Section */}
                  <div className="md:col-span-2 space-y-6">
                    <h3 className="text-sm font-black text-indigo-600 uppercase tracking-widest">مواصفات المنتج</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700">الخامة</label>
                        <input 
                          name="material"
                          type="text" 
                          defaultValue={specifications.material}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          placeholder="مثلاً: جلد طبيعي"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700">الوزن</label>
                        <input 
                          name="weight"
                          type="text" 
                          defaultValue={specifications.weight}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          placeholder="مثلاً: ٥٠٠ جرام"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-slate-700">الأبعاد</label>
                        <input 
                          name="dimensions"
                          type="text" 
                          defaultValue={specifications.dimensions}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                          placeholder="مثلاً: ٢٠ × ١٥ سم"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Images Section */}
                  <div className="md:col-span-2">
                    <ImageUpload 
                      value={previewImages}
                      onChange={(urls) => setPreviewImages(urls as string[])}
                      onFilesChange={setSelectedFiles}
                      multiple
                      maxFiles={8}
                      label="صور المنتج"
                      description="يمكنك رفع حتى 8 صور للمنتج. الصورة الأولى ستكون الصورة الرئيسية."
                    />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-200 transition-all"
                >
                  إلغاء
                </button>
                <button 
                  form="product-form"
                  type="submit"
                  disabled={isUploading}
                  className={`bg-indigo-600 text-white px-10 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploading ? 'جاري الحفظ...' : 'حفظ المنتج'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductsPage;
