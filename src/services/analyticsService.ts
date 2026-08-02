import { Customer, Order } from '../types/admin';
import { customerService } from './customerService';
import { orderService } from './orderService';

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

export interface SalesDataPoint {
  name: string;
  sales: number;
}

const isCountableOrder = (order: Pick<Order, 'status'>): boolean => order.status !== 'cancelled';

export const buildAnalyticsStats = (
  orders: Pick<Order, 'total' | 'status'>[],
  customers: Pick<Customer, 'joinDate'>[],
  now: Date = new Date(),
): AnalyticsStats => {
  const countableOrders = orders.filter(isCountableOrder);
  const totalRevenue = countableOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const monthStart = new Date(now);
  monthStart.setDate(monthStart.getDate() - 30);
  const newCustomers = customers.filter((customer) => {
    const joinedAt = new Date(customer.joinDate ?? '');
    return !Number.isNaN(joinedAt.getTime()) && joinedAt >= monthStart && joinedAt <= now;
  }).length;

  return {
    totalRevenue,
    averageOrderValue: countableOrders.length ? Math.round(totalRevenue / countableOrders.length) : 0,
    // These values need traffic/visit data, which the store does not collect yet.
    conversionRate: 0,
    newCustomers,
    revenueTrend: 0,
    aovTrend: 0,
    conversionTrend: 0,
    customersTrend: 0,
  };
};

export const buildSalesData = (
  orders: Pick<Order, 'date' | 'status' | 'total'>[],
  now: Date = new Date(),
): SalesDataPoint[] => {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));

    return {
      key: date.toISOString().slice(0, 10),
      name: date.toLocaleDateString('ar-SA', { weekday: 'long' }),
      sales: 0,
    };
  });

  const salesByDate = new Map(days.map((day) => [day.key, day]));
  orders.filter(isCountableOrder).forEach((order) => {
    const orderDate = new Date(order.date);
    if (Number.isNaN(orderDate.getTime())) return;

    const day = salesByDate.get(orderDate.toISOString().slice(0, 10));
    if (day) day.sales += Number(order.total) || 0;
  });

  return days.map(({ name, sales }) => ({ name, sales }));
};

export const analyticsService = {
  getStats: async (): Promise<AnalyticsStats> => {
    const [orders, customers] = await Promise.all([
      orderService.getAll(),
      customerService.getAll(),
    ]);

    return buildAnalyticsStats(orders, customers);
  },

  getSalesData: async (): Promise<SalesDataPoint[]> => {
    const orders = await orderService.getAll();
    return buildSalesData(orders);
  }
};
