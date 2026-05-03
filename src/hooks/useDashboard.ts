import { useState, useEffect } from 'react';
import { dashboardService, DashboardStats, ChartData, TopProduct } from '../services/dashboardService';
import { checkSupabaseConfig } from '../supabase';

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartRange, setChartRange] = useState('7d');

  const fetchData = async () => {
    if (!checkSupabaseConfig()) {
      console.warn('Supabase not configured, skipping fetchData');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [statsData, chartDataRes, topProductsRes, recentOrdersRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getChartData(chartRange),
        dashboardService.getTopProducts(),
        dashboardService.getRecentOrders(10)
      ]);
      setStats(statsData);
      setChartData(chartDataRes);
      setTopProducts(topProductsRes);
      setRecentOrders(recentOrdersRes);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      const msg = err.message?.includes('Failed to fetch')
        ? 'فشل الاتصال بـ Supabase (Failed to fetch). يرجى التحقق من اتصال الإنترنت أو إعدادات Supabase.'
        : 'فشل في جلب بيانات لوحة التحكم';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [chartRange]);

  useEffect(() => {
    if (!checkSupabaseConfig()) return;

    // Subscribe to real-time updates for stats
    const unsubscribe = dashboardService.subscribeToStats((newStats) => {
      setStats(newStats);
      // Refresh recent orders when stats change (new orders)
      dashboardService.getRecentOrders(10).then(setRecentOrders);
    });
    return () => unsubscribe();
  }, []);

  return { 
    stats, 
    chartData, 
    topProducts, 
    recentOrders,
    loading, 
    error,
    chartRange, 
    setChartRange, 
    refresh: fetchData 
  };
};
