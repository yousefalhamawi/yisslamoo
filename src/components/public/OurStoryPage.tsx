import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gift, Heart, Sparkles, Lightbulb, Truck, Target, ShieldCheck, Award, PenTool, Eye, Send, MessageSquare } from 'lucide-react';

const OurStoryPage: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const reasons = [
    {
      id: 1,
      title: 'أول متجر سوري متخصص في بيع الهدايا',
      desc: 'نوفر لك تجربة تسوق فريدة لهدايا مصممة بإتقان ومواكبة لأحدث الأفكار، لتجد دائمًا ما يناسب كل مناسبة.',
      icon: Award,
      color: 'from-amber-500/10 to-amber-600/5 text-amber-600 border-amber-500/20'
    },
    {
      id: 2,
      title: 'خدمة تخصيص مميزة (أسماء، تواريخ، رسائل)',
      desc: 'حوّل هديتك قطعة فريدة تحمل لمستك الخاصة… الاسم، التاريخ، أو رسالة من القلب تجعلها لا تُنسى.',
      icon: PenTool,
      color: 'from-purple-500/10 to-purple-600/5 text-purple-600 border-purple-500/20'
    },
    {
      id: 3,
      title: 'تغليف أنيق وجاهز للإهداء',
      desc: 'نهتم بأدق التفاصيل من التصميم حتى التغليف، لتصل هديتك جاهزة لتقديمها بأجمل صورة وأرقى أسلوب.',
      icon: Gift,
      color: 'from-pink-500/10 to-pink-600/5 text-pink-600 border-pink-500/20'
    },
    {
      id: 4,
      title: 'دعم عملاء دائم ومتفهم لكل طلبك',
      desc: 'فريقنا معك خطوة بخطوة، من اختيار الهدية حتى استلامها، لنضمن لك تجربة تسوّق سلسة ومريحة.',
      icon: MessageSquare,
      color: 'from-blue-500/10 to-blue-600/5 text-blue-600 border-blue-500/20'
    }
  ];

  const values = [
    {
      title: 'الجودة في يسلمو',
      desc: 'نسعى دائما لإضافة المنتجات المختارة بعناية لضمان استدامة وأناقة كل هدية.',
      icon: Sparkles,
      color: 'text-amber-500 bg-amber-50'
    },
    {
      title: 'الإبداع في الإختيار',
      desc: 'منتجاتنا مميزة تتماشى مع الذوق الراقي المعاصر وتلائم كل المناسبات.',
      icon: Lightbulb,
      color: 'text-purple-500 bg-purple-50'
    },
    {
      title: 'التوصيل الملكي',
      desc: 'نصل إليك في أسرع وقت ممكن وبأعلى معايير الأمان لضمان سلامة هديتك المميزة.',
      icon: Truck,
      color: 'text-blue-500 bg-blue-50'
    },
    {
      title: 'الاهتمام بالتفاصيل',
      desc: 'نهتم بجميع التفاصيل رحلة النخبة لدينا من الطلب الى التغليف و الشحن و بعد الاستلام.',
      icon: Target,
      color: 'text-red-500 bg-red-50'
    },
    {
      title: 'التشفير الآمن',
      desc: 'نوفر لك خيارات دفع متعددة آمنة تماماً لضمان راحة بالك أثناء تسوق الفخامة.',
      icon: ShieldCheck,
      color: 'text-emerald-500 bg-emerald-50'
    }
  ];

  return (
    <div className="bg-[#FCFBFA] min-h-screen text-right pb-24">
      {/* Editorial page header — aligned with the shop and collections pages. */}
      <section className="page-offset-lg pb-16 md:pb-20 bg-[#FCFBFA]">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <nav
            className="flex items-center justify-center gap-2 text-[10px] font-bold tracking-[0.2em] text-gray-400 mb-6"
            aria-label="مسار التنقل"
          >
            <button
              type="button"
              className="transition-colors hover:text-primary"
              onClick={() => navigate('/')}
            >
              الرئيسية
            </button>
            <span className="text-gray-300">/</span>
            <span className="text-primaryDark">قصتنا</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="block mb-4 text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
              من نحن
            </span>
            <h1 className="mb-5 text-4xl md:text-6xl font-bold tracking-tight leading-tight text-primaryDark">
              قصتنا
            </h1>
            <div className="w-16 h-px mx-auto mb-5 bg-accent/70" />
            <p className="max-w-2xl mx-auto text-sm md:text-base font-normal leading-7 md:leading-8 text-gray-500">
              تعرّف على الشغف والرؤية وراء متجر يسلمو، أول وجهة إلكترونية متكاملة لصناعة اللحظات الدافئة والإهداء الفاخر في سوريا.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro Section - The Concept of "Yaslamo" */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-x-0 top-1/2 h-[75%] -translate-y-1/2 bg-gradient-to-l from-[#F6F1FA] via-white to-[#FFF8EC]" />
        <div className="absolute top-20 right-[8%] w-44 h-44 rounded-full bg-[#D4AF37]/10 blur-3xl" />
        <div className="absolute bottom-10 left-[10%] w-56 h-56 rounded-full bg-[#4b3976]/10 blur-3xl" />

        <div className="container relative mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 bg-white/80 backdrop-blur-sm rounded-[2rem] md:rounded-[2.5rem] p-7 md:p-10 border border-white shadow-[0_24px_80px_rgba(46,16,101,0.08)] space-y-6"
          >
            <div className="flex items-center justify-start gap-3 text-[#B38728] font-bold text-[10px] uppercase tracking-[0.3em]">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#D4AF37]/15 text-[#B38728]">
                <Sparkles size={14} />
              </span>
              <span>البداية والاسم</span>
              <span className="w-10 h-px bg-[#D4AF37]/70" />
            </div>
            <h2 className="max-w-xl text-3xl md:text-[2.7rem] font-black text-[#1A0E2B] leading-[1.28] tracking-tight">
              كلمة صغيرة، ومعنى كبير من الامتنان والتقدير.
            </h2>
            <div className="relative overflow-hidden rounded-2xl bg-[#F6F1FA] border border-[#4b3976]/10 px-6 py-5 text-[#4b3976]">
              <span className="absolute top-[-18px] left-5 text-7xl leading-none font-serif text-[#D4AF37]/25">“</span>
              <p className="relative text-base md:text-lg leading-8 font-medium">
                أصلها من الفعل <strong className="text-[#B38728] font-black">"سَلِم"</strong> أي الدعاء بالسلامة والعافية، وكأن القائل يقول: <span className="font-black">"يسلم إيدك"</span>.
              </p>
            </div>
            <div className="text-gray-600 text-sm md:text-base leading-8 font-normal space-y-4">
              <p>
                من هنا، وُلِد <strong className="text-[#4b3976] font-black">"متجر يسلمو"</strong> – وجهتك للهدايا المختارة بعناية، حيث تجتمع اللمسة الشخصية والجودة العالية والتصميم الراقي.
              </p>
              <p className="font-black text-[#1A0E2B]">
                نحن لا نبيع منتجات فحسب… نحن نساعدك على التعبير، الإهداء، والاحتفال.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: 'اختيار بعناية', icon: Gift },
                { label: 'لمسة شخصية', icon: Heart },
                { label: 'فخامة في التفاصيل', icon: Sparkles },
              ].map(({ label, icon: Icon }) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#4b3976]/10 px-3.5 py-2 text-[10px] font-bold text-primaryDark shadow-sm">
                  <Icon size={13} className="text-[#B38728]" />
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative px-3 md:px-5"
          >
            <div className="absolute -inset-2 rounded-[2.5rem] bg-gradient-to-br from-[#D4AF37]/35 via-transparent to-[#4b3976]/25 blur-sm" />
            <div className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border-[10px] border-white shadow-[0_28px_70px_rgba(46,16,101,0.16)] bg-white">
              <img 
                src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop" 
                alt="الهدايا الفاخرة في يسلمو" 
                className="w-full h-[330px] sm:h-[410px] object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-[#4b3976]/90 backdrop-blur-md px-4 py-3 text-white shadow-lg">
                <div>
                  <p className="text-[9px] text-white/60 mb-0.5">هدية تحكي قصة</p>
                  <p className="text-xs font-bold">كل تفصيل يصنع لحظة</p>
                </div>
                <Gift size={20} className="text-[#D4AF37]" />
              </div>
            </div>
          </motion.div>
          </div>
        </div>
      </section>

      {/* Why Yaslamo Section */}
      <section className="py-20 bg-white border-y border-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold text-[#4b3976] uppercase tracking-[0.4em] mb-4 block">🎁 لماذا "يسلمو"؟</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A0E2B]">المتجر الذي يصنع الفارق</h2>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {reasons.map((r) => (
              <motion.div
                key={r.id}
                variants={itemVariants}
                className="bg-[#FCFBFA] border border-gray-100 rounded-[2.5rem] p-8 hover:shadow-[0_30px_60px_rgba(0,0,0,0.03)] hover:border-transparent transition-all duration-300 flex items-start gap-5 text-right relative group overflow-hidden"
              >
                <div className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center border transition-transform duration-500 group-hover:scale-110`}>
                  <r.icon size={24} strokeWidth={1.5} />
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-[#1A0E2B] group-hover:text-[#4b3976] transition-colors">{r.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed font-light">{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 bg-[#FCFBFA]">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[10px] font-bold text-[#4b3976] uppercase tracking-[0.4em] mb-4 block">✨ مبادئنا</span>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A0E2B]">القيم التي تحكم كل تفصيل لدينا</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {values.map((v, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * idx, duration: 0.6 }}
                className="bg-white border border-gray-100 rounded-[2rem] p-6 text-center flex flex-col items-center shadow-[0_10px_35px_rgba(0,0,0,0.01)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl ${v.color} flex items-center justify-center mb-6`}>
                  <v.icon size={22} strokeWidth={1.5} />
                </div>
                <h4 className="font-bold text-sm text-[#1A0E2B] mb-3">{v.title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed font-light">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[#4b3976]/5 to-transparent border border-primary/5 rounded-[2.5rem] p-10 flex flex-col justify-between text-right relative overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#D4AF37] flex items-center justify-center">
                  <Eye size={24} />
                </div>
                <h3 className="text-2xl font-black text-[#1A0E2B]">رؤيتنا</h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light">
                  أن يكون "يسلمو" الوجهة الأولى للباحثين عن هدايا فريدة تعبّر عنهم في كل مناسبة، داخل سوريا وخارجها.
                </p>
              </div>
            </motion.div>

            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-[#4b3976]/5 to-transparent border border-primary/5 rounded-[2.5rem] p-10 flex flex-col justify-between text-right relative overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#4b3976]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#4b3976] flex items-center justify-center">
                  <Send size={24} />
                </div>
                <h3 className="text-2xl font-black text-[#1A0E2B]">رسالتنا</h3>
                <p className="text-gray-600 text-base md:text-lg leading-relaxed font-light">
                  أن نعيد تعريف معنى "الهدية" في ثقافتنا، ونجعل من كل لحظة فرصة للتعبير عن الامتنان، الحب، والمشاركة.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OurStoryPage;
