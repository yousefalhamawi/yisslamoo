
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User } from '../../types/index';
import { useNotifications } from '../../contexts/NotificationContext';
import { Bell, LucideIcon, CheckCircle2, AlertCircle, Info, ShoppingCart, Heart, Package, Trash2, CheckCheck, X, House, CircleUserRound, Grid2x2, ShoppingBag, Search, Menu, LogIn, ChevronLeft } from 'lucide-react';
import { shouldUseLightNavbarText } from '../../utils/navbarTheme';
import { getProductSearchPath } from '../../utils/productSearch';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  /**
   * البحث يمرّ عبر الرابط (/shop?search=) ليبقى قابلاً للمشاركة والرجوع إليه.
   */
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const searchPath = getProductSearchPath(searchTerm);
    if (!searchPath) {
      setIsSearchOpen(false);
      return;
    }

    navigate(searchPath);
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  };
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

  const useLightText = shouldUseLightNavbarText(location.pathname, isScrolled);

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
            ? 'py-3 bg-white/80 backdrop-blur-2xl shadow-[0_8px_24px_rgba(46,16,101,0.04)]' 
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
              <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6" strokeWidth={2} />
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
                    <CircleUserRound className="w-6 h-6" strokeWidth={2} />
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
                  <LogIn className="w-5 h-5" strokeWidth={2} />
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
              
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                aria-label="فتح البحث"
                className={`p-3 rounded-2xl transition-all ${useLightText ? 'bg-white/10 hover:bg-white hover:text-primary text-white' : 'bg-primary/5 hover:bg-primary hover:text-white text-primary'}`}
              >
                <Search className="w-6 h-6" strokeWidth={2} />
              </button>
            </div>

            {/* زر القائمة للموبايل */}
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className={`lg:hidden w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${useLightText ? 'text-white bg-white/10' : 'text-primary bg-primary/5'}`}
            >
              <Menu className="w-7 h-7" strokeWidth={2} />
            </motion.button>
          </div>
        </nav>
      </header>

      {/* بحث واضح فوق الصفحة حتى لا يختفي بين عناصر الهيدر في الشاشات الضيقة. */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSearchOpen(false)}
            className="fixed inset-0 z-[300] bg-primaryDark/35 backdrop-blur-sm p-5 flex items-start justify-center pt-28 sm:pt-36"
          >
            <motion.form
              initial={{ opacity: 0, y: -16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSearchSubmit}
              onClick={(event) => event.stopPropagation()}
              data-testid="navbar-search-dialog"
              className="w-full max-w-2xl rounded-3xl bg-white p-3 shadow-2xl"
            >
              <div className="flex items-center gap-3" dir="rtl">
                <input
                  autoFocus
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  onKeyDown={(event) => event.key === 'Escape' && setIsSearchOpen(false)}
                  placeholder="ابحث عن منتج، ماركة أو فئة..."
                  aria-label="ابحث عن منتج"
                  className="min-w-0 flex-1 h-14 rounded-2xl bg-gray-50 border border-gray-100 px-5 text-right text-sm font-bold text-primaryDark outline-none focus:border-primary focus:bg-white"
                />
                <button
                  type="submit"
                  data-testid="navbar-search-submit"
                  className="h-14 shrink-0 rounded-2xl bg-primary px-6 text-sm font-black text-white hover:bg-primaryDark transition-colors"
                >
                  بحث
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  aria-label="إغلاق البحث"
                  className="h-12 w-12 shrink-0 rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors"
                >
                  <X className="mx-auto w-5 h-5" />
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

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
              dir="rtl"
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white z-[210] lg:hidden shadow-2xl flex flex-col"
            >
              {/* Drawer Header */}
              <div className="p-4 flex items-center justify-between border-b border-gray-100">
                 <div className="flex flex-col">
                    <img src="/img/logo/logo.png" alt="يسلمو" className="h-7 object-contain" />
                 </div>
                 <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="إغلاق القائمة"
                  className="w-11 h-11 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 shrink-0"
                 >
                    <X className="w-5 h-5" strokeWidth={2} />
                 </button>
              </div>

              {/* البحث */}
              <form onSubmit={handleSearchSubmit} className="mx-4 mt-4 relative">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن منتج..."
                  aria-label="ابحث عن منتج"
                  className="w-full h-11 pr-4 pl-11 rounded-xl bg-gray-50 border border-gray-200 text-sm text-right outline-none focus:border-primary focus:bg-white transition-colors placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  aria-label="ابحث"
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary transition-colors"
                >
                  <Search className="w-[18px] h-[18px]" strokeWidth={2} />
                </button>
              </form>

              {/* قائمة الأمنيات — مباشرة تحت الشعار لتكون أول ما تراه العين */}
              <button
                onClick={() => handleMobileNavigate('/wishlist')}
                className="mx-4 mt-4 py-3 px-3 rounded-xl bg-accent/15 border border-accent/30 text-primary font-bold text-sm flex items-center justify-between active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-[18px] h-[18px] shrink-0" strokeWidth={2} />
                  <span>قائمة الأمنيات</span>
                </div>
                <div className="bg-white min-w-6 h-6 px-1.5 rounded-md text-xs flex items-center justify-center font-bold">
                  {wishlistCount}
                </div>
              </button>

              {/* User Section (Mobile) */}
              <div className="px-4 py-4 mt-4 bg-gray-50/50">
                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center text-base font-bold shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">طاب يومك</p>
                      <p className="text-sm font-bold text-primaryDark truncate">{user.name}</p>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); onOpenLogin(); }}
                    className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                  >
                    <LogIn className="w-4 h-4" strokeWidth={2} />
                    <span>تسجيل الدخول</span>
                  </button>
                )}
              </div>

              {/* Links List */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mb-2 border-b border-gray-100 pb-2">التنقل السريع</p>
                {menuLinks.map((link) => (
                  <button 
                    key={link.path}
                    onClick={() => handleMobileNavigate(link.path)}
                    className="w-full py-3 px-3 rounded-xl hover:bg-primary/5 active:bg-primary/10 text-[15px] font-bold text-primaryDark flex items-center justify-between group"
                  >
                    <span>{link.label}</span>
                    <ChevronLeft className="w-4 h-4 text-primary/25 group-hover:text-primary transition-colors shrink-0" strokeWidth={2} />
                  </button>
                ))}
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-100">
                {user ? (
                   <button 
                    onClick={() => { setIsMobileMenuOpen(false); onLogout(); }}
                    className="w-full py-3 text-center text-red-400 font-bold text-[13px] hover:bg-red-50 rounded-xl transition-colors"
                   >
                     تسجيل الخروج
                   </button>
                ) : (
                  <p className="text-center text-[9px] text-gray-300 font-bold uppercase tracking-widest">جميع الحقوق محفوظة &copy; يسلمو</p>
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
        {/* الرئيسية */}
        <button 
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-colors duration-200 ${location.pathname === '/' ? 'text-[#4b3976]' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <House className={`w-6 h-6 stroke-[1.5] ${location.pathname === '/' ? 'fill-[#4b3976]/10' : ''}`} />
          <span className="text-[11px] font-bold tracking-tight">الرئيسية</span>
        </button>

        {/* الفئات */}
        <button 
          onClick={() => navigate('/shop')}
          className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-colors duration-200 ${location.pathname === '/shop' ? 'text-[#4b3976]' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <Grid2x2 className="w-6 h-6 stroke-[1.5]" />
          <span className="text-[11px] font-bold tracking-tight">الفئات</span>
        </button>

        {/* العربة */}
        <button 
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center gap-1.5 flex-1 text-gray-400 hover:text-gray-700 relative"
        >
          <div className="relative">
            <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[16px] h-4 bg-[#4b3976] text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white px-1">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold tracking-tight">السلة</span>
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
          className={`flex flex-col items-center justify-center gap-1.5 flex-1 transition-colors duration-200 ${location.pathname === '/settings' ? 'text-[#4b3976]' : 'text-gray-400 hover:text-gray-700'}`}
        >
          <CircleUserRound className="w-6 h-6 stroke-[1.5]" />
          <span className="text-[11px] font-bold tracking-tight">حسابي</span>
        </button>
      </div>
    </>
  );
};

export default Navbar;
