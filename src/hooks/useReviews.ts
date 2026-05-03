
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Review } from '../types/admin';
import { reviewService } from '../services/reviewService';
import { checkSupabaseConfig } from '../supabase';

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    if (!checkSupabaseConfig()) {
      console.warn('Supabase not configured, skipping fetchReviews');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await reviewService.getAll();
      setReviews(data);
    } catch (err) {
      setError('Failed to fetch reviews');
      toast.error('فشل في تحميل التقييمات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateReviewStatus = async (id: string, status: Review['status']) => {
    if (!checkSupabaseConfig()) return;
    
    const loadingToast = toast.loading('جاري تحديث حالة التقييم...');
    try {
      const updated = await reviewService.updateStatus(id, status);
      setReviews(prev => prev.map(r => r.id === id ? updated : r));
      toast.success('تم تحديث حالة التقييم بنجاح', { id: loadingToast });
      return updated;
    } catch (err) {
      setError('Failed to update review status');
      toast.error('فشل في تحديث حالة التقييم', { id: loadingToast });
      throw err;
    }
  };

  const deleteReview = async (id: string) => {
    if (!checkSupabaseConfig()) return;
    
    const loadingToast = toast.loading('جاري حذف التقييم...');
    try {
      await reviewService.delete(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('تم حذف التقييم بنجاح', { id: loadingToast });
    } catch (err) {
      setError('Failed to delete review');
      toast.error('فشل في حذف التقييم', { id: loadingToast });
      throw err;
    }
  };

  return {
    reviews,
    loading,
    error,
    updateReviewStatus,
    deleteReview,
    refresh: fetchReviews
  };
};
