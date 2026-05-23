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
      {/* Breadcrumb / Banner Section */}
      <section className="relative pt-40 pb-24 bg-gradient-to-br from-[#2E1065] to-[#4C1D95] text-white overflow-hidden">
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
            <span className="text-white/90">قصتنا</span>
          </nav>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight text-white leading-tight">
              قصتنا
            </h1>
            <p className="text-white/80 font-normal text-base md:text-lg leading-relaxed max-w-2xl">
              تعرّف على الشغف والرؤية وراء متجر يسلمو، أول وجهة إلكترونية متكاملة لصناعة اللحظات الدافئة والإهداء الفاخر في سوريا.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro Section - The Concept of "Yaslamo" */}
      <section className="py-24 container mx-auto px-6 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="flex items-center gap-3 justify-start text-[#D4AF37] font-bold text-xs uppercase tracking-[0.3em]">
              <span className="w-8 h-px bg-[#D4AF37]" />
              <span>البداية والاسم</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-[#1A0E2B] leading-tight">
              الأول في سوريا... تُقال للتعبير عن الامتنان والتقدير.
            </h2>
            <div className="text-gray-600 text-base md:text-lg leading-relaxed font-light space-y-6">
              <p className="bg-primary/5 border-r-4 border-[#4C1D95] p-5 rounded-l-2xl font-medium text-[#2E1065]">
                أصلها من الفعل <strong className="text-[#D4AF37] font-black">"سَلِم"</strong> أي الدعاء بالسلامة والعافية، وكأن القائل يقول: <span className="underline decoration-[#D4AF37] decoration-2 font-bold">"يسلم إيدك"</span>.
              </p>
              <p>
                من هنا، وُلِد <strong className="text-[#2E1065] font-bold">"متجر يسلمو"</strong> – أول متجر إلكتروني في سوريا متخصص بالهدايا، بتشكيلة واسعة من المنتجات التي تجمع بين اللمسة الشخصية، الجودة العالية، والتصميم الراقي.
              </p>
              <p className="font-bold text-[#1A0E2B]">
                نحن لا نبيع منتجات فحسب… نحن نساعدك على التعبير، الإهداء، والاحتفال.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-[#D4AF37]/20 to-transparent rounded-[3rem] blur-2xl -z-10 transform scale-95" />
            <img 
              src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop" 
              alt="الهدايا الفاخرة في يسلمو" 
              className="w-full h-[400px] object-cover rounded-[3rem] shadow-2xl border border-gray-100 transform hover:scale-[1.02] transition-transform duration-500"
            />
          </motion.div>
        </div>
      </section>

      {/* Why Yaslamo Section */}
      <section className="py-20 bg-white border-y border-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-bold text-[#4C1D95] uppercase tracking-[0.4em] mb-4 block">🎁 لماذا "يسلمو"؟</span>
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
                  <h3 className="text-lg font-bold text-[#1A0E2B] group-hover:text-[#4C1D95] transition-colors">{r.title}</h3>
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
            <span className="text-[10px] font-bold text-[#4C1D95] uppercase tracking-[0.4em] mb-4 block">✨ مبادئنا</span>
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
              className="bg-gradient-to-br from-[#2E1065]/5 to-transparent border border-primary/5 rounded-[2.5rem] p-10 flex flex-col justify-between text-right relative overflow-hidden"
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
              className="bg-gradient-to-br from-[#4C1D95]/5 to-transparent border border-primary/5 rounded-[2.5rem] p-10 flex flex-col justify-between text-right relative overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#4C1D95]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="space-y-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#4C1D95] flex items-center justify-center">
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
