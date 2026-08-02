import { describe, expect, it } from 'vitest';
import { buildAnalyticsStats, buildSalesData } from './analyticsService';

describe('analyticsService data builders', () => {
  const now = new Date('2026-08-01T12:00:00.000Z');

  it('calculates statistics from real orders and customers only', () => {
    // الدالة تستقبل ما تحتاجه فقط (total + status)، لذا لا نمرّر id أو date
    const stats = buildAnalyticsStats(
      [
        { total: 200_000, status: 'new' },
        { total: 100_000, status: 'cancelled' },
      ],
      [
        { joinDate: '2026-07-15T12:00:00.000Z' },
        { joinDate: '2026-06-01T12:00:00.000Z' },
      ],
      now,
    );

    expect(stats).toMatchObject({
      totalRevenue: 200_000,
      averageOrderValue: 200_000,
      newCustomers: 1,
      conversionRate: 0,
    });
  });

  it('returns a seven-day sales series with no invented revenue', () => {
    const salesData = buildSalesData(
      [{ total: 250_000, status: 'new', date: '2026-07-31T12:00:00.000Z' }],
      now,
    );

    expect(salesData).toHaveLength(7);
    expect(salesData.reduce((total, day) => total + day.sales, 0)).toBe(250_000);
  });
});
