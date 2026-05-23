
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminLogin from './Login';
import { toast } from 'react-hot-toast';
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
import { storage } from '../../services/storage';
import { useAuth } from '../../contexts/AuthContext';
import { checkSupabaseConfig, supabaseUrl } from '../../supabase';
import { profileService } from '../../services/profileService';
import { AlertCircle } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, loading: authLoading, signIn, signUp, signInWithGoogle, signInAnonymously, signOut } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<AdminPageState>('dashboard');

  const isConfigured = checkSupabaseConfig();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!authLoading) {
        if (user) {
          const rememberMe = localStorage.getItem('admin_remember_me') === 'true';
          const loginTimeStr = localStorage.getItem('admin_login_time');
          const sessionActive = sessionStorage.getItem('admin_session_active') === 'true';

          if (rememberMe && loginTimeStr) {
            const loginTime = parseInt(loginTimeStr, 10);
            if (Date.now() - loginTime > 24 * 60 * 60 * 1000) {
              // Expired 24h
              storage.removeItem('admin_session');
              setIsAuthenticated(false);
              signOut();
              toast.error('انتهت الجلسة، يرجى تسجيل الدخول مجدداً');
              setIsLoading(false);
              return;
            }
          } else if (!rememberMe && !sessionActive) {
            // Browser was closed and opened again
            storage.removeItem('admin_session');
            setIsAuthenticated(false);
            signOut();
            setIsLoading(false);
            return;
          }

          // 1. Check hardcoded admin emails for immediate access
          const adminEmails = ['yousefalhamawi2@gmail.com', 'alkhrraz3@gmail.com', 'admin@yaslamo.com'];
          const isHardcodedAdmin = adminEmails.includes(user.email || '') || user.is_anonymous;

          if (isHardcodedAdmin) {
            setIsAuthenticated(true);
            storage.setItem('admin_session', 'true');
            setIsLoading(false);
            return;
          }

          // 2. Check database for admin role
          if (isConfigured) {
            try {
              // Try to find profile by ID first
              let profile = await profileService.getProfile(user.id);

              // If no profile by ID, try finding by email (for pre-authorized admins)
              if (!profile || profile.email === '6masar@gmail.com') { // 6masar is the default fallback
                const profileByEmail = await profileService.findByEmail(user.email || '');
                if (profileByEmail) {
                  // Link the existing email profile to this new user ID
                  profile = await profileService.updateProfile({
                    ...profileByEmail,
                    id: user.id,
                    name: user.user_metadata?.full_name || profileByEmail.name,
                    avatar: user.user_metadata?.avatar_url || profileByEmail.avatar
                  });
                }
              }

              const hasAdminRole = profile && (profile.role === 'مدير النظام' || profile.role === 'مشرف');

              if (hasAdminRole) {
                setIsAuthenticated(true);
                storage.setItem('admin_session', 'true');
              } else {
                setIsAuthenticated(false);
                storage.removeItem('admin_session');
                toast.error('ليس لديك صلاحيات الوصول للإدارة');
              }
            } catch (err) {
              console.error('Failed to verify admin status:', err);
              setIsAuthenticated(false);
            }
          } else {
            setIsAuthenticated(false);
          }
        } else {
          // Check if we have a mock admin session
          const rawAdminSession = await storage.getItem('admin_session', 'false');
          const hasAdminSession = String(rawAdminSession).toLowerCase() === 'true';
          if (hasAdminSession) {
            try {
              // Sign in anonymously in the background so Supabase client has a valid session to bypass RLS
              const { error } = await signInAnonymously();
              if (error) {
                console.warn("Failed to sign in anonymously for mock admin session:", error);
                toast.error("تحذير: لا يمكن التعديل على قاعدة البيانات، الجلسة التجريبية غير فعالة (" + error.message + ")");
              }
            } catch (err: any) {
              console.warn("Failed to sign in anonymously for mock admin session:", err);
              toast.error("فشل في تهيئة جلسة التعديل: " + (err.message || ''));
            }
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            storage.removeItem('admin_session');
          }
        }
        setIsLoading(false);
      }
    };

    checkAdminStatus();
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

  const handleLogin = async (email: string, password: string, rememberMe: boolean = false) => {
    if (!validateForm(email, password)) return;
    try {
      const { error } = await signIn(email, password);
      if (error) {
        if (error.message === 'Invalid login credentials') {
          // Check for mock admin credentials
          if (email === 'admin@yaslamo.com' && password === 'Password123') {
            try {
              // Sign in anonymously so Supabase client has a valid session to bypass RLS
              const { error } = await signInAnonymously();
              if (error) {
                console.warn("Failed to sign in anonymously for mock admin login:", error);
                toast.error("تنبيه: أنت في الوضع التجريبي لكن التعديلات لن تُحفظ لأن التوثيق فشل (" + error.message + ")");
              }
            } catch (err: any) {
              console.warn("Failed to sign in anonymously for mock admin login:", err);
              toast.error("فشل في تهيئة جلسة التعديل: " + (err.message || ''));
            }
            setIsAuthenticated(true);
            storage.setItem('admin_session', 'true');

            if (rememberMe) {
              localStorage.setItem('admin_remember_me', 'true');
              localStorage.setItem('admin_login_time', Date.now().toString());
            } else {
              localStorage.setItem('admin_remember_me', 'false');
            }
            sessionStorage.setItem('admin_session_active', 'true');

            toast.success('تم تسجيل الدخول كمسؤول (تجريبي)');
            return;
          }
          throw error;
        }
        throw error;
      }

      if (rememberMe) {
        localStorage.setItem('admin_remember_me', 'true');
        localStorage.setItem('admin_login_time', Date.now().toString());
      } else {
        localStorage.setItem('admin_remember_me', 'false');
      }
      sessionStorage.setItem('admin_session_active', 'true');

      toast.success('تم تسجيل الدخول بنجاح');
    } catch (error: any) {
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

  const handleAnonymousLogin = async () => {
    try {
      const { error } = await signInAnonymously();
      if (error) throw error;
      toast.success('تم الدخول كزائر');
    } catch (error: any) {
      console.error('Anonymous login error:', error);
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
      } else {
        toast.error('فشل الدخول كزائر. تأكد من تفعيل Anonymous Auth في Supabase.');
      }
    }
  };



  const handleLogout = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Supabase signOut error:", err);
    } finally {
      setIsAuthenticated(false);
      await storage.removeItem('admin_session');
      localStorage.removeItem('admin_session'); // إضافة مهمة لحذف الجلسة القديمة من LocalStorage
      localStorage.removeItem('admin_remember_me');
      localStorage.removeItem('admin_login_time');
      sessionStorage.removeItem('admin_session_active');
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
        onGoogleLogin={async () => { /* Google login not implemented yet */ }}
        onAnonymousLogin={handleAnonymousLogin}
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
