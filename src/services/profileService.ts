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

const DEFAULT_PROFILE: AdminProfile = {
  name: 'محمد أحمد',
  email: '6masar@gmail.com',
  role: 'مدير النظام',
  avatar: 'https://i.pravatar.cc/150?u=6masar@gmail.com',
  lastLogin: new Date().toISOString()
};

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
      
      // Check if the current user is one of the hardcoded admins
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      const adminEmails = ['yousefalhamawi2@gmail.com', 'alkhrraz3@gmail.com', 'admin@yaslamo.com'];
      
      if (user && adminEmails.includes(user.email || '')) {
        return {
          id: userId,
          name: user.user_metadata?.full_name || 'مدير يسلمو',
          email: user.email || '',
          role: 'مدير النظام',
          avatar: user.user_metadata?.avatar_url || `https://i.pravatar.cc/150?u=${user.email}`,
          lastLogin: new Date().toISOString()
        };
      }

      return { ...DEFAULT_PROFILE, id: userId };
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
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert({
        email,
        role,
        name: email.split('@')[0], // Default name from email
        avatar: `https://i.pravatar.cc/150?u=${email}`,
        lastLogin: new Date().toISOString()
      }, { onConflict: 'email' })
      .select()
      .maybeSingle();

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
