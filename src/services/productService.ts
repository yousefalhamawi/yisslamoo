
import { supabase } from '../supabase';
import { Product } from '../types/index';
import { unpoison } from '../utils/unpoison';

const TABLE_NAME = 'products';

export const productService = {
  getAll: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase Error (LIST):', error);
      const msg = error.message === 'Failed to fetch' 
        ? 'فشل الاتصال بـ Supabase (Failed to fetch). يرجى التحقق من اتصال الإنترنت أو إعدادات Supabase.'
        : `فشل في جلب المنتجات من Supabase: ${error.message}`;
      throw new Error(msg);
    }
    
    // Unpoison data to handle potential corruption
    return (data || []).map(p => unpoison(p)) as Product[];
  },

  getById: async (id: string): Promise<Product | undefined> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (GET):', error);
      return undefined;
    }
    return unpoison(data) as Product;
  },

  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    console.log('productService.create - Sending to Supabase:', product);
    
    const toSend = { ...product } as any;
    if (toSend.features && Array.isArray(toSend.features)) {
      toSend.features = toSend.features.map((f: any) => typeof f === 'object' ? JSON.stringify(f) : f);
    }
    if (toSend.specifications && typeof toSend.specifications === 'object') {
      toSend.specifications = JSON.stringify(toSend.specifications);
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{
        ...toSend,
        createdAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error (CREATE):', error);
      throw new Error(`فشل في إضافة المنتج إلى Supabase: ${error.message}`);
    }
    return unpoison(data) as Product;
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    console.log('productService.update - Sending to Supabase:', { id, product });
    
    const toSend = { ...product } as any;
    if (toSend.features && Array.isArray(toSend.features)) {
      toSend.features = toSend.features.map((f: any) => typeof f === 'object' ? JSON.stringify(f) : f);
    }
    if (toSend.specifications && typeof toSend.specifications === 'object') {
      toSend.specifications = JSON.stringify(toSend.specifications);
    }

    // أولاً: التحقق من التوثيق
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("جلسة التوثيق غير فعالة! أنت تستخدم واجهة الإدارة بصلاحيات تجريبية (Mock) ولا يمكنك التعديل على قاعدة البيانات مباشرة. يرجى تسجيل الدخول بحساب حقيقي أو تفعيل جلسة الزائر.");
    }

    // ثانياً: نُنفِّذ التحديث بدون .single() لتجنب خطأ PGRST116
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({
        ...toSend,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (UPDATE):', error);
      throw new Error(`فشل في تحديث المنتج في Supabase: ${error.message}`);
    }

    // ثانياً: نجلب المنتج المحدَّث في استدعاء منفصل
    const { data: updated, error: fetchError } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !updated) {
      // التحديث نجح، لكن الجلب فشل — نعيد البيانات المحلية
      console.warn('productService.update - could not re-fetch, returning local data');
      return unpoison({ id, ...product }) as Product;
    }

    console.log('productService.update - Received from Supabase:', updated);
    return unpoison(updated) as Product;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (DELETE):', error);
      throw new Error('فشل في حذف المنتج من Supabase');
    }
  }
};
