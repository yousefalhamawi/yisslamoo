
import React, { useState, useEffect } from 'react';
import { 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  DollarSign, 
  Languages, 
  ShieldCheck,
  Bell,
  Save,
  Camera,
  Loader2
} from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { StoreSettings } from '../../services/settingsService';
import { ImageUpload } from '../../components/admin/ImageUpload';
import { uploadService } from '../../services/uploadService';
import { toast } from 'react-hot-toast';
import ExchangeRateWidget from '../../components/admin/ExchangeRateWidget';

const SettingsPage: React.FC = () => {
  const { settings, loading, updateSettings } = useSettings();
  const [formData, setFormData] = useState<StoreSettings | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      setIsUploading(true);
      try {
        let finalLogoUrl = formData.logo;
        if (imageFile) {
          const loadingToast = toast.loading('جاري رفع شعار المتجر...');
          try {
            finalLogoUrl = await uploadService.uploadImage(imageFile, 'settings');
            toast.dismiss(loadingToast);
          } catch (error) {
            toast.error('فشل في رفع الشعار');
            toast.dismiss(loadingToast);
            setIsUploading(false);
            return;
          }
        }
        await updateSettings({ ...formData, logo: finalLogoUrl });
        setImageFile(null);
      } catch (error) {
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  if (loading && !formData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // إذا فشل تحميل الإعدادات، نعرض ExchangeRateWidget فقط
  if (!formData) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">إعدادات المتجر</h1>
          <p className="text-slate-500 font-bold">تحكم في إعدادات متجرك، الهوية، والتواصل.</p>
        </div>
        {/* سعر الصرف متاح دائماً */}
        <ExchangeRateWidget variant="full" />
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-right">
          <p className="font-bold text-amber-800 mb-1">تعذّر تحميل باقي الإعدادات</p>
          <p className="text-sm text-amber-600">تأكد من تشغيل ملف <code className="font-mono bg-amber-100 px-1 rounded">pricing_migration.sql</code> في Supabase أولاً، ثم أعد تحميل الصفحة.</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">إعدادات المتجر</h1>
          <p className="text-slate-500 font-bold">تحكم في إعدادات متجرك، الهوية، والتواصل.</p>
        </div>
        <button 
          type="submit"
          disabled={loading || isUploading}
          className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {(loading || isUploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isUploading ? 'جاري الرفع...' : 'حفظ التغييرات'}
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <Store className="w-5 h-5 text-indigo-600" />
          <h3 className="font-black text-slate-900">المعلومات العامة</h3>
        </div>
        <div className="p-8 space-y-8">
          {/* Logo Upload */}
          <div className="flex items-center gap-8 text-right">
            <ImageUpload 
              value={formData.logo || '/img/logo/logo.png'}
              onChange={(val) => setFormData({...formData, logo: val as string})}
              onFilesChange={(files) => setImageFile(files[0])}
              variant="square"
            />
            <div>
              <h4 className="font-black text-slate-900 mb-1">شعار المتجر</h4>
              <p className="text-xs text-slate-500 font-bold">يفضل استخدام صورة PNG بخلفية شفافة، مقاس ٥١٢x٥١٢ بكسل.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">اسم المتجر</label>
              <input 
                type="text" 
                value={formData.storeName}
                onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">رابط المتجر (Domain)</label>
              <div className="relative">
                <input 
                  type="text" 
                  defaultValue="yaslamo.com"
                  readOnly
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-4 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all opacity-60 cursor-not-allowed"
                  dir="ltr"
                />
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">البريد الإلكتروني للتواصل</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={formData.storeEmail}
                  onChange={(e) => setFormData({...formData, storeEmail: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-4 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  dir="ltr"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">رقم الهاتف</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-4 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  dir="ltr"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-black text-slate-700">العنوان</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-4 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Rate Management */}
      <ExchangeRateWidget variant="full" />

      {/* Localization & Currency */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <Languages className="w-5 h-5 text-indigo-600" />
          <h3 className="font-black text-slate-900">اللغة والعملة والضرائب</h3>
        </div>
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700">العملة الافتراضية</label>
            <div className="relative">
              <select 
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none"
              >
                <option value="ليرة سورية">ليرة سورية (SYP)</option>
                <option value="ريال سعودي">ريال سعودي (SAR)</option>
                <option value="USD">دولار أمريكي (USD)</option>
              </select>
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700">نسبة الضريبة (%)</label>
            <input 
              type="number" 
              value={formData.taxRate}
              onChange={(e) => setFormData({...formData, taxRate: Number(e.target.value)})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700">رسوم الشحن الافتراضية</label>
            <input 
              type="number" 
              value={formData.shippingFee}
              onChange={(e) => setFormData({...formData, shippingFee: Number(e.target.value)})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700">حد الشحن المجاني (الهدف بالليرة)</label>
            <input 
              type="number" 
              value={formData.freeShippingThreshold ?? 2000000}
              onChange={(e) => setFormData({...formData, freeShippingThreshold: Number(e.target.value)})}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Security & Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-slate-900">الأمان</h3>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
              <span className="text-sm font-bold text-slate-700">تفعيل التحقق بخطوتين</span>
              <div className="relative w-10 h-6 bg-slate-200 rounded-full">
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </label>
            <label className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
              <span className="text-sm font-bold text-slate-700">تسجيل الخروج التلقائي</span>
              <div className="relative w-10 h-6 bg-indigo-600 rounded-full">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Bell className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-slate-900">التنبيهات</h3>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
              <span className="text-sm font-bold text-slate-700">تنبيهات الطلبات الجديدة</span>
              <div className="relative w-10 h-6 bg-indigo-600 rounded-full">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </label>
            <label className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer">
              <span className="text-sm font-bold text-slate-700">تنبيهات انخفاض المخزون</span>
              <div className="relative w-10 h-6 bg-indigo-600 rounded-full">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
              </div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
};

export default SettingsPage;
