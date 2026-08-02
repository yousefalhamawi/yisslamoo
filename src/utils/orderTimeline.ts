import type { Order } from '../types/admin';

export type OrderTimelineState = 'complete' | 'current' | 'cancelled';

export interface OrderTimelineEntry {
  id: string;
  label: string;
  state: OrderTimelineState;
  timestamp?: string;
}

const DELIVERY_STAGES: ReadonlyArray<{ id: Order['status']; label: string }> = [
  { id: 'new', label: 'تم إنشاء الطلب' },
  { id: 'pending', label: 'قيد المراجعة' },
  { id: 'processing', label: 'قيد التنفيذ' },
  { id: 'shipped', label: 'تم الشحن' },
  { id: 'delivered', label: 'تم التوصيل' },
];

export const getOrderTimeline = (order: Pick<Order, 'status' | 'date' | 'updated_at' | 'updatedAt'>): OrderTimelineEntry[] => {
  const latestTimestamp = order.updated_at ?? order.updatedAt ?? order.date;

  if (order.status === 'cancelled') {
    return [
      { id: 'new', label: 'تم إنشاء الطلب', state: 'complete', timestamp: order.date },
      { id: 'cancelled', label: 'تم إلغاء الطلب', state: 'cancelled', timestamp: latestTimestamp },
    ];
  }

  const reachedIndex = Math.max(0, DELIVERY_STAGES.findIndex((stage) => stage.id === order.status));

  return DELIVERY_STAGES.slice(0, reachedIndex + 1).map((stage, index) => ({
    id: stage.id,
    label: stage.label,
    state: index === reachedIndex ? 'current' : 'complete',
    timestamp: index === 0 ? order.date : index === reachedIndex ? latestTimestamp : undefined,
  }));
};
