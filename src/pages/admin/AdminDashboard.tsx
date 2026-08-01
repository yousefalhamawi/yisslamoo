
import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLogin from './Login';
import { toast } from '../../utils/toast';
import Dashboard from './Dashboard';
import ProductsPage from './Products';
import CategoriesPage from './Categories';
import CouponsPage from './Coupons';
import InventoryPage from './Inventory';
import PaymentsPage from './Payments';
import OrdersPage from './Orders';
import CustomersPage from './Customers';
import AnalyticsPage from './Analytics';
import ReviewsPage from './Reviews';
import CollectionsPage from './Collections';
import SettingsPage from './Settings';
import ProfilePage from './Profile';
import StaffPage from './Staff';
import SliderPage from './Slider';
import { AdminPageState } from '../../types/admin';
import { useAuth } from '../../contexts/AuthContext';
import { checkSupabaseConfig, supabaseUrl } from '../../supabase';
import { profileService } from '../../services/profileService';
import { AlertCircle } from 'lucide-react';
import { ADMIN_ROLES, hasAdminAccess } from '../../utils/adminAuthorization';
import { isVerifiedAdminSession } from '../../utils/adminSessionVerification';

const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading, signIn, signUp, signOut } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<AdminPageState>('dashboard');
  const pendingAdminLoginRef = useRef(false);
  const verifiedAdminUserIdRef = useRef<string | null>(null);

  const isConfigured = checkSupabaseConfig();

  useEffect(() => {
    let isActive = true;

    const checkAdminStatus = async () => {
      if (authLoading) return;

      if (isActive) {
        setIsLoading(true);
      }

      if (!user) {
        if (isActive) {
          verifiedAdminUserIdRef.current = null;
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        return;
      }

      if (!isConfigured) {
        if (isActive) {
          setIsAuthenticated(false);
          setIsLoading(false);
        }
        return;
      }

      // A successful explicit login already verified this exact Supabase user.
      // Do not let a duplicate asynchronous profile request replace it with a
      // stale failure and render the login form again.
      if (isVerifiedAdminSession(verifiedAdminUserIdRef.current, user.id)) {
        if (isActive) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
        return;
      }

      try {
        const profile = await profileService.getProfile(user.id);

        if (!isActive) return;

        if (isVerifiedAdminSession(verifiedAdminUserIdRef.current, user.id)) {
          setIsAuthenticated(true);
          return;
        }

        // لا يوجد صفّ في جدول profiles لهذا الحساب — أو أن سياسات RLS تمنع قراءته
        if (!profile) {
          setIsAuthenticated(false);
          pendingAdminLoginRef.current = false;
          console.error(
            `[Admin] لا يوجد ملف تعريف للمستخدم ${user.email} (id: ${user.id}) في جدول profiles`
          );
          toast.error('لا يوجد ملف تعريف لهذا الحساب في لوحة التحكم. راجع جدول profiles.');
          return;
        }

        // التقليم يحمي من مسافة زائدة في نهاية القيمة المخزّنة
        const role = (profile.role || '').trim();
        const hasAdminRole = hasAdminAccess(role);

        if (hasAdminRole) {
          verifiedAdminUserIdRef.current = user.id;
          setIsAuthenticated(true);
          if (pendingAdminLoginRef.current) {
            toast.success('تم تسجيل الدخول بنجاح');
            pendingAdminLoginRef.current = false;
          }
          return;
        }

        setIsAuthenticated(false);
        pendingAdminLoginRef.current = false;
        console.error(
          `[Admin] الحساب ${user.email} دوره "${role || '(فارغ)'}" — المسموح: ${ADMIN_ROLES.join('، ')}`
        );
        toast.error(`ليس لديك صلاحيات الإدارة. دورك الحالي: "${role || 'غير محدّد'}"`);
      } catch (err) {
        console.error('Failed to verify admin status:', err);
        if (!isActive) return;
        setIsAuthenticated(false);
        pendingAdminLoginRef.current = false;
        toast.error('فشل التحقق من صلاحيات الإدارة. تحقّق من الاتصال وسياسات RLS.');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    void checkAdminStatus();

    return () => {
      isActive = false;
    };
  }, [user, authLoading, isConfigured]);

  const validateForm = (email: string, password: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('يرجى إدخال بريد إلكتروني صحيح');
      return false;
    }
    if (password.length < 6) {
      toast.error('يجب أن تكون كلمة المرور ٦ أحرف على الأقل');
      return false;
    }
    return true;
  };

  const handleLogin = async (email: string, password: string, _rememberMe: boolean = false) => {
    if (!validateForm(email, password)) return;
    pendingAdminLoginRef.current = true;
    setIsLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      if (error) throw error;
      if (!data?.user) {
        throw new Error('لم تكتمل جلسة تسجيل الدخول. حاول مرة أخرى.');
      }

      // Verify the role from the newly-created session instead of waiting for
      // React's auth-state update. This prevents a race that could briefly
      // render the login form again after a valid password submission.
      const profile = await profileService.getProfile(data.user.id);
      const role = (profile?.role || '').trim();

      if (!profile) {
        throw new Error('لا يوجد ملف تعريف إداري لهذا الحساب.');
      }
      if (!hasAdminAccess(role)) {
        throw new Error('هذا الحساب لا يملك صلاحيات الإدارة.');
      }

      verifiedAdminUserIdRef.current = data.user.id;
      setIsAuthenticated(true);
      setIsLoading(false);
      if (pendingAdminLoginRef.current) {
        toast.success('تم تسجيل الدخول بنجاح');
        pendingAdminLoginRef.current = false;
      }
    } catch (error: any) {
      verifiedAdminUserIdRef.current = null;
      pendingAdminLoginRef.current = false;
      setIsLoading(false);
      console.error('Login error:', error);
      if (error.message === 'Failed to fetch') {
        toast.error(
          <div className="text-right" dir="rtl">
            <p className="font-black mb-1">فشل الاتصال بـ Supabase</p>
            <ul className="text-xs list-disc pr-4 space-y-1 opacity-90">
              <li>تأكد من صحة الرابط: <code className="bg-slate-100 px-1">{supabaseUrl}</code></li>
              <li>تأكد من أن مشروع Supabase ليس في وضع الخمول (Paused)</li>
              <li>تأكد من اتصالك بالإنترنت</li>
              <li>تأكد من عدم وجود مسافات أو علامات تنصيص في الإعدادات (Secrets)</li>
            </ul>
          </div>,
          { duration: 6000 }
        );
      } else if (error.message === 'Invalid login credentials') {
        toast.error('بيانات الدخول غير صحيحة. إذا لم تكن قد أنشأت حساباً بعد، يرجى النقر على "أنشئ حساباً جديداً".');
      } else {
        toast.error(error.message || 'بيانات الدخول غير صحيحة');
      }
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    if (!validateForm(email, password)) return;
    try {
      const { error } = await signUp(email, password);
      if (error) throw error;
      toast.success('تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.');
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.message === 'Failed to fetch') {
        toast.error(
          <div className="text-right" dir="rtl">
            <p className="font-black mb-1">فشل الاتصال بـ Supabase</p>
            <ul className="text-xs list-disc pr-4 space-y-1 opacity-90">
              <li>تأكد من صحة الرابط: <code className="bg-slate-100 px-1">{supabaseUrl}</code></li>
              <li>تأكد من أن مشروع Supabase ليس في وضع الخمول (Paused)</li>
              <li>تأكد من اتصالك بالإنترنت</li>
              <li>تأكد من عدم وجود مسافات أو علامات تنصيص في الإعدادات (Secrets)</li>
            </ul>
          </div>,
          { duration: 6000 }
        );
      } else if (error.message.includes('Email address') && error.message.includes('invalid')) {
        toast.error('عنوان البريد الإلكتروني غير صالح بالنسبة لـ Supabase. يرجى تجربة بريد إلكتروني آخر (مثل Gmail) أو التأكد من إعدادات البريد في Supabase.');
      } else {
        toast.error(error.message || 'فشل إنشاء الحساب');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Supabase signOut error:", err);
    } finally {
      verifiedAdminUserIdRef.current = null;
      setIsAuthenticated(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6" dir="rtl">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 text-center">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-4">Supabase غير مهيأ</h1>
          <p className="text-slate-500 font-bold mb-8 leading-relaxed">
            يرجى ضبط متغيرات البيئة <code className="bg-slate-100 px-2 py-1 rounded">VITE_SUPABASE_URL</code> و <code className="bg-slate-100 px-2 py-1 rounded">VITE_SUPABASE_ANON_KEY</code> في قائمة الإعدادات (Secrets) للمتابعة.
          </p>
          <div className="bg-amber-50 p-4 rounded-2xl text-amber-700 text-sm font-bold text-right">
            <p>بعد إضافة المفاتيح، سيتم إعادة تشغيل التطبيق تلقائياً.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <AdminLogin 
        onLogin={handleLogin}
        onSignUp={handleSignUp}
      />
    );
  }



  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'orders':
        return <OrdersPage />;
      case 'customers':
        return <CustomersPage />;
      case 'coupons':
        return <CouponsPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'reviews':
        return <ReviewsPage />;
      case 'collections':
        return <CollectionsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'staff':
        return <StaffPage />;
      case 'slider':
        return <SliderPage />;
      default:
        return (
          <div className="bg-white p-24 rounded-3xl border border-slate-200 shadow-sm text-center">
            <h2 className="text-2xl font-black text-slate-300">قريباً...</h2>
            <p className="text-slate-400 font-bold mt-2">هذه الصفحة قيد التطوير حالياً.</p>
          </div>
        );
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onLogout={handleLogout}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;
