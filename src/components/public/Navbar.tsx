
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from '../../types/index';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell, LucideIcon, CheckCircle2, AlertCircle, Info, ShoppingCart, Heart, Package, Trash2, CheckCheck, X, Home, User as UserIcon, LayoutGrid } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onNavigate: (page: string) => void;
  user: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  wishlistCount, 
  onOpenCart, 
  onNavigate, 
  user, 
  onOpenLogin, 
  onLogout 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuLinks = [
    { label: 'المتجر', path: '/shop' },
    { label: 'المواسم', path: '/collections' },
    { label: 'قصتنا', path: '/about' }
  ];

  const isDarkHeaderPage = location.pathname === '/about' || location.pathname === '/policies';
  const useLightText = isDarkHeaderPage && !isScrolled;

  const handleMobileNavigate = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return CheckCircle2;
      case 'error': return AlertCircle;
      case 'cart': return ShoppingCart;
      case 'wishlist': return Heart;
      case 'order': return Package;
      default: return Info;
    }
  };

  const getColorClass = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 text-emerald-500';
      case 'error': return 'bg-red-50 text-red-500';
      case 'cart': return 'bg-primary/5 text-primary';
      case 'wishlist': return 'bg-rose-50 text-rose-500';
      case 'order': return 'bg-amber-50 text-amber-500';
      default: return 'bg-blue-50 text-blue-500';
    }
  };

  return (
    <>
      <header 
        className={`fixed top-[32px] left-0 right-0 z-[100] transition-all duration-700 ease-in-out ${
          isScrolled 
            ? 'py-3 bg-white/80 backdrop-blur-2xl border-b border-primary/5 shadow-2xl shadow-primary/5' 
            : 'py-8 bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-8">
          
          {/* الإجراءات - اليمين (على الموبايل تظهر السلة) */}
          <div className="flex items-center gap-2 lg:gap-6 order-1">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenCart} 
              className="relative flex items-center gap-2 bg-primary text-white px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl lg:rounded-2xl hover:bg-primaryDark transition-all shadow-lg shadow-primary/20 group"
            >
              <span className="hidden lg:inline font-bold text-xs">السلة</span>
              <div className="bg-accent text-primaryDark px-2 py-0.5 rounded-lg text-[9px] lg:text-[10px] font-bold min-w-[18px] text-center">
                {cartCount}
              </div>
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </motion.button>
            
            {/* Notification Bell */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center transition-all relative ${
                  showNotifications 
                    ? 'bg-primary text-white' 
                    : useLightText 
                      ? 'bg-white/10 text-white hover:bg-white hover:text-primary' 
                      : 'bg-primary/5 text-primary hover:bg-primary hover:text-white'
                }`}
              >
                <Bell className="w-5 h-5 lg:w-6 lg:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-accent text-primaryDark text-[8px] lg:text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </motion.button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setShowNotifications(false)}
                      className="fixed inset-0 z-[-1]"
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="fixed inset-x-4 top-24 md:absolute md:inset-auto md:top-full md:left-0 md:mt-4 w-auto md:w-96 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-white/20 overflow-hidden z-50 origin-top-left"
                    >
                      <div className="p-5 lg:p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-3">
                          <h3 className="font-black text-primaryDark text-sm lg:text-base">التنبيهات</h3>
                          {unreadCount > 0 && (
                            <span className="bg-accent/20 text-primaryDark px-2 py-0.5 rounded-lg text-[9px] lg:text-[10px] font-black">
                              {unreadCount} جديد
                            </span>
                          )}
                        </div>
                        <div className="flex gap-1 lg:gap-2">
                          <button 
                            onClick={markAllAsRead}
                            className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-primary transition-all"
                            title="تحديد الكل كمقروء"
                          >
                            <CheckCheck className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setShowNotifications(false)}
                            className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-red-500 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="max-h-[60vh] md:max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                          <div className="divide-y divide-gray-50">
                            {notifications.map((n, idx) => {
                              const Icon = getIcon(n.type);
                              const colorClass = getColorClass(n.type);
                              return (
                                <motion.div 
                                  key={`${n.id}-${idx}`}
                                  layout
                                  className={`p-4 lg:p-5 flex gap-4 transition-colors relative group ${n.read ? 'opacity-60' : 'bg-primary/[0.02]'}`}
                                >
                                  <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 ${colorClass}`}>
                                    <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                                  </div>
                                  <div className="flex-1 text-right">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-[8px] lg:text-[9px] font-bold text-gray-400">
                                        {new Date(n.timestamp).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                      <h4 className="font-black text-primaryDark text-[11px] lg:text-xs">{n.title}</h4>
                                    </div>
                                    <p className="text-gray-500 text-[10px] lg:text-[11px] font-bold leading-relaxed">{n.message}</p>
                                    
                                    {!n.read && (
                                      <button 
                                        onClick={() => markAsRead(n.id)}
                                        className="mt-2 text-[9px] lg:text-[10px] font-black text-primary hover:text-primaryDark transition-colors"
                                      >
                                        تحديد كمقروء
                                      </button>
                                    )}
                                  </div>
                                  <button 
                                    onClick={() => removeNotification(n.id)}
                                    className="absolute top-2 left-2 p-1 opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </motion.div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="p-10 lg:p-12 text-center">
                            <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Bell className="w-7 h-7 lg:w-8 lg:h-8 text-gray-200" />
                            </div>
                            <p className="text-gray-400 font-bold text-xs lg:text-sm">لا توجد تنبيهات حالياً</p>
                          </div>
                        )}
                      </div>

                      {notifications.length > 0 && (
                        <div className="p-4 bg-gray-50/50 border-t border-gray-50">
                          <button className="w-full py-2.5 text-center text-[9px] lg:text-[10px] font-black text-primary hover:text-primaryDark transition-colors uppercase tracking-widest">
                            عرض جميع التنبيهات
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden lg:block h-10 w-px bg-primary/10 mx-2" />

            {/* الملف الشخصي - ديسكتوب */}
            {user ? (
              <div className="relative hidden lg:block">
                <button 
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all shadow-sm group border ${
                    useLightText
                      ? 'bg-white/10 border-white/10 hover:border-white/30 text-white'
                      : 'bg-white border-gray-100 hover:border-primary text-primaryDark'
                  }`}
                >
                  <div className="text-right">
                    <p className={`text-[9px] font-bold uppercase tracking-widest leading-none mb-1 ${useLightText ? 'text-white/60' : 'text-gray-400'}`}>مرحباً بك</p>
                    <p className={`text-[11px] font-bold ${useLightText ? 'text-white' : 'text-primaryDark'}`}>{user.name}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    useLightText
                      ? 'bg-white/10 text-white group-hover:bg-white group-hover:text-primary'
                      : 'bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white'
                  }`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </button>
                
                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full left-0 mt-4 w-56 bg-white rounded-2xl shadow-2xl border border-gray-50 overflow-hidden py-2"
                    >
                       <button 
                         onClick={() => { navigate('/orders'); setShowProfileMenu(false); }}
                         className="w-full text-right px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                       >
                         طلباتي
                       </button>
                       <button 
                         onClick={() => { navigate('/settings'); setShowProfileMenu(false); }}
                         className="w-full text-right px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
                       >
                         الإعدادات
                       </button>
                       <div className="h-px bg-gray-50 my-2 mx-4" />
                       <button 
                         onClick={onLogout}
                         className="w-full text-right px-6 py-3 text-sm font-black text-red-400 hover:bg-red-50 transition-colors"
                       >
                          تسجيل الخروج
                       </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenLogin}
                className={`hidden lg:flex items-center gap-3 font-bold text-xs hover:text-accent transition-all group ${useLightText ? 'text-white' : 'text-primary'}`}
              >
                <span>تسجيل الدخول</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                  useLightText 
                    ? 'bg-white/10 text-white group-hover:bg-white group-hover:text-primary' 
                    : 'bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white'
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
              </motion.button>
            )}
          </div>

          {/* الشعار - المنتصف */}
          <Link 
            to="/"
            className="flex flex-col items-center group relative order-2"
          >
            <motion.img 
              layout
              src={useLightText ? "/img/logo/logo-light.png" : "/img/logo/logo.png"}
              alt="يسلمو"
              className={`transition-all duration-500 object-contain ${isScrolled ? 'h-8 lg:h-10' : 'h-12 lg:h-16'}`}
            />
          </Link>

          {/* القائمة - اليسار (ديسكتوب وموبايل) */}
          <div className="flex items-center gap-4 lg:gap-12 order-3">
            {/* روابط الديسكتوب */}
            <div className="hidden lg:flex items-center gap-12">
              {menuLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path}
                  className="group relative py-2"
                >
                  <span className={`text-base font-bold transition-colors ${useLightText ? 'text-white hover:text-accent' : 'text-primary hover:text-primaryDark'}`}>
                    {link.label}
                  </span>
                  <span className="absolute bottom-0 right-0 w-0 h-1 bg-accent rounded-full group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
              
              <button className={`p-3 rounded-2xl transition-all ${useLightText ? 'bg-white/10 hover:bg-white hover:text-primary text-white' : 'bg-primary/5 hover:bg-primary hover:text-white text-primary'}`}>
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                 </svg>
              </button>
            </div>

            {/* زر القائمة للموبايل */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${useLightText ? 'text-white bg-white/10' : 'text-primary bg-primary/5'}`}
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </motion.button>
          </div>
        </nav>
      </header>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-primaryDark/40 backdrop-blur-md z-[200] lg:hidden"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[210] lg:hidden shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-8 flex items-center justify-between border-b border-gray-50">
                 <div className="flex flex-col">
                    <img src="/img/logo/logo.png" alt="يسلمو" className="h-10 object-contain" />
                 </div>
                 <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"
                 >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                 </button>
              </div>

              {/* User Section (Mobile) */}
              <div className="p-8 bg-gray-50/50">
                {user ? (
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center text-xl font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">طاب يومك</p>
                      <p className="text-lg font-bold text-primaryDark">{user.name}</p>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); onOpenLogin(); }}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
                  >
                    <span>تسجيل الدخول</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Links List */}
              <div className="flex-1 overflow-y-auto p-8 space-y-4">
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-6 border-b border-gray-50 pb-2">التنقل السريع</p>
                {menuLinks.map((link) => (
                  <button 
                    key={link.path}
                    onClick={() => handleMobileNavigate(link.path)}
                    className="w-full text-right py-4 px-6 rounded-2xl hover:bg-primary/5 text-lg font-bold text-primaryDark flex items-center justify-between group"
                  >
                    <svg className="w-5 h-5 text-primary/20 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>{link.label}</span>
                  </button>
                ))}
                
                <div className="pt-8 space-y-4">
                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-6 border-b border-gray-50 pb-2">إجراءات إضافية</p>
                  <button 
                    onClick={() => handleMobileNavigate('/wishlist')}
                    className="w-full text-right py-4 px-6 rounded-2xl bg-accent/10 text-primary font-bold text-sm flex items-center justify-between"
                  >
                    <div className="bg-white/50 px-2 py-1 rounded-lg text-xs">{wishlistCount}</div>
                    <div className="flex items-center gap-3">
                       <span>قائمة الأمنيات</span>
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </button>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-8 border-t border-gray-50">
                {user ? (
                   <button 
                    onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}
                    className="w-full py-4 text-center text-red-400 font-bold text-sm hover:bg-red-50 rounded-xl transition-colors"
                   >
                     تسجيل الخروج
                   </button>
                ) : (
                  <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest">جميع الحقوق محفوظة &copy; يسلمو</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation Bar (Hidden on Desktop) */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3.5 flex items-center justify-around z-[150] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] pb-safe"
        dir="rtl"
      >
        {/* الفئات */}
        <button 
          onClick={() => navigate('/shop')}
          className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-colors duration-200 ${location.pathname === '/shop' ? 'text-[#FF3B30]' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <LayoutGrid className="w-6 h-6 stroke-[1.5]" />
          <span className="text-[11px] font-bold tracking-tight">الفئات</span>
        </button>

        {/* الرئيسية */}
        <button 
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-colors duration-200 ${location.pathname === '/' ? 'text-[#FF3B30]' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <Home className={`w-6 h-6 stroke-[1.5] ${location.pathname === '/' ? 'fill-[#FF3B30]/10' : ''}`} />
          <span className="text-[11px] font-bold tracking-tight">الرئيسية</span>
        </button>

        {/* العربة */}
        <button 
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center gap-1.5 flex-1 text-gray-400 hover:text-gray-700 relative"
        >
          <div className="relative">
            <ShoppingCart className="w-6 h-6 stroke-[1.5]" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-[#FF3B30] text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white px-1">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold tracking-tight">العربة</span>
        </button>

        {/* حسابي */}
        <button 
          onClick={() => {
            if (user) {
              navigate('/settings');
            } else {
              onOpenLogin();
            }
          }}
          className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-colors duration-200 ${location.pathname === '/settings' ? 'text-[#FF3B30]' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <UserIcon className="w-6 h-6 stroke-[1.5]" />
          <span className="text-[11px] font-bold tracking-tight">حسابي</span>
        </button>
      </div>
    </>
  );
};

export default Navbar;
