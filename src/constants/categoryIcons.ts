import {
  Sparkles,
  Monitor,
  BedDouble,
  HeartPulse,
  Shirt,
  Activity,
  Smartphone,
  Camera,
  Briefcase,
  Gift,
  Baby,
  Scissors,
  Watch,
  Gem,
  Coffee,
  BookOpen,
  Palette,
  Car,
  Home,
  Utensils,
  Music,
  Flower2,
  type LucideIcon
} from 'lucide-react';

/** أيقونة واحدة قابلة للاختيار من لوحة التحكم */
export interface CategoryIconOption {
  /** الاسم المخزّن في عمود categories.icon */
  name: string;
  /** التسمية العربية المعروضة للأدمن */
  label: string;
  Icon: LucideIcon;
}

/**
 * الأيقونات المتاحة لتصنيفات المتجر.
 * الاسم (`name`) هو ما يُحفظ في قاعدة البيانات — لا تغيّره بعد الإطلاق
 * وإلا تفقد التصنيفات الحالية أيقوناتها.
 */
export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { name: 'Sparkles', label: 'عام / لمعة', Icon: Sparkles },
  { name: 'Gem', label: 'إكسسوارات ومجوهرات', Icon: Gem },
  { name: 'HeartPulse', label: 'صحة وعناية', Icon: HeartPulse },
  { name: 'Scissors', label: 'العناية بالشعر', Icon: Scissors },
  { name: 'Flower2', label: 'العناية بالبشرة', Icon: Flower2 },
  { name: 'Baby', label: 'الأطفال', Icon: Baby },
  { name: 'Shirt', label: 'أزياء وملابس', Icon: Shirt },
  { name: 'Watch', label: 'ساعات', Icon: Watch },
  { name: 'Gift', label: 'هدايا', Icon: Gift },
  { name: 'Monitor', label: 'إلكترونيات', Icon: Monitor },
  { name: 'Smartphone', label: 'جوالات وملحقاتها', Icon: Smartphone },
  { name: 'Camera', label: 'أجهزة ذكية', Icon: Camera },
  { name: 'BedDouble', label: 'أثاث ومنزل', Icon: BedDouble },
  { name: 'Home', label: 'مستلزمات منزلية', Icon: Home },
  { name: 'Utensils', label: 'مطبخ وطعام', Icon: Utensils },
  { name: 'Coffee', label: 'قهوة ومشروبات', Icon: Coffee },
  { name: 'Activity', label: 'رياضة ولياقة', Icon: Activity },
  { name: 'Briefcase', label: 'سفر وحقائب', Icon: Briefcase },
  { name: 'BookOpen', label: 'كتب وقرطاسية', Icon: BookOpen },
  { name: 'Palette', label: 'فنون ومكياج', Icon: Palette },
  { name: 'Music', label: 'موسيقى', Icon: Music },
  { name: 'Car', label: 'سيارات', Icon: Car }
];

const ICONS_BY_NAME: Record<string, LucideIcon> = Object.fromEntries(
  CATEGORY_ICON_OPTIONS.map(option => [option.name, option.Icon])
);

export const DEFAULT_CATEGORY_ICON: LucideIcon = Sparkles;

/**
 * كلمات مفتاحية تُستخدم فقط عندما لا يختار الأدمن أيقونة.
 * الترتيب مهم — أول تطابق يفوز، لذا تُوضع الكلمات الأكثر تحديداً أولاً.
 * مثال: «اكسسوارات الجوالات» يجب أن تُطابق الجوال لا الإكسسوارات العامة.
 */
const KEYWORD_FALLBACKS: ReadonlyArray<readonly [readonly string[], LucideIcon]> = [
  [['جوال', 'هاتف', 'موبايل', 'phone'], Smartphone],
  [['ساعة', 'ساعات', 'watch'], Watch],
  [['أجهزة', 'ذكية', 'smart'], Camera],
  [['كهربا', 'الكترون', 'إلكترون', 'electr'], Monitor],
  [['شعر', 'hair'], Scissors],
  [['بشرة', 'skin'], Flower2],
  [['طفل', 'أطفال', 'baby', 'kids'], Baby],
  [['مكياج', 'جمال', 'makeup', 'beauty'], Palette],
  [['سفر', 'رحلات', 'حقيبة', 'حقائب', 'travel', 'bag'], Briefcase],
  [['ملابس', 'أزياء', 'fashion'], Shirt],
  [['إكسسوار', 'اكسسوار', 'مجوهرات', 'accessor', 'jewel'], Gem],
  [['لياقة', 'رياضة', 'sport'], Activity],
  [['منزل', 'أثاث', 'تحسين', 'home'], BedDouble],
  [['صحة', 'عناية', 'جسم', 'health', 'care'], HeartPulse],
  [['هدية', 'هدايا', 'gift'], Gift]
];

/**
 * يرجّع مكوّن الأيقونة المناسب للتصنيف.
 * الأولوية لما اختاره الأدمن، ثم للاستنتاج من الاسم، ثم للأيقونة الافتراضية.
 */
export const resolveCategoryIcon = (
  category: { name?: string; icon?: string | null } | null | undefined
): LucideIcon => {
  if (!category) return DEFAULT_CATEGORY_ICON;

  if (category.icon && ICONS_BY_NAME[category.icon]) {
    return ICONS_BY_NAME[category.icon];
  }

  const name = (category.name || '').toLowerCase();
  const match = KEYWORD_FALLBACKS.find(([keywords]) =>
    keywords.some(keyword => name.includes(keyword.toLowerCase()))
  );

  return match ? match[1] : DEFAULT_CATEGORY_ICON;
};
