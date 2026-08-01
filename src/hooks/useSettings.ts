import { useState, useEffect } from 'react';
import { toast } from '../utils/toast';
import { settingsService, StoreSettings } from '../services/settingsService';
import { checkSupabaseConfig } from '../supabase';

export const useSettings = () => {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!checkSupabaseConfig()) {
        setLoading(false);
        return;
      }
      const data = await settingsService.getSettings();
      setSettings(data);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: StoreSettings) => {
    const loadingToast = toast.loading('جاري حفظ الإعدادات...');
    setLoading(true);
    try {
      const updated = await settingsService.updateSettings(newSettings);
      setSettings(updated);
      toast.success('تم حفظ الإعدادات بنجاح', { id: loadingToast });
    } catch (err) {
      toast.error('فشل في حفظ الإعدادات', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, updateSettings };
};
