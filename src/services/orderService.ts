
import { supabase } from '../supabase';
import { Order } from '../types/admin';
import { unpoison } from '../utils/unpoison';

const TABLE_NAME = 'orders';

// Helper to map database record to Order type
const mapOrder = (record: any): Order => {
  const unpoisoned = unpoison(record);
  return {
    ...unpoisoned,
    customerName: unpoisoned.customerName || unpoisoned.customer_name,
    customerEmail: unpoisoned.customerEmail || unpoisoned.customer_email,
    paymentMethod: unpoisoned.paymentMethod || unpoisoned.payment_method,
    isGift: unpoisoned.isGift ?? unpoisoned.is_gift,
    giftWrapping: unpoisoned.giftWrapping || unpoisoned.gift_wrapping,
    giftMessage: unpoisoned.giftMessage || unpoisoned.gift_message,
    recipientNames: unpoisoned.recipientNames || unpoisoned.recipient_names,
    couponCode: unpoisoned.couponCode || unpoisoned.coupon_code,
    items: Array.isArray(unpoisoned.items) ? unpoisoned.items.map((item: any) => unpoison(item)) : []
  } as Order;
};

export const orderService = {
  getAll: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase Error (LIST):', error);
      const msg = error.message === 'Failed to fetch'
        ? 'فشل الاتصال بـ Supabase (Failed to fetch). يرجى التحقق من اتصال الإنترنت أو إعدادات Supabase.'
        : `فشل في جلب الطلبات من Supabase: ${error.message}`;
      throw new Error(msg);
    }
    
    return (data || []).map(mapOrder);
  },

  getById: async (id: string): Promise<Order | undefined> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (GET):', error);
      return undefined;
    }
    
    return data ? mapOrder(data) : undefined;
  },

  create: async (order: Order): Promise<Order> => {
    console.log('orderService.create - Sending to Supabase:', order);
    
    // Prepare data for Supabase - we'll send both camelCase and snake_case to be safe
    const toSend: any = { 
      ...order,
      customer_name: order.customerName,
      customer_email: order.customerEmail,
      payment_method: order.paymentMethod,
      is_gift: order.isGift,
      gift_wrapping: order.giftWrapping,
      gift_message: order.giftMessage,
      recipient_names: order.recipientNames,
      coupon_code: order.couponCode
    };
    
    // 1. Handle empty strings: Postgres ARRAY columns (like TEXT[]) will throw 
    // "malformed array literal: \"\"" if passed an empty string instead of an array or NULL.
    // We'll set all empty strings to null to be safe.
    Object.keys(toSend).forEach(key => {
      if (toSend[key] === "") {
        toSend[key] = null;
      }
    });

    // 2. Handle items array: 
    // If the column is TEXT[], it expects an array of strings.
    // If the column is JSONB, it can take an array of objects or strings.
    // We'll stringify each item object to support both TEXT[] and JSONB/TEXT.
    if (toSend.items && Array.isArray(toSend.items)) {
      toSend.items = toSend.items.map((item: any) => 
        typeof item === 'object' ? JSON.stringify(item) : item
      );
    }

    let { data, error } = await supabase
      .from(TABLE_NAME)
      .insert([toSend])
      .select()
      .single();

    // If it fails because of a missing column (like coupon_code), try again without it
    if (error && (error.code === '42703' || error.message.includes('coupon_code'))) {
      console.warn('Supabase Error: Missing column detected. Retrying without coupon_code...');
      const { coupon_code, ...toSendWithoutCoupon } = toSend;
      const retry = await supabase
        .from(TABLE_NAME)
        .insert([toSendWithoutCoupon])
        .select()
        .single();
      
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Supabase Error (CREATE) - Full Error:', error);
      // Log specific details to help debugging
      if (error.code === '42703') {
        console.error('Error 42703: One or more columns do not exist in the orders table. Check your schema.');
      }
      throw new Error(`فشل في إنشاء الطلب في Supabase: ${error.message}${error.details ? ` (${error.details})` : ''}`);
    }
    return mapOrder(data);
  },

  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase Error (UPDATE):', error);
      throw new Error('فشل في تحديث حالة الطلب في Supabase');
    }
    return mapOrder(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase Error (DELETE):', error);
      throw new Error('فشل في حذف الطلب من Supabase');
    }
  },

  subscribeToOrders: (callback: (payload: any) => void) => {
    return supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: TABLE_NAME },
        (payload) => {
          if (payload.new) {
            callback({ ...payload, new: mapOrder(payload.new) });
          } else {
            callback(payload);
          }
        }
      )
      .subscribe();
  }
};
