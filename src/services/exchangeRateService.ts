import { toast } from 'react-hot-toast';
import { supabase } from '../supabase';
import { isValidExchangeRate } from '../utils/pricingEngine';

export interface ExchangeRateLog {
  id: string;
  rate: number;
  changed_by: string | null;
  note: string | null;
  created_at: string;
}

const SETTINGS_TABLE = 'settings';
const LOG_TABLE = 'exchange_rate_log';

export function getExchangeRateFromSettingsRecord(record: unknown): number | undefined {
  if (!record || typeof record !== 'object') return undefined;

  const rate = Number(record.exchange_rate);
  return isValidExchangeRate(rate) ? rate : undefined;
}

export const exchangeRateService = {
  /**
  * جلب سعر الصرف الحالي من جدول settings
  */
  getRate: async (): Promise<number> => {
    const { data, error } = await supabase.rpc('get_public_exchange_rate');
    const record = Array.isArray(data) ? data[0] : data;
    const rate = getExchangeRateFromSettingsRecord(record);

    if (error || !rate) {
      console.warn('exchangeRateService.getRate: فشل الجلب، استخدام القيمة الافتراضية 110');
      return 110;
    }

    return rate;
  },

  /**
   * تحديث سعر الصرف في settings + تسجيل في exchange_rate_log
   */
  updateRate: async (rate: number, adminEmail: string, note?: string): Promise<void> => {
    if (!isValidExchangeRate(rate)) {
      throw new Error('سعر الصرف غير صالح. يجب أن يكون رقماً موجباً.');
    }

    const now = new Date().toISOString();

    // 1. تحديث في settings
    const { data: existingSettings, error: lookupError } = await supabase
      .from(SETTINGS_TABLE)
      .select('id')
      .eq('id', 'default')
      .maybeSingle();

    if (lookupError) {
      console.error('exchangeRateService.updateRate (settings lookup):', lookupError);
      throw new Error('فشل في التحقق من إعدادات سعر الصرف');
    }

    let settingsError;
    if (existingSettings) {
      const { error } = await supabase
        .from(SETTINGS_TABLE)
        .update({
          exchange_rate: rate,
          exchange_rate_updated_at: now,
        })
        .eq('id', existingSettings.id);
      settingsError = error;
    } else {
      const { error } = await supabase
        .from(SETTINGS_TABLE)
        .upsert({
          id: 'default',
          exchange_rate: rate,
          exchange_rate_updated_at: now,
          storeName: 'يسلمو للهدايا',
          storeEmail: 'contact@yaslamo.sy',
          currency: 'ليرة سورية',
          address: 'دمشق، سوريا',
          phone: '+963 9XX XXX XXX',
          taxRate: 0,
          shippingFee: 50000,
          logo: '/img/logo/logo.png'
        });
      settingsError = error;
    }

    if (settingsError) {
      console.error('exchangeRateService.updateRate (settings):', settingsError);
      throw new Error('فشل في تحديث سعر الصرف');
    }

    // 2. تسجيل في exchange_rate_log
    const { error: logError } = await supabase
      .from(LOG_TABLE)
      .insert([{
        rate,
        changed_by: adminEmail,
        note: note ?? null,
        created_at: now,
      }]);

    if (logError) {
      // السجل ثانوي — لا نرمي خطأً إذا فشل
      console.warn('exchangeRateService.updateRate (log):', logError);
    }

    toast.success(`تم تحديث سعر الصرف إلى ${rate.toLocaleString()} ل.س/$`);
  },

  /**
   * جلب سجل تحديثات سعر الصرف (آخر 10 تغييرات)
   */
  getRateHistory: async (): Promise<ExchangeRateLog[]> => {
    const { data, error } = await supabase
      .from(LOG_TABLE)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('exchangeRateService.getRateHistory:', error);
      return [];
    }

    return (data || []) as ExchangeRateLog[];
  },

  subscribeToRate: (callback: (rate: number, updatedAt?: string) => void) => {
    return supabase
      .channel('exchange-rate-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: SETTINGS_TABLE }, (payload) => {
        const record = payload.new;
        const rate = getExchangeRateFromSettingsRecord(record);

        if (rate) {
          const updatedAt = typeof record === 'object' && record && 'exchange_rate_updated_at' in record
            && typeof record.exchange_rate_updated_at === 'string'
            ? record.exchange_rate_updated_at
            : undefined;
          callback(rate, updatedAt);
        }
      })
      .subscribe();
  },
};
