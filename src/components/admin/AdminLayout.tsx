
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  User, 
  LogOut,
  ChevronLeft,
  Globe,
  ShoppingCart,
  Settings,
  Package,
  Users
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { ADMIN_NAV_ITEMS, AdminPageState } from '../../types/admin';
import { useAdminNotifications } from '../../hooks/useAdminNotifications';

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: AdminPageState;
  onNavigate: (page: AdminPageState) => void;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, currentPage, onNavigate, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { notifications } = useAdminNotifications();

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-right font-sans" dir="rtl">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 right-0 z-50 bg-white border-l border-slate-200 transition-all duration-300 shadow-sm",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          {isSidebarOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <img src="/img/logo/logo.png" alt="يسلمو" className="h-10 object-contain" />
              <span className="text-xl font-black text-slate-900">لوحة التحكم</span>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 transition-colors"
          >
            {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)] custom-scrollbar">
          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group relative",
                  isActive 
                    ? "bg-indigo-50 text-indigo-600 font-bold" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-900")} />
                {isSidebarOpen && (
                  <span className="text-sm">{item.label}</span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute right-0 w-1 h-6 bg-indigo-600 rounded-l-full"
                  />
                )}
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-red-500 hover:bg-red-50 transition-all group"
            >
              <LogOut className="w-5 h-5" />
              {isSidebarOpen && <span className="text-sm font-bold">تسجيل الخروج</span>}
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main 
        className={cn(
          "flex-1 transition-all duration-300 min-h-screen",
          isSidebarOpen ? "mr-72" : "mr-20"
        )}
      >
        {/* Top Navbar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          {/* Search */}
          <div className="relative w-96 hidden md:block">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="ابحث عن طلبات، منتجات، عملاء..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pr-11 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all relative">
              <Globe className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-500 transition-all relative"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
              
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="fixed inset-x-4 top-24 md:absolute md:inset-auto md:top-full md:left-0 md:mt-2 w-auto md:w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-slate-200 p-4 z-50 origin-top-left"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-black text-slate-900 text-sm">التنبيهات</h3>
                      {notifications.length > 0 && (
                        <span className="bg-indigo-50 text-indigo-600 text-[9px] font-black px-2 py-0.5 rounded-full">
                          {notifications.length} جديدة
                        </span>
                      )}
                    </div>
                    <div className="space-y-3 max-h-[60vh] md:max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                      {notifications.length > 0 ? (
                        notifications.map(notif => {
                          const Icon = notif.icon;
                          return (
                            <div key={notif.id} className="flex gap-3 p-2 hover:bg-slate-50 rounded-lg transition-all cursor-pointer group">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all",
                                notif.type === 'order' ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white" :
                                notif.type === 'stock' ? "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white" :
                                notif.type === 'review' ? "bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white" :
                                "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white"
                              )}>
                                <Icon className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-900">{notif.message}</p>
                                <p className="text-xs text-slate-500">{notif.time}</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8">
                          <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 font-bold">لا توجد تنبيهات جديدة</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button className="w-full mt-4 pt-3 border-t border-slate-100 text-center text-xs font-black text-indigo-600 hover:text-indigo-700 transition-all">
                        عرض كل التنبيهات
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="h-8 w-px bg-slate-200 mx-2" />

            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition-all"
              >
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-black text-slate-900">أدمن</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">مدير المتجر</p>
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 overflow-hidden">
                  <img src="/img/logo/logo.png" alt="Admin" className="w-full h-full object-contain p-1" />
                </div>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50"
                  >
                    <button onClick={() => onNavigate('profile')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-sm font-bold">
                      <User className="w-4 h-4" />
                      الملف الشخصي
                    </button>
                    <button onClick={() => onNavigate('settings')} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-sm font-bold">
                      <Settings className="w-4 h-4" />
                      الإعدادات
                    </button>
                    <div className="h-px bg-slate-100 my-2" />
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all text-sm font-bold">
                      <LogOut className="w-4 h-4" />
                      تسجيل الخروج
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E2E8F0;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
