
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Upload
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCategories } from '../../hooks/useCategories';
import { useProducts } from '../../hooks/useProducts';
import { Category } from '../../types/admin';
import { uploadService } from '../../services/uploadService';
import { ImageUpload } from '../../components/admin/ImageUpload';
import { CATEGORY_ICON_OPTIONS, resolveCategoryIcon } from '../../constants/categoryIcons';

const CategoriesPage: React.FC = () => {
  const { categories, loading: categoriesLoading, addCategory, updateCategory, deleteCategory } = useCategories();
  const { products, loading: productsLoading } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState<string>('');

  const loading = categoriesLoading || productsLoading;

  const getProductCount = (category: Category) => {
    // If it's a sub-category
    if (category.parent_id) {
      return products.filter(p => 
        (p.sub_category_ids && p.sub_category_ids.includes(category.id)) ||
        p.sub_category_id === category.id || 
        p.category === category.name || 
        p.category === category.id
      ).length;
    }

    // If it's a main category
    const subCategoryIdsOfThisParent = categories
      .filter(c => c.parent_id === category.id)
      .map(c => c.id);

    return products.filter(p => 
      (p.categories && p.categories.includes(category.name)) ||
      p.category === category.name || 
      p.category === category.id ||
      (p.sub_category_ids && p.sub_category_ids.some(id => subCategoryIdsOfThisParent.includes(id))) ||
      (p.sub_category_id && subCategoryIdsOfThisParent.includes(p.sub_category_id))
    ).length;
  };

  const filteredCategories = categories.filter(cat => {
    const name = cat.name || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query);
  });

  const sortedCategories = useMemo(() => {
    const mainCats = filteredCategories.filter(c => !c.parent_id);
    const result: Category[] = [];
    
    mainCats.forEach(main => {
      result.push(main);
      const subs = filteredCategories.filter(c => c.parent_id === main.id);
      result.push(...subs);
    });

    // Add any orphans (subs without parents in the filtered list)
    const orphans = filteredCategories.filter(c => c.parent_id && !mainCats.find(m => m.id === c.parent_id));
    result.push(...orphans);

    return result;
  }, [filteredCategories]);

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setImagePreview(category.image);
    setImageFile(null);
    setSelectedIcon(category.icon || '');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) {
      await deleteCategory(id);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const formData = new FormData(e.currentTarget);
      let imageUrl = editingCategory?.image || '';

      if (imageFile) {
        imageUrl = await uploadService.uploadImage(imageFile);
      }

      const categoryData: Omit<Category, 'id'> = {
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        image: imageUrl || `https://picsum.photos/seed/${Math.random()}/100/100`,
        status: formData.get('status') === 'on' ? 'active' : 'inactive' as 'active' | 'inactive',
        parent_id: formData.get('parent_id') as string || null,
        icon: (formData.get('icon') as string) || null,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData);
      } else {
        await addCategory(categoryData);
      }
      setIsModalOpen(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">إدارة التصنيفات</h1>
          <p className="text-slate-500 font-bold text-sm">نظم منتجاتك في تصنيفات واضحة وجذابة.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCategory(null);
            setSelectedIcon('');
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة تصنيف جديد
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="ابحث باسم التصنيف..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-black uppercase tracking-wider">
                <th className="px-6 py-4">التصنيف</th>
                <th className="px-6 py-4">الرابط (Slug)</th>
                <th className="px-6 py-4">عدد المنتجات</th>
                <th className="px-6 py-4">الحالة</th>
                <th className="px-6 py-4">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedCategories.map((cat) => (
                <tr key={cat.id} className={cn(
                  "hover:bg-slate-50 transition-all",
                  cat.parent_id ? "bg-slate-50/30" : ""
                )}>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "flex items-center gap-4",
                      cat.parent_id ? "mr-8" : ""
                    )}>
                      {cat.parent_id && (
                        <div className="w-4 h-4 border-r-2 border-b-2 border-slate-200 rounded-br-lg -mt-4" />
                      )}
                      <div className="w-10 h-10 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-sm font-black text-slate-900",
                          cat.parent_id ? "text-slate-600" : ""
                        )}>{cat.name}</span>
                        {cat.parent_id && (
                          <span className="text-[10px] font-bold text-indigo-500">
                            فرعي من: {categories.find(c => c.id === cat.parent_id)?.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-slate-400" dir="ltr">/{cat.slug}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-black text-slate-700">{getProductCount(cat)} منتج</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 w-fit",
                      cat.status === 'active' ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                    )}>
                      {cat.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {cat.status === 'active' ? 'نشط' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(cat)} className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h2 className="text-xl font-black text-slate-900">
                    {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                  </h2>
                  <button onClick={() => {
                    setIsModalOpen(false);
                    setImageFile(null);
                    setImagePreview(null);
                  }} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  {/* Image Upload */}
                  <ImageUpload 
                    value={imagePreview || ''}
                    onChange={(val) => setImagePreview(val as string)}
                    onFilesChange={(files) => setImageFile(files[0])}
                    label="صورة التصنيف"
                    description="يفضل استخدام صورة مربعة (1:1)"
                  />

                  <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest">اسم التصنيف</label>
                  <input 
                    name="name"
                    type="text" 
                    required
                    defaultValue={editingCategory?.name}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    placeholder="مثلاً: هدايا فاخرة"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest">أيقونة التصنيف</label>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    تظهر بجانب اسم التصنيف في المتجر. إن لم تختر شيئاً سيتم اختيارها تلقائياً حسب الاسم.
                  </p>
                  <input type="hidden" name="icon" value={selectedIcon} />
                  <div className="grid grid-cols-6 sm:grid-cols-8 gap-2 max-h-44 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setSelectedIcon('')}
                      title="تلقائي حسب الاسم"
                      aria-pressed={selectedIcon === ''}
                      className={`aspect-square rounded-lg flex items-center justify-center text-[9px] font-bold transition-all ${
                        selectedIcon === ''
                          ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                          : 'bg-white text-slate-400 border border-slate-200 hover:border-indigo-400'
                      }`}
                    >
                      تلقائي
                    </button>

                    {CATEGORY_ICON_OPTIONS.map(({ name, label, Icon }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setSelectedIcon(name)}
                        title={label}
                        aria-label={label}
                        aria-pressed={selectedIcon === name}
                        className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                          selectedIcon === name
                            ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                            : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest">التصنيف الأب (اختياري)</label>
                  <select 
                    name="parent_id"
                    defaultValue={editingCategory?.parent_id || ''}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  >
                    <option value="">لا يوجد (تصنيف رئيسي)</option>
                    {categories
                      .filter(c => c.id !== editingCategory?.id && !c.parent_id)
                      .map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))
                    }
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-widest">الرابط (Slug)</label>
                  <input 
                    name="slug"
                    type="text" 
                    required
                    defaultValue={editingCategory?.slug}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-left"
                    dir="ltr"
                    placeholder="luxury-gifts"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input name="status" type="checkbox" defaultChecked={editingCategory?.status === 'active'} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                  <span className="text-sm font-bold text-slate-700">تفعيل التصنيف</span>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-100 transition-all"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      'حفظ التصنيف'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default CategoriesPage;
