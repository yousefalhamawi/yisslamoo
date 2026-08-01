import hotToast, { Toaster } from 'react-hot-toast';
import type { ToastOptions } from 'react-hot-toast';

type ToastMessage = Parameters<typeof hotToast>[0];
type ToastHandler = (message: ToastMessage, options?: ToastOptions) => string;

/**
 * معرّف موحّد لأخطاء تحميل البيانات.
 * كل الطلبات التي تفشل عند انقطاع الإنترنت تستخدمه، فتظهر رسالة واحدة
 * بدل رسالة لكل جدول (تصنيفات، كوبونات، تقييمات...).
 */
export const DATA_LOAD_ERROR_TOAST_ID = 'data-load-error';

export const DATA_LOAD_ERROR_MESSAGE = 'تعذّر الاتصال بالخادم. تحقّق من اتصالك بالإنترنت.';

/** تجزئة بسيطة لتحويل نص الرسالة إلى معرّف ثابت */
const hashMessage = (message: string): string => {
  let hash = 0;
  for (let i = 0; i < message.length; i += 1) {
    hash = (hash << 5) - hash + message.charCodeAt(i);
    hash |= 0;
  }
  return `t${Math.abs(hash)}`;
};

/**
 * يضمن معرّفاً لكل إشعار: المستدعي إن حدّده، وإلا معرّف مشتقّ من النص.
 * react-hot-toast يستبدل الإشعار ذا المعرّف نفسه بدل تكديس نسخة جديدة،
 * فالرسالة المتطابقة لا تظهر مرتين مهما تكرّر استدعاؤها.
 */
const withStableId = (message: ToastMessage, options?: ToastOptions): ToastOptions | undefined => {
  if (options?.id) return options;
  if (typeof message !== 'string') return options;

  return { ...options, id: hashMessage(message) };
};

const showToast = (handler: ToastHandler, message: ToastMessage, options?: ToastOptions) =>
  handler(message, withStableId(message, options));

const singleToast = Object.assign(
  (message: ToastMessage, options?: ToastOptions) => showToast(hotToast, message, options),
  {
    error: (message: ToastMessage, options?: ToastOptions) => showToast(hotToast.error, message, options),
    success: (message: ToastMessage, options?: ToastOptions) => showToast(hotToast.success, message, options),
    loading: (message: ToastMessage, options?: ToastOptions) => showToast(hotToast.loading, message, options),
    custom: (message: ToastMessage, options?: ToastOptions) => showToast(hotToast.custom, message, options),

    /** خطأ تحميل بيانات — يُجمَّع في إشعار واحد مهما تعدّدت مصادره */
    loadError: (message: string = DATA_LOAD_ERROR_MESSAGE) =>
      hotToast.error(message, { id: DATA_LOAD_ERROR_TOAST_ID }),

    dismiss: hotToast.dismiss,
    dismissAll: hotToast.dismissAll,
    remove: hotToast.remove,
    removeAll: hotToast.removeAll,
  },
);

export { Toaster };
export const toast = singleToast;
export default singleToast;
