import { toast } from 'react-hot-toast';
import { supabase } from '../supabase';

export interface StoreSettings {
  id?: string;
  storeName: string;
  storeEmail: string;
  currency: string;
  address: string;
  phone: string;
  taxRate: number;
  shippingFee: number;
  logo?: string;
  /** سعر صرف الدولار الحالي (ليرة سورية مقابل $1) */
  exchange_rate?: number;
  /** تاريخ آخر تحديث لسعر الصرف */
  exchange_rate_updated_at?: string;
  /** حد الشحن المجاني (الهدف) بالليرة السورية */
  freeShippingThreshold?: number;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'يسلمو للهدايا',
  storeEmail: 'contact@yaslamo.sy',
  currency: 'ليرة سورية',
  address: 'دمشق، سوريا',
  phone: '+963 9XX XXX XXX',
  taxRate: 0,
  shippingFee: 50000,
  logo: '/img/logo/logo.png',
  freeShippingThreshold: 2000000
};

const TABLE_NAME = 'settings';

export const settingsService = {
  getSettings: async (): Promise<StoreSettings> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (GET):', error);
      return DEFAULT_SETTINGS;
    }
    return data as StoreSettings;
  },

  updateSettings: async (settings: StoreSettings): Promise<StoreSettings> => {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .upsert({ ...settings, id: settings.id || 'default' })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase Error (UPDATE):', error);
      throw new Error('فشل في حفظ الإعدادات في Supabase');
    }
    toast.success('تم حفظ الإعدادات بنجاح');
    return data as StoreSettings;
  }
};
