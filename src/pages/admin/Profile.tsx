import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Save, 
  Loader2,
  Key
} from 'lucide-react';
import { useProfile } from '../../hooks/useProfile';
import { AdminProfile } from '../../services/profileService';
import { ImageUpload } from '../../components/admin/ImageUpload';
import { uploadService } from '../../services/uploadService';
import { toast } from 'react-hot-toast';

const ProfilePage: React.FC = () => {
  const { profile, loading, updateProfile } = useProfile();
  const [formData, setFormData] = useState<AdminProfile | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData(profile);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      setIsUploading(true);
      try {
        let finalAvatarUrl = formData.avatar;
        if (imageFile) {
          const loadingToast = toast.loading('جاري رفع الصورة الشخصية...');
          try {
            finalAvatarUrl = await uploadService.uploadImage(imageFile, 'avatars');
            toast.dismiss(loadingToast);
          } catch (error) {
            toast.error('فشل في رفع الصورة');
            toast.dismiss(loadingToast);
            setIsUploading(false);
            return;
          }
        }
        await updateProfile({ ...formData, avatar: finalAvatarUrl });
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

  if (!formData) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">الملف الشخصي</h1>
          <p className="text-slate-500 font-bold">إدارة معلوماتك الشخصية وإعدادات الأمان.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Avatar & Basic Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
            <ImageUpload 
              value={formData.avatar || ''}
              onChange={(val) => setFormData({...formData, avatar: val as string})}
              onFilesChange={(files) => setImageFile(files[0])}
              variant="circular"
            />
            <h3 className="mt-6 font-black text-xl text-slate-900">{formData.name}</h3>
            <p className="text-slate-500 font-bold text-sm">{formData.role}</p>
            
            <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
              <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                <Shield className="w-4 h-4 text-indigo-500" />
                <span>صلاحيات كاملة</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>آخر دخول: {new Date(formData.lastLogin).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg shadow-indigo-200">
            <h4 className="font-black mb-2">نصيحة أمان</h4>
            <p className="text-sm text-indigo-100 font-bold leading-relaxed">
              تأكد من تغيير كلمة المرور الخاصة بك بشكل دوري وعدم مشاركتها مع أي شخص آخر للحفاظ على أمان المتجر.
            </p>
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-900">المعلومات الشخصية</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700">الاسم الكامل</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700">البريد الإلكتروني</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pr-4 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      dir="ltr"
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700">المسمى الوظيفي</label>
                  <input 
                    type="text" 
                    value={formData.role}
                    readOnly
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none opacity-60 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  type="submit"
                  disabled={loading || isUploading}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {(loading || isUploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {isUploading ? 'جاري الرفع...' : 'حفظ التغييرات'}
                </button>
              </div>
            </div>
          </form>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <Key className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-slate-900">تغيير كلمة المرور</h3>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700">كلمة المرور الحالية</label>
                  <input 
                    type="password" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-700">كلمة المرور الجديدة</label>
                  <input 
                    type="password" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button type="button" className="text-indigo-600 font-black text-sm hover:underline">تحديث كلمة المرور</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
