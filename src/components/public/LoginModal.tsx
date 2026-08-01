
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { validateEmail, validatePassword, validatePhone } from '../../utils/validation';
import hotToast from '../../utils/toast';
import { FORM_SUBMIT, formInput } from '../../constants/formStyles';
import { supabase } from '../../supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (data: { id?: string; name: string; email: string; phone: string; password?: string; isRegister: boolean }) => Promise<boolean>;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({ email: '', phone: '', name: '', otp: '' });
  const [loading, setLoading] = useState(false);
  const { signInWithOtp, verifyOtp, signInWithGoogle, signInAnonymously } = useAuth();
  const { addNotification } = useNotifications();

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const newErrors = { email: '', phone: '', name: '', otp: '' };
    let hasError = false;

    if (!validateEmail(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
      hasError = true;
    }

    if (!isLoginView) {
      if (!validatePhone(formData.phone)) {
        newErrors.phone = 'رقم الهاتف يجب أن يكون بين ٨ و ١٥ رقماً';
        hasError = true;
      }
      if (!formData.name.trim()) {
        newErrors.name = 'الاسم مطلوب';
        hasError = true;
      }
    }

    setErrors(newErrors);
    if (hasError) {
      setLoading(false);
      return;
    }

    try {
      // ── عند إنشاء حساب جديد: تحقق هل البريد مسجّل مسبقاً ──
      if (!isLoginView) {
        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('email', formData.email.trim().toLowerCase())
          .maybeSingle();

        if (existing) {
          hotToast(
            () => (
              <div style={{ textAlign: 'right', direction: 'rtl', lineHeight: 1.7 }}>
                <p style={{ fontWeight: 900, marginBottom: 4 }}>⚠️ الحساب موجود بالفعل!</p>
                <p style={{ fontSize: 13, color: '#444' }}>
                  هذا البريد الإلكتروني مسجَّل مسبقاً.<br />
                  جرّب <strong>تسجيل الدخول</strong> بدلاً من إنشاء حساب جديد.
                </p>
              </div>
            ),
            { duration: 5000 }
          );
          setIsLoginView(true);
          setLoading(false);
          return;
        }
      }

      const metadata = isLoginView ? undefined : { full_name: formData.name, phone: formData.phone };
      const { error } = await signInWithOtp(formData.email, metadata);

      if (error) throw error;

      setStep('otp');
      hotToast.success('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
    } catch (error: any) {
      console.error("OTP send error:", error);
      if (error.message?.includes('Signups not allowed')) {
        hotToast.error('عذراً، التسجيل غير متاح حالياً.');
      } else {
        hotToast.error('حدث خطأ أثناء إرسال الرمز. يرجى المحاولة لاحقاً');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOtp = otpCode.trim();
    if (!cleanOtp || cleanOtp.length < 6 || cleanOtp.length > 8) {
      setErrors({ ...errors, otp: 'رمز التحقق يجب أن يكون ٦ أو ٨ أرقام' });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await verifyOtp(formData.email, cleanOtp);
      if (error) throw error;

      const authUser = data.user;

      // Handle remember me logic
      if (rememberMe) {
        localStorage.setItem('yaslamo_remember_me', 'true');
        localStorage.setItem('yaslamo_login_time', Date.now().toString());
      } else {
        localStorage.setItem('yaslamo_remember_me', 'false');
      }

      const success = await onLogin({
        id: authUser?.id,
        name: isLoginView ? (authUser?.user_metadata?.full_name || 'عميل يسلمو') : formData.name,
        email: formData.email,
        phone: formData.phone || authUser?.user_metadata?.phone || '',
        isRegister: !isLoginView
      });

      if (success) {
        addNotification({
          title: isLoginView ? 'أهلاً بك مجدداً!' : 'مرحباً بك في يسلمو!',
          message: isLoginView ? 'تم تسجيل دخولك بنجاح. استمتع بتجربة تسوق مميزة.' : 'تم إنشاء حسابك بنجاح. ابدأ رحلتك في عالم الهدايا الآن.',
          type: 'success'
        });
        onClose();
      }
    } catch (error: any) {
      console.error("OTP verify error:", error);
      hotToast.error('الرمز غير صحيح أو منتهي الصلاحية');
    } finally {
      setLoading(false);
    }
  };



  const handleAnonLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await signInAnonymously();
      if (error) throw error;

      if (data.user) {
        const success = await onLogin({
          id: data.user.id,
          name: 'زائر',
          email: data.user.email || 'anonymous@yaslamo.sa',
          phone: '',
          isRegister: true
        });
        if (success) {
          addNotification({
            title: 'تم الدخول كزائر',
            message: 'يمكنك الآن تصفح المتجر وإضافة المنتجات للسلة.',
            type: 'info'
          });
          onClose();
        }
      }
    } catch (error: any) {
      console.error("Anonymous login failed", error);
      hotToast.error('تأكد من تفعيل تسجيل الدخول المجهول (Anonymous) في لوحة تحكم Supabase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-primaryDark/40 backdrop-blur-md z-[200]"
          />
          <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              className="w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(108,43,217,0.25)] overflow-hidden pointer-events-auto relative"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 left-6 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white z-20 hover:bg-white/20 transition-all border border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              {/* Header */}
              <div className="bg-primary pt-12 pb-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-accent/10 rounded-full -translate-y-24 translate-x-24" />

                <div className="relative z-10">
                  <motion.div
                    whileHover={{ rotateY: 180 }}
                    className="w-16 h-16 bg-accent rounded-2xl mx-auto mb-4 flex items-center justify-center text-primaryDark text-3xl font-black shadow-lg"
                  >
                    ي
                  </motion.div>
                  <h2 className="text-2xl font-black text-white mb-1 tracking-tight">مرحباً بك في يسلمو</h2>
                  <p className="text-white/50 text-[10px] font-bold tracking-[0.3em] uppercase">The Art of Giving</p>
                </div>
              </div>

              <div className="p-8 md:p-10">
                {/* Tabs */}
                {step === 'form' && (
                  <div className="flex bg-gray-50 p-1.5 rounded-2xl mb-8">
                    <button
                      onClick={() => setIsLoginView(true)}
                      className={`flex-1 py-3 rounded-xl font-black text-sm transition-all duration-300 ${isLoginView ? 'bg-white text-primary shadow-md' : 'text-gray-400 hover:text-gray-500'}`}
                    >
                      تسجيل الدخول
                    </button>
                    <button
                      onClick={() => setIsLoginView(false)}
                      className={`flex-1 py-3 rounded-xl font-black text-sm transition-all duration-300 ${!isLoginView ? 'bg-white text-primary shadow-md' : 'text-gray-400 hover:text-gray-500'}`}
                    >
                      حساب جديد
                    </button>
                  </div>
                )}

                {step === 'form' ? (
                  <form onSubmit={handleSubmitForm} className="space-y-5 text-right">
                    <AnimatePresence mode="wait">
                      {!isLoginView && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="space-y-1.5"
                        >
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">الاسم الكامل</label>
                            <input
                              required
                              type="text"
                              placeholder="الأسم الكامل "
                              value={formData.name}
                              onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value });
                                if (errors.name) setErrors({ ...errors, name: '' });
                              }}
                              className={formInput(!!errors.name)}
                            />
                            {errors.name && <p className="text-[10px] text-red-500 font-bold mr-2 mt-1">{errors.name}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">رقم الهاتف</label>
                            <input
                              required
                              type="tel"
                              placeholder="05xxxxxxxx"
                              value={formData.phone}
                              onChange={(e) => {
                                setFormData({ ...formData, phone: e.target.value });
                                if (errors.phone) setErrors({ ...errors, phone: '' });
                              }}
                              className={formInput(!!errors.phone)}
                              dir="ltr"
                            />
                            {errors.phone && <p className="text-[10px] text-red-500 font-bold mr-2 mt-1">{errors.phone}</p>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">البريد الإلكتروني</label>
                      <input
                        required
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        className={formInput(!!errors.email)}
                      />
                      {errors.email && <p className="text-[10px] text-red-500 font-bold mr-2 mt-1">{errors.email}</p>}
                    </div>

                    <div className="flex items-center gap-2 mt-2 px-2">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor="rememberMe" className="text-[10px] font-bold text-gray-500 cursor-pointer">
                        تذكر هذا الجهاز                      </label>
                    </div>

                    <div className="pt-4 pb-4">
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading}
                        type="submit"
                        className={FORM_SUBMIT}
                      >
                        {loading ? 'جاري التحميل...' : 'إرسال رمز التحقق'}
                      </motion.button>
                    </div>

                    <div className="relative flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-gray-100"></div>
                      <div className="flex-1 h-px bg-gray-100"></div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-5 text-right">
                    <div className="text-center mb-6">
                      <p className="text-sm font-bold text-gray-500">تم إرسال رمز التحقق إلى بريدك الإلكتروني</p>
                      <p className="text-sm font-black text-primary mt-1" dir="ltr">{formData.email}</p>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2">رمز التحقق (OTP)</label>
                      <input
                        required
                        type="text"
                        maxLength={8}
                        placeholder="12345678"
                        value={otpCode}
                        onChange={(e) => {
                          setOtpCode(e.target.value.replace(/\D/g, ''));
                          if (errors.otp) setErrors({ ...errors, otp: '' });
                        }}
                        className={`w-full bg-gray-50 border ${errors.otp ? 'border-red-500' : 'border-gray-100'} rounded-xl px-5 py-4 focus:outline-none focus:border-primary focus:bg-white transition-all text-center font-black text-2xl tracking-[0.5em]`}
                        dir="ltr"
                      />
                      {errors.otp && <p className="text-[10px] text-red-500 font-bold text-center mt-2">{errors.otp}</p>}
                    </div>

                    <div className="pt-4 pb-4">
                      <motion.button
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={loading || (otpCode.length !== 6 && otpCode.length !== 8)}
                        type="submit"
                        className={FORM_SUBMIT}
                      >
                        {loading ? 'جاري التحقق...' : 'تأكيد الدخول'}
                      </motion.button>
                      <button
                        type="button"
                        onClick={() => setStep('form')}
                        className="w-full mt-4 text-xs font-bold text-gray-400 hover:text-primary transition-colors"
                      >
                        العودة لتعديل البريد الإلكتروني
                      </button>
                    </div>
                  </form>
                )}


              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;
