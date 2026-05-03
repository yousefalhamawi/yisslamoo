
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Coupon } from '../types/admin';
import { couponService } from '../services/couponService';
import { checkSupabaseConfig } from '../supabase';

export const useCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoupons = async () => {
    if (!checkSupabaseConfig()) {
      console.warn('Supabase not configured, skipping fetchCoupons');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await couponService.getAll();
      setCoupons(data);
    } catch (err) {
      setError('Failed to fetch coupons');
      toast.error('فشل في تحميل الكوبونات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const addCoupon = async (coupon: Omit<Coupon, 'id'>) => {
    const loadingToast = toast.loading('جاري إضافة الكوبون...');
    try {
      const newCoupon = await couponService.create(coupon);
      setCoupons(prev => [newCoupon, ...prev]);
      toast.success('تم إضافة الكوبون بنجاح', { id: loadingToast });
      return newCoupon;
    } catch (err) {
      setError('Failed to add coupon');
      toast.error('فشل في إضافة الكوبون', { id: loadingToast });
      throw err;
    }
  };

  const updateCoupon = async (id: string, coupon: Partial<Coupon>) => {
    const loadingToast = toast.loading('جاري تحديث الكوبون...');
    try {
      const updated = await couponService.update(id, coupon);
      setCoupons(prev => prev.map(c => c.id === id ? updated : c));
      toast.success('تم تحديث الكوبون بنجاح', { id: loadingToast });
      return updated;
    } catch (err) {
      setError('Failed to update coupon');
      toast.error('فشل في تحديث الكوبون', { id: loadingToast });
      throw err;
    }
  };

  const deleteCoupon = async (id: string) => {
    const loadingToast = toast.loading('جاري حذف الكوبون...');
    try {
      await couponService.delete(id);
      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success('تم حذف الكوبون بنجاح', { id: loadingToast });
    } catch (err) {
      setError('Failed to delete coupon');
      toast.error('فشل في حذف الكوبون', { id: loadingToast });
      throw err;
    }
  };

  return {
    coupons,
    loading,
    error,
    addCoupon,
    updateCoupon,
    deleteCoupon,
    refresh: fetchCoupons
  };
};
