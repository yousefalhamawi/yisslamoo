import { supabase } from '../supabase';
import { Collection } from '../types/admin';

const TABLE_NAME = 'collections';

export const collectionService = {
  list: async (): Promise<Collection[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false }); // ✅ تم التصحيح

    if (error) {
      console.error('Supabase Error (LIST):', error);
      if (error.code === 'PGRST204' || error.message.includes('relation "collections" does not exist')) {
        return [];
      }
      throw new Error('فشل في جلب المواسم');
    }

    // ✅ تحويل snake_case → camelCase
    return data.map(item => ({
      ...item,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })) as Collection[];
  },

  add: async (collection: Omit<Collection, 'id'>): Promise<Collection> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{
        ...collection,
        created_at: new Date().toISOString(), // ✅ snake_case عند الإرسال
        updated_at: new Date().toISOString(),
      }])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (ADD):', error);
      throw new Error('فشل في إضافة المجموعة');
    }
    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as Collection;
  },

  update: async (id: string, collection: Partial<Collection>): Promise<Collection> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({
        ...collection,
        updated_at: new Date().toISOString(), // ✅ snake_case عند التحديث
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (UPDATE):', error);
      throw new Error('فشل في تحديث المجموعة');
    }
    return {
      ...data,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    } as Collection;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (DELETE):', error);
      throw new Error('فشل في حذف المجموعة');
    }
  }
};