import { useSharedStore } from '../store/useSharedStore';
import { exchangeRateService } from '../services/exchangeRateService';
import { ExchangeRateLog } from '../services/exchangeRateService';
import { isValidExchangeRate } from '../utils/pricingEngine';
import { toast } from '../utils/toast';
import { useState, useCallback } from 'react';
import { supabase } from '../supabase';

/**
 * Hook لإدارة سعر الصرف — خاص بلوحة تحكم الأدمن
 */
export const useExchangeRate = () => {
  const { exchangeRate, exchangeRateUpdatedAt, setExchangeRate } = useSharedStore();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ExchangeRateLog[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  /**
   * تحديث سعر الصرف — يحفظ في Supabase ويحدث الذاكرة
   */
  const updateRate = useCallback(async (newRate: number, note?: string) => {
    if (!isValidExchangeRate(newRate)) {
      toast.error('سعر الصرف غير صالح. يجب أن يكون رقماً موجباً.');
      return false;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmail = user?.email ?? 'admin';

      await exchangeRateService.updateRate(newRate, adminEmail, note);

      const now = new Date().toISOString();
      setExchangeRate(newRate, now);
      return true;
    } catch (err: any) {
      toast.error(err.message ?? 'فشل في تحديث سعر الصرف');
      return false;
    } finally {
      setLoading(false);
    }
  }, [setExchangeRate]);

  /**
   * تحميل سجل التحديثات
   */
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const logs = await exchangeRateService.getRateHistory();
      setHistory(logs);
    } catch {
      // صامت
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  return {
    exchangeRate,
    exchangeRateUpdatedAt,
    loading,
    history,
    historyLoading,
    updateRate,
    loadHistory,
  };
};
