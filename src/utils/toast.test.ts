import { beforeEach, describe, expect, it, vi } from 'vitest';

const hotToast = vi.hoisted(() => {
  const api = vi.fn(() => 'toast-id');

  return Object.assign(api, {
    error: vi.fn(() => 'error-id'),
    success: vi.fn(() => 'success-id'),
    loading: vi.fn(() => 'loading-id'),
    custom: vi.fn(() => 'custom-id'),
    dismiss: vi.fn(),
    dismissAll: vi.fn(),
    remove: vi.fn(),
    removeAll: vi.fn(),
    promise: vi.fn(),
  });
});

vi.mock('react-hot-toast', () => ({
  default: hotToast,
  toast: hotToast,
  Toaster: () => null,
}));

import { toast, DATA_LOAD_ERROR_TOAST_ID, DATA_LOAD_ERROR_MESSAGE } from './toast';

const lastCallId = (calls: unknown[][]): string | undefined =>
  (calls[calls.length - 1][1] as { id?: string } | undefined)?.id;

describe('toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gives the same message the same id so it never stacks twice', () => {
    toast.error('فشل في تحميل التصنيفات');
    const firstId = lastCallId(hotToast.error.mock.calls);

    toast.error('فشل في تحميل التصنيفات');
    const secondId = lastCallId(hotToast.error.mock.calls);

    expect(firstId).toBeTruthy();
    expect(secondId).toBe(firstId);
  });

  it('gives different messages different ids', () => {
    toast.error('الخطأ الأول');
    const firstId = lastCallId(hotToast.error.mock.calls);

    toast.error('الخطأ الثاني');
    const secondId = lastCallId(hotToast.error.mock.calls);

    expect(secondId).not.toBe(firstId);
  });

  it('collapses every data-load failure into one shared notification', () => {
    // ثلاثة هوكس مختلفة تفشل عند انقطاع الإنترنت
    toast.loadError();
    toast.loadError();
    toast.loadError();

    expect(hotToast.error).toHaveBeenCalledTimes(3);
    for (const call of hotToast.error.mock.calls as unknown[][]) {
      expect(call[0]).toBe(DATA_LOAD_ERROR_MESSAGE);
      expect(call[1]).toEqual({ id: DATA_LOAD_ERROR_TOAST_ID });
    }
  });

  it('respects an explicit id supplied by the caller', () => {
    const loadingId = toast.loading('جاري الحفظ');
    toast.success('تم الحفظ', { id: loadingId });

    expect(hotToast.success).toHaveBeenCalledWith('تم الحفظ', { id: 'loading-id' });
  });

  it('leaves non-string messages untouched so JSX toasts still work', () => {
    const node = { type: 'div' } as unknown as string;

    toast.error(node);

    expect(hotToast.error).toHaveBeenCalledWith(node, undefined);
  });
});
