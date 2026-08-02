import type { Customer, Order } from '../types/admin';

export type CustomerSortOption = 'name' | 'totalSpent' | 'ordersCount';

const normalizedEmail = (email?: string) => email?.trim().toLocaleLowerCase() ?? '';

const orderTimestamp = (order: Order) => {
  const timestamp = Date.parse(order.date);
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
};

/**
 * Produces customer-facing metrics from the order ledger. The customer record
 * stays untouched, while new orders are reflected in the admin immediately.
 */
export const buildCustomerStats = (customers: Customer[], orders: Order[]): Customer[] =>
  customers.map(customer => {
    const email = normalizedEmail(customer.email);
    const customerOrders = email
      ? orders.filter(order => normalizedEmail(order.customerEmail) === email)
      : [];
    const orderedByDate = [...customerOrders].sort((left, right) => orderTimestamp(left) - orderTimestamp(right));
    const paidOrders = customerOrders.filter(order => order.status !== 'cancelled');
    const firstPhone = orderedByDate.find(order => order.phone?.trim())?.phone?.trim();

    return {
      ...customer,
      // The first checkout phone is the original customer-provided number.
      phone: firstPhone || customer.phone,
      ordersCount: customerOrders.length,
      totalSpent: paidOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0)
    };
  });

export const sortCustomers = (
  customers: Customer[],
  sortBy: CustomerSortOption
): Customer[] => [...customers].sort((left, right) => {
  if (sortBy === 'name') {
    return (left.name || '').localeCompare(right.name || '', 'ar');
  }

  return (Number(right[sortBy]) || 0) - (Number(left[sortBy]) || 0);
});
