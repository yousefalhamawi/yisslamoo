
import { useMemo } from 'react';
import { useSharedStore } from '../store/useSharedStore';
import { ShoppingCart, Package, Users, Bell, Star } from 'lucide-react';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  time: string;
  timestamp: number;
  type: 'order' | 'stock' | 'customer' | 'review' | 'general';
  icon: any;
}

const formatTimeAgo = (dateString: string | number) => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;
  } catch (e) {
    return 'غير متوفر';
  }
};

export const useAdminNotifications = () => {
  const { orders, products, customers, reviews } = useSharedStore();

  const notifications = useMemo(() => {
    const notifs: AdminNotification[] = [];

    // 1. New Orders
    orders
      .filter(o => o.status === 'new')
      .forEach(order => {
        const timestamp = new Date(order.date).getTime();
        notifs.push({
          id: `order-${order.id}`,
          title: 'طلب جديد',
          message: `طلب جديد من ${order.customerName} بقيمة ${order.total.toLocaleString()} ل.س`,
          time: formatTimeAgo(order.date),
          timestamp,
          type: 'order',
          icon: ShoppingCart
        });
      });

    // 2. Low Stock
    products
      .filter(p => p.stock < 10)
      .forEach(product => {
        notifs.push({
          id: `stock-${product.id}`,
          title: 'تنبيه مخزون',
          message: `المنتج "${product.name}" قارب على الانتهاء (${product.stock} قطع متبقية)`,
          time: 'تنبيه مخزون',
          timestamp: Date.now() - 1000, // Slightly older than "now" to show below new orders
          type: 'stock',
          icon: Package
        });
      });

    // 3. New Customers
    customers.slice(-3).forEach(customer => {
      const timestamp = customer.joinDate ? new Date(customer.joinDate).getTime() : Date.now() - 2000;
      notifs.push({
        id: `customer-${customer.id}`,
        title: 'عميل جديد',
        message: `تم تسجيل عميل جديد: ${customer.name}`,
        time: customer.joinDate ? formatTimeAgo(customer.joinDate) : 'مؤخراً',
        timestamp,
        type: 'customer',
        icon: Users
      });
    });

    // 4. New Reviews
    if (reviews) {
      reviews
        .filter(r => r.status === 'pending')
        .forEach(review => {
          const timestamp = new Date(review.date).getTime();
          notifs.push({
            id: `review-${review.id}`,
            title: 'تقييم جديد',
            message: `تقييم جديد من ${review.customer} على ${review.productName}`,
            time: formatTimeAgo(review.date),
            timestamp,
            type: 'review',
            icon: Star
          });
        });
    }

    // Combine and ensure unique IDs, then sort by timestamp
    const uniqueNotifs = new Map<string, AdminNotification>();
    
    notifs.forEach(n => {
      if (!uniqueNotifs.has(n.id)) {
        uniqueNotifs.set(n.id, n);
      }
    });

    return Array.from(uniqueNotifs.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [orders, products, customers, reviews]);

  return { notifications };
};
