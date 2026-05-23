
import { supabase } from '../supabase';
import { Category } from '../types/admin';

const TABLE_NAME = 'categories';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase Error (LIST):', error);
      throw new Error('فشل في جلب التصنيفات من Supabase');
    }
    return data as Category[];
  },

  getById: async (id: string): Promise<Category | undefined> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (GET):', error);
      return undefined;
    }
    return data as Category;
  },

  create: async (category: Omit<Category, 'id'>): Promise<Category> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{
        ...category,
        createdAt: new Date().toISOString()
      }])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (CREATE):', error);
      const msg = error.message === 'Failed to fetch'
        ? 'فشل الاتصال بـ Supabase (Failed to fetch). يرجى التحقق من اتصال الإنترنت.'
        : `فشل في إضافة التصنيف إلى Supabase: ${error.message} (${error.code})`;
      throw new Error(msg);
    }
    return data as Category;
  },

  update: async (id: string, category: Partial<Category>): Promise<Category> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        ...category,
        updatedAt: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (UPDATE):', error);
      const msg = error.message === 'Failed to fetch'
        ? 'فشل الاتصال بـ Supabase (Failed to fetch). يرجى التحقق من اتصال الإنترنت.'
        : `فشل في تحديث التصنيف في Supabase: ${error.message} (${error.code})`;
      throw new Error(msg);
    }
    return data as Category;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (DELETE):', error);
      throw new Error('فشل في حذف التصنيف من Supabase');
    }
  }
};
