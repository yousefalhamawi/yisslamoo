import { SALES_DATA } from '../mockData/adminData';

export interface AnalyticsStats {
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  newCustomers: number;
  revenueTrend: number;
  aovTrend: number;
  conversionTrend: number;
  customersTrend: number;
}

export const analyticsService = {
  getStats: async (): Promise<AnalyticsStats> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      totalRevenue: 45000000,
      averageOrderValue: 350000,
      conversionRate: 3.8,
      newCustomers: 124,
      revenueTrend: 15,
      aovTrend: 5,
      conversionTrend: -1.2,
      customersTrend: 22
    };
  },

  getSalesData: async () => {
    await new Promise(resolve => setTimeout(resolve, 400));
    return SALES_DATA;
  }
};
