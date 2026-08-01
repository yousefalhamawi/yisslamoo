import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, FileText, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, Eye, HelpCircle } from 'lucide-react';
import { SOCIAL_LINKS } from '../../constants/socialLinks';

const PoliciesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'privacy';

  const tabs = [
    { id: 'privacy', label: 'سياسة الخصوصية', icon: ShieldCheck, desc: 'حماية بياناتك الشخصية وسرية معلوماتك' },
    { id: 'terms', label: 'الشروط والأحكام', icon: FileText, desc: 'اتفاقية الاستخدام والالتزامات المتبادلة' },
    { id: 'refund', label: 'الاستبدال والاسترجاع', icon: RefreshCw, desc: 'شروط إرجاع وتعديل الهدايا والطلبات' }
  ];

  const handleTabChange = (id: string) => {
    setSearchParams({ tab: id });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, y: -15, transition: { duration: 0.3 } }
  };

  return (
    <div className="bg-[#FCFBFA] min-h-screen text-right pb-24">
      {/* Breadcrumb / Banner Section */}
      <section className="relative page-offset-lg pb-24 bg-gradient-to-br from-[#2E1065] to-[#4C1D95] text-white overflow-hidden">
        {/* Soft Decorative Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-50%] right-[-20%] w-[80%] h-[150%] bg-[#D4AF37]/10 rounded-full blur-[140px] rotate-12" />
          <div className="absolute bottom-[-50%] left-[-20%] w-[60%] h-[120%] bg-[#2E1065]/60 rounded-full blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10 max-w-6xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-bold text-[#D4AF37] mb-6 justify-start">
            <span className="cursor-pointer hover:underline" onClick={() => navigate('/')}>الرئيسية</span>
            <span className="text-white/40">/</span>
            <span className="text-white/90">السياسات والشروط</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white leading-tight">
              السياسات والشروط
            </h1>
            <p className="text-white/80 font-normal text-base md:text-lg leading-relaxed max-w-2xl">
              تصفح سياسات الاستخدام والخصوصية الخاصة بمتجر يسلمو لضمان أفضل تجربة إهداء ملكية آمنة وراقية.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-16 container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Sidebar Tabs */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.01)]">
              <h3 className="font-black text-lg text-primaryDark mb-6 px-2">أقسام السياسات</h3>
              <div className="flex flex-col gap-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`w-full text-right flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 relative group overflow-hidden ${
                        isActive
                          ? 'border-[#4C1D95]/20 bg-primary/5 text-primaryDark shadow-sm'
                          : 'border-transparent hover:bg-gray-50 text-gray-500 hover:text-primaryDark'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute right-0 top-0 bottom-0 w-1 bg-[#D4AF37]"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 group-hover:scale-110 ${
                        isActive ? 'bg-[#4C1D95] text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-primary/5 group-hover:text-primary'
                      }`}>
                        <Icon size={18} strokeWidth={1.8} />
                      </div>
                      <div className="space-y-1">
                        <p className="font-bold text-sm">{tab.label}</p>
                        <p className="text-[10px] text-gray-400 group-hover:text-gray-500">{tab.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Quick Contact Help widget */}
            <div className="bg-gradient-to-tr from-[#2E1065] to-[#4C1D95] text-white rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden text-right">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/10 rounded-full blur-xl pointer-events-none" />
              <HelpCircle className="w-8 h-8 text-[#D4AF37] mb-6" />
              <h4 className="font-black text-base mb-2">هل تحتاج إلى مساعدة إضافية؟</h4>
              <p className="text-white/70 text-xs leading-relaxed mb-6 font-normal">
                فريق الدعم الفني وخدمة العملاء متواجد لمساعدتك والإجابة على أي استفسارات تتعلق بالشروط أو طلبك.
              </p>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#D4AF37] text-primaryDark px-6 py-3 rounded-xl font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/20"
              >
                تواصل مع الدعم الفني
              </a>
            </div>
          </div>

          {/* Policy Text Area */}
          <div className="lg:col-span-8 bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-[0_10px_35px_rgba(0,0,0,0.01)] min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === 'privacy' && (
                <motion.div
                  key="privacy-policy"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3 justify-start text-[#D4AF37] font-bold text-xs uppercase tracking-[0.2em]">
                    <span className="w-8 h-px bg-[#D4AF37]" />
                    <span>حماية الخصوصية والأمان</span>
                  </div>
                  
                  <h2 className="text-2xl md:text-3xl font-black text-primaryDark">سياسة الخصوصية وسرية المعلومات</h2>
                  <p className="text-gray-500 text-sm leading-relaxed font-light">
                    نهتم في متجر "يسلمو" بخصوصية بياناتك ونسعى جاهدين لحمايتها بأعلى معايير الأمان التقنية والتنظيمية. توضح هذه السياسة كيف نقوم بجمع، معالجة، وحماية البيانات الشخصية التي تشاركها معنا أثناء استخدامك لموقعنا.
                  </p>

                  <div className="h-px bg-gray-100" />

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-1">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-primaryDark">1. البيانات التي نقوم بجمعها</h4>
                        <p className="text-gray-400 text-xs leading-relaxed font-normal">
                          نجمع المعلومات التي تقدمها لنا طواعية عند إكمال الطلبات أو التسجيل، بما في ذلك الاسم، ورقم الهاتف للاتصال والواتساب، وعنوان الشحن والتوصيل، والبريد الإلكتروني.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-1">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-primaryDark">2. استخدام البيانات ومعالجتها</h4>
                        <p className="text-gray-400 text-xs leading-relaxed font-normal">
                          نستخدم بياناتك الشخصية لمعالجة وتأكيد طلبات الشراء، وتجهيز وتغليف الهدايا المخصصة، وتوجيه خدمات التوصيل الملكية لضمان سلامتها، بالإضافة إلى تحسين جودة خدماتنا وتقديم دعم سريع ومناسب.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-1">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-primaryDark">3. مشاركة وحماية البيانات مع جهات خارجية</h4>
                        <p className="text-gray-400 text-xs leading-relaxed font-normal">
                          نحن لا نبيع أو نؤجر معلوماتك الشخصية لأي طرف ثالث. تتم مشاركة الاسم والعنوان ورقم الهاتف حصراً مع مندوب التوصيل أو شركة التوصيل المعتمدة لإتمام تسليم الهدية بأمان.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-1">
                        <CheckCircle2 size={16} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-primaryDark">4. ملفات تعريف الارتباط (Cookies)</h4>
                        <p className="text-gray-400 text-xs leading-relaxed font-normal">
                          نستخدم ملفات تعريف الارتباط لتعزيز تجربة التصفح الخاصة بك، والاحتفاظ بمحتويات سلة التسوق الخاصة بك، والتعرف على تفضيلاتك لضمان تجربة تسوق سلسة عند عودتك للموقع.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'terms' && (
                <motion.div
                  key="terms-and-conditions"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3 justify-start text-[#D4AF37] font-bold text-xs uppercase tracking-[0.2em]">
                    <span className="w-8 h-px bg-[#D4AF37]" />
                    <span>اتفاقية الاستخدام للعميل</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black text-primaryDark">الشروط والأحكام العامة</h2>
                  <p className="text-gray-500 text-sm leading-relaxed font-light">
                    يرجى قراءة شروط الخدمة هذه بعناية قبل استخدام موقع "يسلمو". يمثل وصولك إلى الموقع واستخدامه موافقة صريحة منك على الالتزام بهذه الشروط والبنود المعمول بها.
                  </p>

                  <div className="h-px bg-gray-100" />

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-1">
                        <FileText size={16} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-primaryDark">1. تسجيل الطلبات والتخصيص</h4>
                        <p className="text-gray-400 text-xs leading-relaxed font-normal">
                          العميل مسؤول بشكل كامل عن دقة كافة البيانات المقدمة، وتحديداً كتابة الأسماء، التواريخ، أو العبارات المطلوبة للهدايا المخصصة. يتم تجهيز الهدية فور تأكيد الطلب ولا يمكن تعديل المنتجات المخصصة بعد بدء الإنتاج.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-1">
                        <FileText size={16} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-primaryDark">2. الأسعار وفروقات الصرف</h4>
                        <p className="text-gray-400 text-xs leading-relaxed font-normal">
                          تُعرض كافة الأسعار بالعملة المحلية وتخضع للتحديث بناءً على أسعار الصرف الرسمية المعتمدة في إدارة المتجر. يحتفظ متجر يسلمو بالحق في تعديل أسعار المنتجات أو إلغاء العروض الترويجية في أي وقت دون إشعار مسبق.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-1">
                        <FileText size={16} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-primaryDark">3. التوصيل واستلام الطلب</h4>
                        <p className="text-gray-400 text-xs leading-relaxed font-normal">
                          نلتزم بالتوصيل الملكي الآمن والآني ضمن دمشق وباقي المحافظات السورية حسب الشروط المتفق عليها. يجب على العميل أو مستلم الهدية معاينة الهدية ظاهرياً للتأكد من سلامة التغليف والخلو من الأضرار قبل مغادرة المندوب.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-1">
                        <FileText size={16} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-primaryDark">4. الملكية الفكرية</h4>
                        <p className="text-gray-400 text-xs leading-relaxed font-normal">
                          جميع التصاميم، الشعارات، الصور، ومحتويات المتجر الإلكتروني هي ملكية فكرية حصرية لمتجر "يسلمو". يمنع استخدامها أو نسخها لأي أغراض تجارية أو منافسة دون إذن كتابي رسمي ومسبق من الإدارة.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'refund' && (
                <motion.div
                  key="refund-policy"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-8"
                >
                  <div className="flex items-center gap-3 justify-start text-[#D4AF37] font-bold text-xs uppercase tracking-[0.2em]">
                    <span className="w-8 h-px bg-[#D4AF37]" />
                    <span>الضمان واستعادة الأموال</span>
                  </div>

                  <h2 className="text-2xl md:text-3xl font-black text-primaryDark">سياسة الاستبدال والاسترجاع</h2>
                  <p className="text-gray-500 text-sm leading-relaxed font-light">
                    نحرص في متجر "يسلمو" على تقديم منتجات متميزة تلائم ذوقكم الرفيع ومناسباتكم السعيدة. نوضح أدناه ضوابط وشروط الإرجاع أو التغيير لضمان الشفافية الكاملة.
                  </p>

                  <div className="h-px bg-gray-100" />

                  <div className="space-y-6">
                    <div className="bg-[#4C1D95]/5 border-r-4 border-[#4C1D95] p-5 rounded-l-2xl flex items-start gap-3">
                      <AlertTriangle className="text-[#D4AF37] shrink-0 mt-0.5" size={18} />
                      <p className="text-xs text-primaryDark leading-relaxed font-medium">
                        <strong>تنبيه هام للمنتجات المخصصة:</strong> لا يمكن إرجاع أو استبدال الهدايا التي تم تخصيصها باسم، تاريخ، أو رسالة بناءً على طلب العميل إلا في حال وجود خطأ في التنفيذ أو عيب مصنعي من طرفنا.
                      </p>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-1">
                        <RefreshCw size={16} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-primaryDark">1. المنتجات غير المخصصة</h4>
                        <p className="text-gray-400 text-xs leading-relaxed font-normal">
                          يحق للعميل طلب استبدال أو استرجاع المنتجات الجاهزة (غير المخصصة) خلال 3 أيام من تاريخ الاستلام، شريطة أن تكون السلعة في حالتها الأصلية المغلقة تماماً، غير مستخدمة، وبغلافها الخارجي الأصلي.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-1">
                        <RefreshCw size={16} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-primaryDark">2. العيوب المصنعية وأخطاء التنفيذ</h4>
                        <p className="text-gray-400 text-xs leading-relaxed font-normal">
                          في حال وجود عيب مصنعي أو خطأ كتابي أو تنفيذي ناتج من طرف متجر يسلمو، نتحمل كامل التكاليف الخاصة بإعادة شحن وتوصيل وتصحيح الهدية أو استبدالها بقطعة مطابقة وجديدة فوراً.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center shrink-0 mt-1">
                        <RefreshCw size={16} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-primaryDark">3. آلية استرجاع المبالغ</h4>
                        <p className="text-gray-400 text-xs leading-relaxed font-normal">
                          عند الموافقة على طلب استرجاع، يتم تحويل المبلغ المسترد للعميل عن طريق طرق الدفع المتاحة محلياً أو تسليمه نقداً خلال مدة تتراوح بين 3 إلى 7 أيام عمل بعد استلام المتجر للمنتج والتأكد من سلامته الأصلية.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>
    </div>
  );
};

export default PoliciesPage;
