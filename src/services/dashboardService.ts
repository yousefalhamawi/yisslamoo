import { supabase } from '../supabase';

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  salesGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  productsGrowth: number;
}

export interface ChartData {
  name: string;
  sales: number;
}

export interface TopProduct {
  id: string;
  name: string;
  image: string;
  ordersCount: number;
  revenue: number;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      const { data: orders, error: ordersError } = await supabase.from('orders').select('total, date');
      const { count: customersCount, error: customersError } = await supabase.from('customers').select('*', { count: 'exact', head: true });
      const { count: productsCount, error: productsError } = await supabase.from('products').select('*', { count: 'exact', head: true });

      if (ordersError || customersError || productsError) {
        const error = ordersError || customersError || productsError;
        console.error('Supabase Error (STATS):', error);
        const msg = error?.message === 'Failed to fetch'
          ? 'فشل الاتصال بـ Supabase (Failed to fetch). يرجى التحقق من اتصال الإنترنت أو إعدادات Supabase.'
          : `فشل في جلب إحصائيات لوحة التحكم: ${error?.message}`;
        throw new Error(msg);
      }

      const totalSales = orders?.reduce((acc, curr) => acc + (curr.total || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalCustomers = customersCount || 0;
      const totalProducts = productsCount || 0;

      // Simple growth calculation (mocked for now as we need more complex queries for real growth)
      return {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        salesGrowth: 12.5,
        ordersGrowth: 8.2,
        customersGrowth: 5.4,
        productsGrowth: 2.1
      };
    } catch (error) {
      console.error('Dashboard Stats Error:', error);
      throw error;
    }
  },

  getChartData: async (range: string): Promise<ChartData[]> => {
    try {
      const now = new Date();
      let startDate = new Date();

      if (range === '7d') startDate.setDate(now.getDate() - 7);
      else if (range === '30d') startDate.setDate(now.getDate() - 30);
      else if (range === '1y') startDate.setFullYear(now.getFullYear() - 1);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('total, date')
        .gte('date', startDate.toISOString())
        .order('date', { ascending: true });

      if (error) throw error;

      const grouped: { [key: string]: number } = {};
      orders?.forEach(order => {
        const date = new Date(order.date).toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' });
        grouped[date] = (grouped[date] || 0) + (order.total || 0);
      });

      return Object.entries(grouped).map(([name, sales]) => ({ name, sales }));
    } catch (error) {
      console.error('Chart Data Error:', error);
      throw error;
    }
  },

  getTopProducts: async (): Promise<TopProduct[]> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, image, salesCount, revenue')
        .order('salesCount', { ascending: false })
        .limit(5);

      if (error) throw error;

      return data.map(p => ({
        id: p.id,
        name: p.name,
        image: p.image || `https://picsum.photos/seed/${p.id}/100/100`,
        ordersCount: p.salesCount || 0,
        revenue: p.revenue || 0
      }));
    } catch (error) {
      console.error('Top Products Error:', error);
      throw error;
    }
  },

  getRecentOrders: async (count: number = 5): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('date', { ascending: false })
        .limit(count);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Recent Orders Error:', error);
      throw error;
    }
  },

  subscribeToStats: (callback: (stats: DashboardStats) => void) => {
    // Realtime subscription for orders
    const channel = supabase
      .channel('dashboard-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
        const stats = await dashboardService.getStats();
        callback(stats);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
