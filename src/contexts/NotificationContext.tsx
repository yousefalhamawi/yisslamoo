import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LucideIcon, Bell, CheckCircle2, AlertCircle, Info, ShoppingCart, Heart, Package } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info' | 'cart' | 'wishlist' | 'order';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      ...n,
      id,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)); // Keep last 50
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, addNotification, markAsRead, markAllAsRead, removeNotification }}>
      {children}
      <NotificationToastContainer notifications={notifications.filter(n => !n.read).slice(0, 3)} removeNotification={removeNotification} />
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const NotificationToastContainer: React.FC<{ notifications: Notification[], removeNotification: (id: string) => void }> = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-4 md:bottom-6 left-4 right-4 md:right-auto md:left-6 z-[999] flex flex-col gap-3 pointer-events-none md:max-w-sm">
      <AnimatePresence mode="popLayout">
        {notifications.map((n) => (
          <NotificationToast key={n.id} notification={n} onDismiss={() => removeNotification(n.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const NotificationToast: React.FC<{ notification: Notification, onDismiss: () => void }> = ({ notification, onDismiss }) => {
  const Icon = getIcon(notification.type);
  const colorClass = getColorClass(notification.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      layout
      className="pointer-events-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/20 overflow-hidden flex flex-col"
    >
      <div className="p-4 flex gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 text-right">
          <h4 className="font-black text-primaryDark text-sm mb-1">{notification.title}</h4>
          <p className="text-gray-500 text-xs font-bold leading-relaxed">{notification.message}</p>
        </div>
        <button onClick={onDismiss} className="text-gray-300 hover:text-gray-500 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {notification.action && (
        <div className="px-4 pb-4 flex justify-end">
          <button
            onClick={() => {
              notification.action?.onClick();
              onDismiss();
            }}
            className="bg-primary/5 hover:bg-primary hover:text-white text-primary px-4 py-2 rounded-xl text-[10px] font-black transition-all"
          >
            {notification.action.label}
          </button>
        </div>
      )}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: 0 }}
        transition={{ duration: 5, ease: 'linear' }}
        onAnimationComplete={onDismiss}
        className={`h-1 ${colorClass.replace('bg-', 'bg-').replace('/10', '')}`}
      />
    </motion.div>
  );
};

function getIcon(type: NotificationType) {
  switch (type) {
    case 'success': return CheckCircle2;
    case 'error': return AlertCircle;
    case 'cart': return ShoppingCart;
    case 'wishlist': return Heart;
    case 'order': return Package;
    default: return Info;
  }
}

function getColorClass(type: NotificationType) {
  switch (type) {
    case 'success': return 'bg-emerald-50 text-emerald-500';
    case 'error': return 'bg-red-50 text-red-500';
    case 'cart': return 'bg-primary/5 text-primary';
    case 'wishlist': return 'bg-rose-50 text-rose-500';
    case 'order': return 'bg-amber-50 text-amber-500';
    default: return 'bg-blue-50 text-blue-500';
  }
}
