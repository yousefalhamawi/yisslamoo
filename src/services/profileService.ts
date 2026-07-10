import { toast } from 'react-hot-toast';
import { supabase } from '../supabase';

export interface AdminProfile {
  id?: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  lastLogin: string;
}

const TABLE_NAME = 'profiles';

export const profileService = {
  getProfile: async (userId: string): Promise<AdminProfile> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (GET):', error);
      throw error;
    }
    return data as AdminProfile;
  },

  updateProfile: async (profile: AdminProfile): Promise<AdminProfile> => {
    // If we have an ID, we upsert by ID. If not, we try to upsert by email
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert(profile, { onConflict: profile.id ? 'id' : 'email' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (UPDATE):', error);
      throw new Error('فشل في تحديث الملف الشخصي');
    }
    toast.success('تم تحديث البيانات بنجاح');
    return data as AdminProfile;
  },

  createInvite: async (email: string, role: string): Promise<AdminProfile> => {
    // التحقق أولاً مما إذا كان البريد موجوداً
    const { data: existing } = await supabase
      .from(TABLE_NAME)
      .select('id')
      .eq('email', email)
      .maybeSingle();

    let data, error;
    if (existing) {
      // تحديث الدور فقط إذا كان المستخدم موجوداً
      const result = await supabase
        .from(TABLE_NAME)
        .update({
          role,
          name: email.split('@')[0],
          avatar: `https://i.pravatar.cc/150?u=${email}`,
          lastLogin: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .maybeSingle();
      data = result.data;
      error = result.error;
    } else {
      // إضافة جديد — نولّد UUID مؤقت. سيُستبدل بـ auth user id عند أول تسجيل دخول
      const tempId = crypto.randomUUID();
      const result = await supabase
        .from(TABLE_NAME)
        .insert({
          id: tempId,
          email,
          role,
          name: email.split('@')[0],
          avatar: `https://i.pravatar.cc/150?u=${email}`,
          lastLogin: new Date().toISOString()
        })
        .select()
        .maybeSingle();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Supabase Error (INVITE):', error);
      throw new Error('فشل في إنشاء الدعوة');
    }
    return data as AdminProfile;
  },

  getAllStaff: async (): Promise<AdminProfile[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase Error (LIST STAFF):', error);
      throw new Error('فشل في جلب قائمة الفريق');
    }
    return data as AdminProfile[];
  },

  deleteStaff: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (DELETE STAFF):', error);
      throw new Error('فشل في حذف العضو');
    }
  },

  findByEmail: async (email: string): Promise<AdminProfile | null> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (FIND BY EMAIL):', error);
      return null;
    }
    return data as AdminProfile;
  }
};
