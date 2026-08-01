import { toast } from '../utils/toast';
import { supabase } from '../supabase';

export interface PaymentMethod {
  id: string;
  name: string;
  desc: string;
  status: 'نشط' | 'غير نشط';
  type: 'cod' | 'card' | 'stc' | 'bank';
}

const DEFAULT_METHODS: PaymentMethod[] = [
  { id: '1', name: 'الدفع عند الاستلام', type: 'cod', status: 'نشط', desc: 'تحصيل المبلغ نقداً عند تسليم الطلب.' },
  { id: '2', name: 'بطاقة مدى / فيزا / ماستركارد', type: 'card', status: 'نشط', desc: 'الدفع الإلكتروني عبر بوابة الدفع.' },
  { id: '3', name: 'STC Pay', type: 'stc', status: 'غير نشط', desc: 'الدفع عبر محفظة STC Pay.' },
  { id: '4', name: 'تحويل بنكي', type: 'bank', status: 'نشط', desc: 'تزويد العميل بالحسابات البنكية للتحويل.' },
];

const TABLE_NAME = 'payment_methods';

export const paymentService = {
  getAll: async (): Promise<PaymentMethod[]> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('Supabase Error (LIST):', error);
      return DEFAULT_METHODS;
    }
    return data as PaymentMethod[];
  },

  toggleStatus: async (id: string): Promise<PaymentMethod> => {
    const methods = await paymentService.getAll();
    const method = methods.find(m => m.id === id);
    if (!method) throw new Error('Payment method not found');

    const newStatus = method.status === 'نشط' ? 'غير نشط' : 'نشط';
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (UPDATE):', error);
      throw new Error('فشل في تحديث حالة وسيلة الدفع في Supabase');
    }

    toast.success(`تم ${newStatus === 'نشط' ? 'تفعيل' : 'تعطيل'} ${method.name}`);
    return data as PaymentMethod;
  }
};
