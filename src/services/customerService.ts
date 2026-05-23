
import { supabase } from '../supabase';
import { Customer } from '../types/admin';
import { unpoison } from '../utils/unpoison';

const TABLE_NAME = 'customers';

// Helper to check if a string is a valid UUID
const isUuid = (id?: string) => id ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) : false;

// Helper to map database record to Customer type
const mapCustomer = (record: any): Customer => {
  if (!record) return record;
  const unpoisoned = unpoison(record);
  // The DB seems to use camelCase based on recent errors, 
  // but we'll provide fallbacks just in case some environments differ.
  return {
    ...unpoisoned,
    ordersCount: unpoisoned.ordersCount ?? unpoisoned.orders_count ?? 0,
    totalSpent: unpoisoned.totalSpent ?? unpoisoned.total_spent ?? 0,
    lastOrderDate: unpoisoned.lastOrderDate ?? unpoisoned.last_order_date ?? new Date().toISOString().split('T')[0],
    joinDate: unpoisoned.joinDate ?? unpoisoned.join_date ?? unpoisoned.createdAt ?? unpoisoned.created_at
  } as Customer;
};

// Helper to map Customer type to database record
const mapToDb = (customer: Partial<Customer>): any => {
  const toSend: any = { ...customer };
  
  // Map camelCase to snake_case for DB
  if (toSend.lastOrderDate) {
    toSend.last_order_date = toSend.lastOrderDate;
    delete toSend.lastOrderDate;
  }
  if (toSend.ordersCount !== undefined) {
    toSend.orders_count = toSend.ordersCount;
    delete toSend.ordersCount;
  }
  if (toSend.totalSpent !== undefined) {
    toSend.total_spent = toSend.totalSpent;
    delete toSend.totalSpent;
  }
  if (toSend.joinDate) {
    toSend.join_date = toSend.joinDate;
    delete toSend.joinDate;
  }
  if (toSend.updatedAt) {
    toSend.updated_at = toSend.updatedAt;
    delete toSend.updatedAt;
  }
  if (toSend.createdAt) {
    toSend.created_at = toSend.createdAt;
    delete toSend.createdAt;
  }

  // Ensure user_id is a valid UUID or null to avoid FK constraint errors with auth.users
  if (toSend.user_id && !isUuid(toSend.user_id)) {
    toSend.user_id = null;
  }
  
  // Remove any fields that shouldn't be in the DB
  delete toSend.addresses;
  delete toSend.password;

  return toSend;
};

export const customerService = {
  getAll: async (): Promise<Customer[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('Supabase Error (LIST):', error);
      throw new Error(`فشل في جلب العملاء من Supabase: ${error.message}`);
    }
    
    return (data || []).map(mapCustomer);
  },

  getById: async (id: string): Promise<Customer | undefined> => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    const query = supabase.from(TABLE_NAME).select('*');
    if (isUuid) {
      query.or(`id.eq.${id},user_id.eq.${id}`);
    } else {
      query.eq('id', id);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error('Supabase Error (GET BY ID):', error);
      return undefined;
    }
    return data ? mapCustomer(data) : undefined;
  },

  getByUserId: async (userId: string): Promise<Customer | undefined> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (GET BY USER ID):', error);
      return undefined;
    }
    return data ? mapCustomer(data) : undefined;
  },

  update: async (id: string, customer: Partial<Customer>): Promise<Customer> => {
    const dbData = mapToDb(customer);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ ...dbData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (UPDATE):', error);
      
      // Handle FK violation on user_id
      if (error.code === '23503' && error.message.includes('user_id')) {
        const { user_id, ...rest } = dbData;
        const { data: retryData, error: retryError } = await supabase
          .from(TABLE_NAME)
          .update({ ...rest, user_id: null, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .maybeSingle();
        if (!retryError) return mapCustomer(retryData);
      }
      
      throw new Error(`فشل في تحديث بيانات العميل في Supabase: ${error.message}`);
    }
    return mapCustomer(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (DELETE CUSTOMER):', error);
      throw new Error(`فشل في حذف العميل من Supabase: ${error.message}`);
    }
  },

  add: async (customer: Partial<Customer>): Promise<Customer> => {
    const dbData = mapToDb(customer);
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert([{ ...dbData, updated_at: new Date().toISOString() }], { onConflict: 'email' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (ADD/UPSERT):', error);
      
      // Handle FK violation on user_id
      if (error.code === '23503' && error.message.includes('user_id')) {
        const { user_id, ...rest } = dbData;
        const { data: retryData, error: retryError } = await supabase
          .from(TABLE_NAME)
          .upsert([{ ...rest, user_id: null, updated_at: new Date().toISOString() }], { onConflict: 'email' })
          .select()
          .maybeSingle();
        if (!retryError) return mapCustomer(retryData);
      }
      
      throw new Error(`فشل في إضافة بيانات العميل في Supabase: ${error.message}`);
    }
    return mapCustomer(data);
  },

  getOrCreateCustomer: async (userId: string, customerData: Partial<Customer>): Promise<Customer> => {
    const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

    // ── 1. Try to find by id / user_id ──────────────────────────────────
    const query = supabase.from(TABLE_NAME).select('*');
    if (isValidUuid) {
      query.or(`id.eq.${userId},user_id.eq.${userId}`);
    } else {
      query.eq('id', userId);
    }
    const { data: existing } = await query.maybeSingle();

    if (existing) {
      const customer = mapCustomer(existing);
      // Update name if currently generic
      if (customerData.name && (customer.name === 'عميل يسلمو' || customer.name === 'زائر') && customerData.name !== customer.name) {
        try { return await customerService.update(customer.id, { name: customerData.name }); } catch { /* ignore */ }
      }
      return customer;
    }

    // ── 2. Try to find by email (catches the case where the customer exists
    //       under a different id, e.g. old CUST-xxx vs new UUID) ──────────
    if (customerData.email) {
      const { data: byEmail } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('email', customerData.email)
        .maybeSingle();

      if (byEmail) {
        const customer = mapCustomer(byEmail);
        // Link the new auth UUID to the existing customer record
        if (isValidUuid && customer.user_id !== userId) {
          try {
            return await customerService.update(customer.id, { user_id: userId } as any);
          } catch { /* ignore — return as-is if update fails */ }
        }
        return customer;
      }
    }

    // ── 3. Create new customer ────────────────────────────────────────────
    const insertData: any = {
      id: isValidUuid ? userId : `CUST-${Date.now()}`,
      ...mapToDb(customerData),
      updated_at: new Date().toISOString()
    };

    if (isValidUuid) {
      insertData.user_id = userId;
    } else {
      insertData.user_id = null;
    }

    const { data: created, error: insertError } = await supabase
      .from(TABLE_NAME)
      .upsert([insertData], { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (insertError) {
      console.error('Supabase Error (GET OR CREATE CUSTOMER):', insertError);

      // FK violation on user_id — retry without it
      if (insertError.code === '23503' && insertError.message.includes('user_id')) {
        const { data: retry, error: retryErr } = await supabase
          .from(TABLE_NAME)
          .upsert([{ ...insertData, user_id: null }], { onConflict: 'id' })
          .select()
          .maybeSingle();
        if (!retryErr && retry) return mapCustomer(retry);
      }

      // Duplicate email — another record was inserted concurrently; fetch it
      if (insertError.code === '23505') {
        const emailToSearch = customerData.email || '';
        const { data: raceResult } = await supabase
          .from(TABLE_NAME)
          .select('*')
          .or(emailToSearch ? `id.eq.${insertData.id},email.eq.${emailToSearch}` : `id.eq.${insertData.id}`)
          .maybeSingle();
        if (raceResult) return mapCustomer(raceResult);
      }

      throw new Error(`فشل في الحصول على بيانات العميل أو إنشائها: ${insertError.message}`);
    }

    return mapCustomer(created);
  },


  subscribeToCustomers: (callback: (payload: any) => void) => {
    return supabase
      .channel('customers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE_NAME }, (payload) => {
        if (payload.new) {
          callback({ ...payload, new: mapCustomer(payload.new) });
        } else {
          callback(payload);
        }
      })
      .subscribe();
  }
};
