import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  },
}));

vi.mock('../utils/toast', () => ({
  toast: {
    success: vi.fn(),
  },
}));

import { supabase } from '../supabase';
import { exchangeRateService, getExchangeRateFromSettingsRecord } from './exchangeRateService';

const mockFrom = vi.mocked(supabase.from);
const mockRpc = vi.mocked(supabase.rpc);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getExchangeRateFromSettingsRecord', () => {
  it('returns a valid exchange rate from a settings realtime record', () => {
    expect(getExchangeRateFromSettingsRecord({ exchange_rate: '120000' })).toBe(120000);
  });

  it('rejects missing or invalid exchange rates from realtime records', () => {
    expect(getExchangeRateFromSettingsRecord({ exchange_rate: 0 })).toBeUndefined();
    expect(getExchangeRateFromSettingsRecord({})).toBeUndefined();
    expect(getExchangeRateFromSettingsRecord(null)).toBeUndefined();
  });

  it('reads the exchange rate through the dedicated public RPC', async () => {
    mockRpc.mockResolvedValue({
      data: [{ exchange_rate: 120000 }],
      error: null,
    });

    await expect(exchangeRateService.getRate()).resolves.toBe(120000);
    expect(mockRpc).toHaveBeenCalledWith('get_public_exchange_rate');
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
