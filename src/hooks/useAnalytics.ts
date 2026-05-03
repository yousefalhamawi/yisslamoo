import { useState, useEffect } from 'react';
import { analyticsService, AnalyticsStats } from '../services/analyticsService';
import { checkSupabaseConfig } from '../supabase';

export const useAnalytics = () => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!checkSupabaseConfig()) {
        setLoading(false);
        return;
      }
      const [statsData, sales] = await Promise.all([
        analyticsService.getStats(),
        analyticsService.getSalesData()
      ]);
      setStats(statsData);
      setSalesData(sales);
      setLoading(false);
    };
    fetchData();
  }, []);

  return { stats, salesData, loading };
};
