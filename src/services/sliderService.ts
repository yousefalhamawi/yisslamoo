import { supabase } from '../supabase';
import { HeroSlide } from '../types/admin';

const TABLE_NAME = 'hero_slides';

/** الحقول التي يملكها العميل ويُسمح بإرسالها لقاعدة البيانات */
type SlideInput = Omit<HeroSlide, 'id'> & {
  sort_order?: number;
  status?: 'active' | 'inactive';
};

/** يزيل الحقول التي تولّدها قاعدة البيانات قبل الإرسال */
const toRow = (slide: Partial<SlideInput>) => {
  const { ...rest } = slide;
  return rest;
};

export const sliderService = {
  /** يجلب الشرائح مرتّبة حسب ترتيب العرض */
  getAll: async (): Promise<HeroSlide[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase Error (SLIDES LIST):', error);
      throw new Error('فشل في جلب شرائح السلايدر');
    }

    return (data || []) as HeroSlide[];
  },

  create: async (slide: SlideInput): Promise<HeroSlide> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([toRow(slide)])
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (SLIDE CREATE):', error);
      throw new Error(`فشل في إضافة السلايد: ${error.message}`);
    }

    return data as HeroSlide;
  },

  update: async (id: string, updates: Partial<SlideInput>): Promise<HeroSlide> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update(toRow(updates))
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (SLIDE UPDATE):', error);
      throw new Error(`فشل في تحديث السلايد: ${error.message}`);
    }

    return data as HeroSlide;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);

    if (error) {
      console.error('Supabase Error (SLIDE DELETE):', error);
      throw new Error('فشل في حذف السلايد');
    }
  }
};
