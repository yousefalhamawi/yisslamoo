
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Order } from '../types/admin';
import { useSharedStore } from '../store/useSharedStore';
import { orderService } from '../services/orderService';
import { checkSupabaseConfig } from '../supabase';

export const useOrders = () => {
  const { orders, setOrders, updateOrder: storeUpdateOrder, deleteOrder: storeDeleteOrder } = useSharedStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!checkSupabaseConfig()) return;
    
    setLoading(true);
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err: any) {
      const msg = err.message?.includes('Failed to fetch')
        ? 'فشل الاتصال بـ Supabase (Failed to fetch). يرجى التحقق من اتصال الإنترنت أو إعدادات Supabase.'
        : 'فشل في جلب الطلبات';
      setError(msg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    const loadingToast = toast.loading('جاري تحديث حالة الطلب...');
    try {
      if (checkSupabaseConfig()) {
        await orderService.updateStatus(id, status);
      }
      storeUpdateOrder(id, { status });
      toast.success('تم تحديث حالة الطلب بنجاح', { id: loadingToast });
    } catch (err) {
      setError('Failed to update order status');
      toast.error('فشل في تحديث حالة الطلب', { id: loadingToast });
      throw err;
    }
  };

  const deleteOrder = async (id: string) => {
    const loadingToast = toast.loading('جاري حذف الطلب...');
    try {
      if (checkSupabaseConfig()) {
        await orderService.delete(id);
      }
      storeDeleteOrder(id);
      toast.success('تم حذف الطلب بنجاح', { id: loadingToast });
    } catch (err) {
      setError('Failed to delete order');
      toast.error('فشل في حذف الطلب', { id: loadingToast });
      throw err;
    }
  };

  return {
    orders,
    loading,
    error,
    updateOrderStatus,
    deleteOrder,
    refresh: () => {}
  };
};
