import { describe, expect, it } from 'vitest';
import type { Customer, Order } from '../types/admin';
import { buildCustomerStats, sortCustomers } from './customerStats';

const customer: Customer = {
  id: 'customer-1',
  name: 'محمد',
  email: 'customer@example.com',
  phone: '0951000000',
  ordersCount: 0,
  totalSpent: 0,
  lastOrderDate: '2026-01-01',
  status: 'active'
};

const makeOrder = (overrides: Partial<Order>): Order => ({
  id: 'order-1',
  customerName: 'محمد',
  customerEmail: 'customer@example.com',
  phone: '0951000000',
  address: 'دمشق',
  total: 100,
  status: 'new',
  date: '2026-01-01T10:00:00.000Z',
  paymentMethod: 'cash',
  items: [],
  ...overrides
});

describe('buildCustomerStats', () => {
  it('counts a customer\'s orders and spending from their matching email', () => {
    const [stats] = buildCustomerStats([customer], [
      makeOrder({ id: 'order-1', total: 125, phone: '0933000000' }),
      makeOrder({ id: 'order-2', total: 75, status: 'delivered', phone: '0944000000' }),
      makeOrder({ id: 'order-3', total: 500, status: 'cancelled' }),
      makeOrder({ id: 'other-order', customerEmail: 'other@example.com', total: 900 })
    ]);

    expect(stats.ordersCount).toBe(3);
    expect(stats.totalSpent).toBe(200);
    expect(stats.phone).toBe('0933000000');
  });

  it('sorts by name, spending, and order count', () => {
    const rows = [
      { ...customer, name: 'باسم', ordersCount: 1, totalSpent: 100 },
      { ...customer, id: 'customer-2', name: 'أحمد', ordersCount: 3, totalSpent: 50 },
      { ...customer, id: 'customer-3', name: 'تامر', ordersCount: 2, totalSpent: 400 }
    ];

    expect(sortCustomers(rows, 'name').map(row => row.name)).toEqual(['أحمد', 'باسم', 'تامر']);
    expect(sortCustomers(rows, 'totalSpent').map(row => row.name)).toEqual(['تامر', 'باسم', 'أحمد']);
    expect(sortCustomers(rows, 'ordersCount').map(row => row.name)).toEqual(['أحمد', 'تامر', 'باسم']);
  });
});
