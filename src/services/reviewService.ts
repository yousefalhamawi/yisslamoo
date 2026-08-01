
import { supabase } from '../supabase';
import { Review } from '../types/admin';

const TABLE_NAME = 'reviews';

export const reviewService = {
  getAll: async (): Promise<Review[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase Error (LIST):', error);
      throw new Error('فشل في جلب التقييمات من Supabase');
    }
    return data as Review[];
  },

  getByProduct: async (productId: string): Promise<Review[]> => {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('productId', productId)
        .eq('status', 'approved');

      if (error) {
        console.error('Supabase Error Details (GET_BY_PRODUCT):', error);
        // Fallback or more specific message
        if (error.code === 'PGRST204') return []; // Column not found handled
        throw error;
      }

      // Sort manually if date column might be missing or to ensure consistency
      const sortedData = (data as Review[]).sort((a, b) => 
        new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime()
      );

      return sortedData;
    } catch (error) {
      console.error('Detailed Review Fetch Error:', error);
      throw new Error('فشل في جلب تقييمات المنتج. تأكد من إعداد قاعدة البيانات بشكل صحيح.');
    }
  },

  add: async (review: Omit<Review, 'id' | 'status'>): Promise<Review> => {
    const pendingReview: Review = {
      ...review,
      id: globalThis.crypto.randomUUID(),
      status: 'pending',
    };

    // Public visitors are intentionally unable to read pending reviews. Avoid
    // requesting a returned row here, otherwise PostgREST evaluates the SELECT
    // RLS policy after the insert and rejects the submission.
    const { error } = await supabase
      .from(TABLE_NAME)
      .insert([pendingReview]);

    if (error) {
      console.error('Supabase Error (ADD):', error);
      throw new Error('فشل في إضافة التقييم. يرجى المحاولة لاحقاً.');
    }
    return pendingReview;
  },

  updateStatus: async (id: string, status: Review['status']): Promise<Review> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ status, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (UPDATE):', error);
      throw new Error('فشل في تحديث حالة التقييم في Supabase');
    }
    return data as Review;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (DELETE):', error);
      throw new Error('فشل في حذف التقييم من Supabase');
    }
  }
};
