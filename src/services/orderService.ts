
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

  /**
   * ينشئ الطلب عبر دالة `create_order` على الخادم.
   *
   * لا تُرسَل أي مبالغ من المتصفح — فقط معرّفات المنتجات والكميات.
   * الخادم يقرأ الأسعار من جدول products ويتحقق من الكوبون ويحسب
   * الإجمالي بنفسه، فلا يمكن تزوير السعر أو الخصم من جهة العميل.
   */
  create: async (order: Order): Promise<Order> => {
    const items = (order.items || []).map(item => ({
      // productId هو معرّف المنتج؛ item.id هو معرّف سطر السلة
      id: item.productId || item.id,
      quantity: item.quantity ?? 1,
      selectedColor: item.selectedColor ?? null,
      selectedEngraving: item.selectedEngraving ?? null,
      selectedGiftWrapping: item.selectedGiftWrapping ?? null,
      selectedGiftMessage: item.selectedGiftMessage ?? null
    }));

    const missingId = items.find(item => !item.id);
    if (missingId) {
      throw new Error('أحد المنتجات في السلة بلا معرّف — يرجى إعادة إضافته.');
    }

    const { data, error } = await supabase.rpc('create_order', {
      p_items: items,
      p_customer_name: order.customerName,
      p_customer_email: order.customerEmail || null,
      p_phone: order.phone,
      p_address: order.address,
      p_payment_method: order.paymentMethod,
      p_coupon_code: order.couponCode || null,
      p_is_gift: order.isGift ?? false,
      p_gift_wrapping: order.giftWrapping || null,
      p_gift_message: order.giftMessage || null,
      p_recipient_names: order.recipientNames || null
    });

    if (error) {
      console.error('Supabase Error (CREATE ORDER):', error);
      // رسائل RAISE EXCEPTION من الدالة تصل هنا بالعربية كما هي
      throw new Error(error.message || 'فشل في إنشاء الطلب');
    }

    const record = Array.isArray(data) ? data[0] : data;
    if (!record) {
      throw new Error('لم يُرجِع الخادم بيانات الطلب');
    }

    return mapOrder(record);
  },

  updateStatus: async (id: string, status: Order['status']): Promise<Order> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();

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
