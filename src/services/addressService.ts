
import { supabase } from '../supabase';
import { Address } from '../types/admin';

const TABLE_NAME = 'addresses';

export const addressService = {
  getByCustomerId: async (customerId: string): Promise<Address[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('customer_id', customerId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error (LIST ADDRESSES):', error);
      throw new Error('فشل في جلب العناوين من Supabase');
    }
    return data as Address[];
  },

  add: async (address: Omit<Address, 'id' | 'createdAt' | 'updatedAt'>): Promise<Address> => {
    // The unique index in SQL handles the "one default" constraint, 
    // but we still unset others manually for a smoother UI experience before the DB constraint kicks in.
    if (address.is_default) {
      await supabase
        .from(TABLE_NAME)
        .update({ is_default: false })
        .eq('customer_id', address.customer_id);
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([{ 
        customer_id: address.customer_id,
        full_name: address.full_name,
        phone: address.phone,
        country: address.country,
        city: address.city,
        street: address.street,
        building: address.building,
        notes: address.notes,
        is_default: address.is_default
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error (ADD ADDRESS):', error);
      throw new Error('فشل في إضافة العنوان في Supabase');
    }
    return data as Address;
  },

  update: async (id: string, updates: Partial<Address>): Promise<Address> => {
    // If we're setting this as default, unset others
    if (updates.is_default) {
      const { data: currentAddress } = await supabase
        .from(TABLE_NAME)
        .select('customer_id')
        .eq('id', id)
        .single();
      
      if (currentAddress) {
        await supabase
          .from(TABLE_NAME)
          .update({ is_default: false })
          .eq('customer_id', currentAddress.customer_id);
      }
    }

    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (UPDATE ADDRESS):', error);
      throw new Error('فشل في تحديث العنوان في Supabase');
    }
    return data as Address;
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (DELETE ADDRESS):', error);
      throw new Error('فشل في حذف العنوان من Supabase');
    }
  },

  setDefault: async (id: string, customerId: string): Promise<void> => {
    // Unset all defaults for this customer
    await supabase
      .from(TABLE_NAME)
      .update({ is_default: false })
      .eq('customer_id', customerId);

    // Set this one as default
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (SET DEFAULT ADDRESS):', error);
      throw new Error('فشل في تعيين العنوان الافتراضي');
    }
  },

  subscribeToAddresses: (customerId: string, callback: (payload: any) => void) => {
    return supabase
      .channel(`addresses-${customerId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: TABLE_NAME,
        filter: `customer_id=eq.${customerId}`
      }, callback)
      .subscribe();
  }
};
