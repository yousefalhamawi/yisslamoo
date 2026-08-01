import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../supabase';
import { reviewService } from './reviewService';

const mockFrom = vi.mocked(supabase.from);

describe('reviewService.add', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('crypto', { randomUUID: () => 'review-uuid' });
  });

  it('creates a pending review with an ID without reading the unapproved row back', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    mockFrom.mockReturnValue({ insert } as never);

    const input = {
      productId: 'product-1',
      productName: 'هدية',
      customer: 'عميل',
      rating: 5,
      comment: 'تجربة رائعة',
      date: '2026-08-01T00:00:00.000Z',
    };

    await expect(reviewService.add(input)).resolves.toEqual({
      ...input,
      id: 'review-uuid',
      status: 'pending',
    });
    expect(insert).toHaveBeenCalledWith([{
      ...input,
      id: 'review-uuid',
      status: 'pending',
    }]);
  });
});
