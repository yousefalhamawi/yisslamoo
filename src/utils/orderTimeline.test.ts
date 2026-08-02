import { describe, expect, it } from 'vitest';
import type { Order } from '../types/admin';
import { getOrderTimeline } from './orderTimeline';

const makeOrder = (status: Order['status']): Order => ({
  id: 'order-1',
  customerName: 'عميل',
  phone: '000',
  address: 'دمشق',
  total: 1000,
  status,
  date: '2026-08-02T10:30:00.000Z',
  updated_at: '2026-08-02T12:00:00.000Z',
  paymentMethod: 'نقداً',
  items: [],
});

describe('getOrderTimeline', () => {
  it('shows all reached delivery stages and marks delivery as current', () => {
    const timeline = getOrderTimeline(makeOrder('delivered'));

    expect(timeline.map((entry) => entry.label)).toEqual([
      'تم إنشاء الطلب',
      'قيد المراجعة',
      'قيد التنفيذ',
      'تم الشحن',
      'تم التوصيل',
    ]);
    expect(timeline.at(-1)?.state).toBe('current');
    expect(timeline.at(-1)?.timestamp).toBe('2026-08-02T12:00:00.000Z');
  });

  it('shows cancellation as the current final stage', () => {
    const timeline = getOrderTimeline(makeOrder('cancelled'));

    expect(timeline.map((entry) => entry.label)).toEqual(['تم إنشاء الطلب', 'تم إلغاء الطلب']);
    expect(timeline.at(-1)?.state).toBe('cancelled');
  });
});
