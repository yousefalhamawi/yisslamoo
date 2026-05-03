
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (email: string, password: string, rememberMe: boolean) => void;
  onSignUp: (email: string, password: string) => void;
  onGoogleLogin: () => void;
  onAnonymousLogin: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, onSignUp, onGoogleLogin, onAnonymousLogin }) => {
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('admin@yaslamo.com');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        await onSignUp(email, password);
      } else {
        await onLogin(email, password, rememberMe);
      }
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans" dir="rtl">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white font-black text-4xl mx-auto mb-6 shadow-2xl shadow-indigo-200">
            ي
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل دخول الإدارة'}
          </h1>
          <p className="text-slate-500 font-bold">
            {isSignUp ? 'قم بإنشاء حسابك للبدء في إدارة المتجر.' : 'مرحباً بك مجدداً، يرجى إدخال بياناتك للمتابعة.'}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-widest">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                  placeholder="admin@yaslamo.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-black text-slate-700 uppercase tracking-widest">كلمة المرور</label>
                <button type="button" className="text-[10px] font-black text-indigo-600 hover:underline">نسيت كلمة المرور؟</button>
              </div>
              <div className="relative">
                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pr-12 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-bold"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-all"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remember" className="text-xs font-bold text-slate-500 cursor-pointer">تذكرني على هذا الجهاز (لمدة يوم واحد)</label>
            </div>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3 group disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'إنشاء الحساب' : 'تسجيل الدخول'}</span>
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs font-black text-indigo-600 hover:underline"
              >
                {isSignUp ? 'لديك حساب بالفعل؟ سجل دخولك' : 'ليس لديك حساب؟ أنشئ حساباً جديداً'}
              </button>
            </div>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
              </div>

            </div>


          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-slate-400 text-xs font-bold">
          جميع الحقوق محفوظة © يسلمو ٢٠٢٦
        </p>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
