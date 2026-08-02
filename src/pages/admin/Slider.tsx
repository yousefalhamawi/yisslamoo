import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Upload } from 'lucide-react';
import { useHeroSlides } from '../../hooks/useHeroSlides';
import { HeroSlide } from '../../types/admin';
import { toast } from '../../utils/toast';
import { uploadService } from '../../services/uploadService';

const SliderPage: React.FC = () => {
  const { heroSlides, loading, addHeroSlide, updateHeroSlide, deleteHeroSlide } = useHeroSlides();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    title: '',
    subtitle: '',
    image: '',
    link: '/shop',
    bgColor: 'bg-[#CEE9FB]',
    titleColor: '#0f172a', // slate-900
    subtitleColor: '#1e293b', // slate-800
    buttonText: 'تصفح المجموعة',
    textPosition: 'center-right',
    mobileTextPosition: 'center-right'
  });

  const handleOpenModal = (slide?: HeroSlide) => {
    if (slide) {
      setEditingSlide(slide);
      setFormData(slide);
    } else {
      setEditingSlide(null);
      setFormData({
        title: '',
        subtitle: '',
        image: '',
        link: '/shop',
        bgColor: 'bg-[#CEE9FB]',
        titleColor: '#0f172a',
        subtitleColor: '#1e293b',
        buttonText: 'تصفح المجموعة',
        textPosition: 'center-right',
        mobileTextPosition: 'center-right'
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const loadingToast = toast.loading('جاري رفع الصورة...');
    
    try {
      const url = await uploadService.uploadImage(file, 'images');
      setFormData({ ...formData, image: url });
      toast.success('تم رفع الصورة بنجاح', { id: loadingToast });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('فشل في رفع الصورة', { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      toast.error('يرجى ملء الحقول المطلوبة');
      return;
    }

    // `id` تولّده قاعدة البيانات — نستبعده من الحمولة المرسلة
    const { id: _ignored, ...payload } = formData as HeroSlide;

    try {
      if (editingSlide) {
        await updateHeroSlide(editingSlide.id, payload);
      } else {
        await addHeroSlide(payload);
      }
      setIsModalOpen(false);
    } catch {
      // الهوك يعرض رسالة الخطأ؛ نُبقي النافذة مفتوحة ليعيد الأدمن المحاولة
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السلايد؟')) return;
    try {
      await deleteHeroSlide(id);
    } catch {
      // الهوك يتكفّل بعرض الخطأ
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">السلايدر (الهيرو)</h1>
            <p className="text-slate-500 font-bold mt-1">إدارة الصور والنصوص في الواجهة الرئيسية</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          <Plus className="w-5 h-5" />
          <span>إضافة سلايد</span>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-4 font-black text-slate-600">الصورة</th>
                <th className="p-4 font-black text-slate-600">العنوان</th>
                <th className="p-4 font-black text-slate-600">النص الفرعي</th>
                <th className="p-4 font-black text-slate-600">الرابط</th>
                <th className="p-4 font-black text-slate-600 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {heroSlides.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 font-bold">
                    لا يوجد سلايدات حالياً
                  </td>
                </tr>
              ) : (
                heroSlides.map((slide) => (
                  <tr key={slide.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className={`w-32 h-20 rounded-xl overflow-hidden ${slide.bgColor} relative border border-slate-200`}>
                        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900" style={{ color: slide.titleColor }}>{slide.title}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm font-bold text-slate-500" style={{ color: slide.subtitleColor }}>{slide.subtitle}</span>
                    </td>
                    <td className="p-4 text-slate-500 font-bold text-sm" dir="ltr">
                      {slide.link}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(slide)}
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(slide.id)}
                          className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center z-10">
                <h2 className="text-xl font-black text-slate-900">
                  {editingSlide ? 'تعديل السلايد' : 'إضافة سلايد جديد'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">العنوان الرئيسي</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">لون العنوان الرئيسي</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={formData.titleColor || '#0f172a'}
                        onChange={(e) => setFormData({ ...formData, titleColor: e.target.value })}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.titleColor || '#0f172a'}
                        onChange={(e) => setFormData({ ...formData, titleColor: e.target.value })}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">النص الفرعي</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">لون النص الفرعي</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={formData.subtitleColor || '#1e293b'}
                        onChange={(e) => setFormData({ ...formData, subtitleColor: e.target.value })}
                        className="w-12 h-12 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.subtitleColor || '#1e293b'}
                        onChange={(e) => setFormData({ ...formData, subtitleColor: e.target.value })}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700">الصورة</label>
                    <div className="flex items-center gap-4">
                      {formData.image && (
                        <div className="w-24 h-24 rounded-xl border border-slate-200 overflow-hidden shrink-0">
                          <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                          className="hidden"
                          id="slide-image-upload"
                        />
                        <label
                          htmlFor="slide-image-upload"
                          className="flex items-center justify-center gap-2 w-full bg-slate-50 border border-slate-200 border-dashed rounded-xl px-4 py-6 font-bold text-slate-500 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Upload className="w-5 h-5" />
                          <span>{isUploading ? 'جاري الرفع...' : 'اختر صورة من جهازك'}</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">نص الزر</label>
                    <input
                      type="text"
                      value={formData.buttonText || ''}
                      onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">رابط الزر</label>
                    <input
                      type="text"
                      value={formData.link}
                      onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">لون الخلفية (كلاس Tailwind)</label>
                    <input
                      type="text"
                      value={formData.bgColor}
                      onChange={(e) => setFormData({ ...formData, bgColor: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                      dir="ltr"
                      placeholder="bg-[#CEE9FB]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <span className="text-indigo-600 bg-indigo-50 text-xs px-2 py-0.5 rounded-md font-bold">🖥 ديسكتوب</span>
                        موضع النص
                      </span>
                    </label>
                    <select
                      value={formData.textPosition || 'center-right'}
                      onChange={(e) => setFormData({ ...formData, textPosition: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    >
                      <option value="top-right">أعلى اليمين</option>
                      <option value="top-center">أعلى المنتصف</option>
                      <option value="top-left">أعلى اليسار</option>
                      <option value="center-right">يمين المنتصف</option>
                      <option value="center">الوسط</option>
                      <option value="center-left">يسار المنتصف</option>
                      <option value="bottom-right">أسفل اليمين</option>
                      <option value="bottom-center">أسفل المنتصف</option>
                      <option value="bottom-left">أسفل اليسار</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <span className="text-emerald-600 bg-emerald-50 text-xs px-2 py-0.5 rounded-md font-bold">📱 موبايل</span>
                        موضع النص
                      </span>
                    </label>
                    <select
                      value={formData.mobileTextPosition || formData.textPosition || 'center-right'}
                      onChange={(e) => setFormData({ ...formData, mobileTextPosition: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                    >
                      <option value="top-right">أعلى اليمين</option>
                      <option value="top-center">أعلى المنتصف</option>
                      <option value="top-left">أعلى اليسار</option>
                      <option value="center-right">يمين المنتصف</option>
                      <option value="center">الوسط</option>
                      <option value="center-left">يسار المنتصف</option>
                      <option value="bottom-right">أسفل اليمين</option>
                      <option value="bottom-center">أسفل المنتصف</option>
                      <option value="bottom-left">أسفل اليسار</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-lg shadow-indigo-200"
                  >
                    حفظ السلايد
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

export default SliderPage;
