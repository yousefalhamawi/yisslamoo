/**
 * أنماط موحّدة لكل فورمات الواجهة العامة.
 * الهدف مظهر ناعم ومتناسق: حقول أقصر، زوايا أهدأ، ومسافات متوازنة.
 * لا تستخدم `uppercase` أو `tracking-widest` مع النص العربي — تشوّه الحروف
 * وتوسّع العنصر بلا فائدة.
 */

/** عنوان القسم داخل الفورم */
export const FORM_TITLE = 'text-xl md:text-2xl font-bold text-textMain text-right mb-6';

/** تسمية الحقل */
export const FORM_LABEL = 'block text-xs font-bold text-gray-500 text-right mb-1.5';

/** المسافة بين الحقول */
export const FORM_FIELDS = 'space-y-5';

/** نص الخطأ أسفل الحقل */
export const FORM_ERROR = 'text-[11px] text-red-500 font-bold text-right mt-1';

/** نص مساعد أسفل الحقل */
export const FORM_HINT = 'text-[11px] text-gray-400 text-right mt-1';

const INPUT_BASE =
  'w-full px-4 py-3 rounded-xl bg-gray-50/70 text-sm text-right transition-all ' +
  'placeholder:text-gray-300 focus:outline-none focus:bg-white ' +
  'focus:ring-2 focus:ring-primary/15 border';

/** حقل إدخال — مرّر true عند وجود خطأ لإظهار الحد الأحمر */
export const formInput = (hasError?: boolean): string =>
  `${INPUT_BASE} ${hasError ? 'border-red-400 focus:border-red-400' : 'border-gray-200 focus:border-primary'}`;

/** منطقة نص متعددة الأسطر */
export const formTextarea = (hasError?: boolean): string =>
  `${formInput(hasError)} min-h-24 resize-y leading-relaxed`;

/** الزر الأساسي داخل الفورم */
export const FORM_SUBMIT =
  'w-full py-3.5 bg-primary text-white font-bold text-sm rounded-xl ' +
  'shadow-lg shadow-primary/15 hover:bg-primaryDark active:scale-[0.98] ' +
  'disabled:opacity-60 disabled:pointer-events-none transition-all';

/** الزر الثانوي (إلغاء / رجوع) */
export const FORM_SUBMIT_SECONDARY =
  'w-full py-3.5 bg-white text-primary font-bold text-sm rounded-xl ' +
  'border border-gray-200 hover:bg-gray-50 active:scale-[0.98] transition-all';
