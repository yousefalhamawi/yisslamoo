import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

vi.mock('../utils/toast', () => ({
  toast: {
    success: vi.fn(),
  },
}));

import { supabase } from '../supabase';
import { profileService } from './profileService';

const mockInvoke = vi.mocked(supabase.functions.invoke);

describe('profileService.createInvite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the protected invite-staff Edge Function instead of inserting a temporary profile ID', async () => {
    const profile = {
      id: 'auth-user-id',
      name: 'new-admin',
      email: 'new-admin@example.com',
      role: 'مشرف',
      avatar: '',
      lastLogin: '2026-07-14T00:00:00.000Z',
    };
    mockInvoke.mockResolvedValue({ data: { profile }, error: null });

    await expect(profileService.createInvite(' New-Admin@Example.com ', 'مشرف')).resolves.toEqual(profile);
    expect(mockInvoke).toHaveBeenCalledWith('invite-staff', {
      body: { email: 'new-admin@example.com', role: 'مشرف' },
    });
  });

  it('returns a safe error when the Edge Function rejects the invitation', async () => {
    mockInvoke.mockResolvedValue({ data: null, error: new Error('Forbidden') });

    await expect(profileService.createInvite('new-admin@example.com', 'مشرف')).rejects.toThrow(
      'فشل في إنشاء الدعوة',
    );
  });

  it('changes a staff role through the protected manage-staff Edge Function', async () => {
    const profile = {
      id: 'staff-user-id',
      name: 'staff-member',
      email: 'staff@example.com',
      role: 'مشرف',
      avatar: '',
      lastLogin: '2026-07-14T00:00:00.000Z',
    };
    mockInvoke.mockResolvedValue({ data: { profile }, error: null });

    await expect(profileService.updateStaffRole('staff-user-id', 'مشرف')).resolves.toEqual(profile);
    expect(mockInvoke).toHaveBeenCalledWith('manage-staff', {
      body: { action: 'change-role', staffId: 'staff-user-id', role: 'مشرف' },
    });
  });
});
