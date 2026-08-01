import { toast } from '../utils/toast';
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

const invokeStaffManagement = async (
  body: Record<string, unknown>,
): Promise<AdminProfile> => {
  const { data, error } = await supabase.functions.invoke('manage-staff', { body });

  if (error || !data?.profile) {
    console.error('Supabase Error (STAFF MANAGEMENT):', error);
    throw new Error('فشل في إدارة العضو');
  }

  return data.profile as AdminProfile;
};

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

  updateOwnProfile: async (profile: AdminProfile): Promise<AdminProfile> => {
    const updatedProfile = await invokeStaffManagement({
      action: 'update-self',
      name: profile.name,
      avatar: profile.avatar,
    });
    toast.success('تم تحديث البيانات بنجاح');
    return updatedProfile;
  },

  createInvite: async (email: string, role: string): Promise<AdminProfile> => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error } = await supabase.functions.invoke('invite-staff', {
      body: { email: normalizedEmail, role },
    });

    if (error || !data?.profile) {
      console.error('Supabase Error (INVITE):', error);
      throw new Error('فشل في إنشاء الدعوة');
    }

    return data.profile as AdminProfile;
  },

  updateStaffRole: async (staffId: string, role: string): Promise<AdminProfile> => (
    invokeStaffManagement({ action: 'change-role', staffId, role })
  ),

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

  deleteStaff: async (staffId: string): Promise<void> => {
    await invokeStaffManagement({ action: 'delete', staffId });
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
  },
};
