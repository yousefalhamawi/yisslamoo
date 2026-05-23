
import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Sparkles, Lightbulb, Target } from 'lucide-react';

const REASONS = [
  {
    title: 'الجودة في يسلمو',
    description: 'نسعى دائما لإضافة المنتجات المختارة بعناية لضمان استدامة وأناقة كل هدية.',
    icon: Sparkles,
    color: 'bg-amber-50 text-amber-600'
  },
  {
    title: 'الإبداع في الإختيار',
    description: 'منتجاتنا مميزة تتماشى مع الذوق الراقي المعاصر وتلائم كل المناسبات.',
    icon: Lightbulb,
    color: 'bg-purple-50 text-purple-600'
  },
  {
    title: 'التوصيل الملكي',
    description: 'نصل إليك في أسرع وقت ممكن وبأعلى معايير الأمان لضمان سلامة هديتك المميزة.',
    icon: Truck,
    color: 'bg-blue-50 text-blue-600'
  },
  {
    title: 'الاهتمام بالتفاصيل',
    description: 'نهتم بجميع التفاصيل رحلة النخبة لدينا من الطلب الى التغليف و الشحن و بعد الاستلام.',
    icon: Target,
    color: 'bg-red-50 text-red-600'
  },
  {
    title: 'التشفير الآمن',
    description: 'نوفر لك خيارات دفع متعددة آمنة تماماً لضمان راحة بالك أثناء تسوق الفخامة.',
    icon: ShieldCheck,
    color: 'bg-green-50 text-green-600'
  }
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      {/* Soft Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[10px] font-bold text-primary uppercase tracking-[0.4em] mb-6 block"
          >
            لماذا يختارنا النخبة؟
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-primaryDark leading-tight"
          >
            نصنع الفرق في <span className="text-primary">كل تفصيل</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 lg:gap-8">
          {REASONS.map((reason, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 * idx, duration: 0.8 }}
              className="relative group"
            >
              <div className="h-full p-8 lg:p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col items-center text-center">
                <div className={`w-16 h-16 ${reason.color} rounded-[1.5rem] flex items-center justify-center mb-8 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm`}>
                  <reason.icon size={26} strokeWidth={1.5} />
                </div>
                
                <h3 className="text-xl font-bold text-primaryDark mb-4">{reason.title}</h3>
                <p className="text-gray-500 leading-relaxed font-light text-sm">
                  {reason.description}
                </p>

                {/* Decorative Bottom Line */}
                <div className="mt-6 w-10 h-1 bg-gray-100 rounded-full group-hover:w-20 group-hover:bg-primary transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
