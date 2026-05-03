import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Trash2, 
  Package, 
  LayoutGrid, 
  Check, 
  X,
  PlusCircle,
  FolderOpen,
  Loader2
} from 'lucide-react';
import { useCollections } from '../../hooks/useCollections';
import { useProducts } from '../../hooks/useProducts';
import { Collection } from '../../types/admin';
import { toast } from 'react-hot-toast';
import { cn } from '../../utils/cn';
import { ImageUpload } from '../../components/admin/ImageUpload';
import { uploadService } from '../../services/uploadService';

const CollectionsPage: React.FC = () => {
  const { collections, loading, addCollection, updateCollection, deleteCollection } = useCollections();
  const { products } = useProducts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    description: '',
    products: [] as string[],
    status: 'active' as const
  });

  const [productSearch, setProductSearch] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.sku?.toLowerCase().includes(productSearch.toLowerCase())
  );

  const toggleProduct = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter(id => id !== productId)
        : [...prev.products, productId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || (!formData.image && !imageFile)) {
      toast.error('يرجى إكمال البيانات الأساسية');
      return;
    }

    setIsUploading(true);
    try {
      let finalImageUrl = formData.image;

      if (imageFile) {
        const loadingToast = toast.loading('جاري رفع صورة المجموعة...');
        try {
          finalImageUrl = await uploadService.uploadImage(imageFile, 'collections');
          toast.dismiss(loadingToast);
        } catch (error) {
          toast.error('فشل في رفع الصورة');
          toast.dismiss(loadingToast);
          setIsUploading(false);
          return;
        }
      }

      await addCollection({ ...formData, image: finalImageUrl });
      setShowAddForm(false);
      setImageFile(null);
      setFormData({
        name: '',
        image: '',
        description: '',
        products: [],
        status: 'active'
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredCollections = collections.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10" dir="rtl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">المجموعات المختارة</h1>
          <p className="text-slate-500 font-bold mt-2">إدارة مجموعات المنتجات المميزة والخاصة</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-black transition-all shadow-xl shadow-indigo-200"
        >
          <PlusCircle className="w-5 h-5" />
          إنشاء مجموعة جديدة
        </button>
      </div>

      {/* Add/Edit Form Overlay */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-2xl font-black text-slate-900">إعداد مجموعة جديدة</h2>
                  <button onClick={() => setShowAddForm(false)} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      {/* Basic Info */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">اسم المجموعة كما سيظهر للزوار</label>
                        <input 
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          placeholder="مثلاً: باقة العيد، مجموعة الشتاء..."
                          className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-indigo-600 transition-all outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">وصف المجموعة</label>
                        <textarea 
                          value={formData.description}
                          onChange={(e) => setFormData({...formData, description: e.target.value})}
                          placeholder="نبذة مختصرة تصف محتوى المجموعة وما يميزها..."
                          rows={4}
                          className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold focus:bg-white focus:border-indigo-600 transition-all outline-none resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                      <ImageUpload 
                        value={formData.image}
                        onChange={(val) => setFormData({...formData, image: val as string})}
                        onFilesChange={(files) => setImageFile(files[0])}
                        label="الصورة الرئيسية للمجموعة"
                        description="ارفع صورة بمقاس مربّع أو بالعرض تعبّر عن المجموعة"
                      />
                    </div>
                    </div>

                    <div className="space-y-6">
                      {/* Products Selection */}
                      <div className="space-y-2 flex flex-col h-full">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block pr-2">اختر المنتجات المشمولة ({formData.products.length})</label>
                        
                        <div className="flex-1 bg-slate-50 rounded-[2rem] p-6 space-y-4 flex flex-col border border-slate-100 shadow-inner">
                          <div className="relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                              type="text"
                              value={productSearch}
                              onChange={(e) => setProductSearch(e.target.value)}
                              placeholder="ابحث عن منتج..."
                              className="w-full bg-white border-2 border-transparent rounded-xl pr-10 pl-4 py-3 text-xs font-bold focus:border-indigo-600 outline-none transition-all"
                            />
                          </div>

                          <div className="flex-1 overflow-y-auto pr-2 space-y-2 min-h-[300px] max-h-[500px] custom-scrollbar">
                            {filteredProducts.map(p => (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => toggleProduct(p.id)}
                                className={cn(
                                  "w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all group",
                                  formData.products.includes(p.id) 
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                                    : "bg-white border-transparent text-slate-600 hover:border-slate-200"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100">
                                    <img src={p.image} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[11px] font-black leading-tight line-clamp-1">{p.name}</p>
                                    <p className={cn("text-[9px] font-bold opacity-60", formData.products.includes(p.id) ? "text-white" : "text-slate-400")}>{p.sku}</p>
                                  </div>
                                </div>
                                <div className={cn(
                                  "w-5 h-5 rounded-full flex items-center justify-center border-2",
                                  formData.products.includes(p.id) ? "bg-white border-white text-indigo-600" : "border-slate-100 group-hover:border-slate-200"
                                )}>
                                  {formData.products.includes(p.id) && <Check className="w-3 h-3 font-black" />}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-10 py-4 rounded-2xl font-black text-slate-400 hover:text-slate-900 transition-all text-sm"
                    >
                      إلغاء الأمر
                    </button>
                    <button 
                      type="submit"
                      disabled={isUploading}
                      className="bg-primaryDark text-white px-12 py-4 rounded-2xl font-black text-sm hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-200 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
                      حفظ المجموعة الجديدة
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Grid */}
      <div className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-sm min-h-[600px]">
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث في المجموعات..."
              className="w-full bg-slate-50 border-2 border-transparent rounded-[1.5rem] pr-14 pl-6 py-4 text-sm font-bold focus:bg-white focus:border-indigo-600 transition-all outline-none"
            />
          </div>
          <div className="flex gap-4">
            <div className="px-6 py-2 bg-slate-50 rounded-full text-slate-400 text-[10px] font-black uppercase tracking-widest border border-slate-100">
              إجمالي المجموعات: {collections.length}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 text-slate-300">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
            <p className="font-black text-sm">جاري جلب المجموعات...</p>
          </div>
        ) : filteredCollections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-slate-300">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <FolderOpen className="w-12 h-12" />
            </div>
            <p className="font-black text-sm mb-2 text-slate-400">لا توجد مجموعات بعد</p>
            <p className="text-xs font-bold text-slate-300">ابدأ بإنشاء أول مجموعة مميزة لمتجرك</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCollections.map(collection => (
              <motion.div 
                layout
                key={collection.id} 
                className="group relative bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
              >
                <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                  <img src={collection.image} alt={collection.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute top-4 left-4 flex gap-2 translate-y-[-20px] group-hover:translate-y-0 transition-transform duration-500 delay-100">
                    <button 
                      onClick={() => deleteCollection(collection.id)}
                      className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-white transition-all shadow-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="absolute bottom-6 right-6 text-white translate-y-[20px] group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="text-lg font-black">{collection.name}</h3>
                    <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{collection.products.length} منتجات مضافة</p>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <p className="text-[11px] font-bold text-slate-400 leading-relaxed line-clamp-2">{collection.description}</p>
                  <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
                    {collection.products.slice(0, 5).map(pid => {
                      const p = products.find(prod => prod.id === pid);
                      return p ? (
                        <div key={pid} className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0">
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : null;
                    })}
                    {collection.products.length > 5 && (
                      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">
                        +{collection.products.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;
