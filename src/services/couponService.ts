
import { supabase } from '../supabase';
import { Coupon } from '../types/admin';

const TABLE_NAME = 'coupons';

export const couponService = {
  getAll: async (): Promise<Coupon[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('code', { ascending: true });

    if (error) {
      console.error('Supabase Error (LIST):', error);
      throw new Error('فشل في جلب الكوبونات من Supabase');
    }
    return data as Coupon[];
  },

  create: async (coupon: Omit<Coupon, 'id'>): Promise<Coupon> => {
    const toSend: any = {
      ...coupon,
      min_order_amount: coupon.minOrderAmount,
      usage_limit: coupon.usageLimit,
      used_count: coupon.usedCount,
      expiry_date: coupon.expiryDate,
      created_at: new Date().toISOString()
    };
    
    // Remove camelCase fields
    delete toSend.minOrderAmount;
    delete toSend.usageLimit;
    delete toSend.usedCount;
    delete toSend.expiryDate;
    delete toSend.createdAt;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([toSend])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error (CREATE):', error);
      throw new Error('فشل في إضافة الكوبون إلى Supabase');
    }
    return data as Coupon;
  },

  update: async (id: string, coupon: Partial<Coupon>): Promise<Coupon> => {
    const toSend: any = { ...coupon };
    
    if (toSend.minOrderAmount !== undefined) {
      toSend.min_order_amount = toSend.minOrderAmount;
      delete toSend.minOrderAmount;
    }
    if (toSend.usageLimit !== undefined) {
      toSend.usage_limit = toSend.usageLimit;
      delete toSend.usageLimit;
    }
    if (toSend.usedCount !== undefined) {
      toSend.used_count = toSend.usedCount;
      delete toSend.usedCount;
    }
    if (toSend.expiryDate) {
      toSend.expiry_date = toSend.expiryDate;
      delete toSend.expiryDate;
    }
    
    toSend.updated_at = new Date().toISOString();
    delete toSend.updatedAt;

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(toSend)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Error (UPDATE):', error);
      throw new Error('فشل في تحديث الكوبون في Supabase');
    }
    return data as Coupon;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (DELETE):', error);
      throw new Error('فشل في حذف الكوبون من Supabase');
    }
  }
};
