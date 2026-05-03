
import React from 'react';
import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Star } from 'lucide-react';

const REASONS = [
  {
    title: 'توصيل ملكي',
    description: 'نصل إليك في أسرع وقت ممكن وبأعلى معايير الأمان لضمان سلامة هديتك الأرجوانية.',
    icon: Truck,
    color: 'bg-blue-50 text-blue-600'
  },
  {
    title: 'دفع مشفر',
    description: 'نوفر لك خيارات دفع متعددة آمنة تماماً لضمان راحة بالك أثناء تسوق الفخامة.',
    icon: ShieldCheck,
    color: 'bg-green-50 text-green-600'
  },
  {
    title: 'جودة يسلمو',
    description: 'كل منتج في مجموعتنا يخضع لفحص دقيق يدوياً لضمان فخامة تليق بعملاء نخبة.',
    icon: Star,
    color: 'bg-amber-50 text-amber-600'
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {REASONS.map((reason, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 * idx, duration: 0.8 }}
              className="relative group"
            >
              <div className="h-full p-10 lg:p-12 rounded-[3rem] bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col items-center text-center">
                <div className={`w-20 h-20 ${reason.color} rounded-[2rem] flex items-center justify-center mb-10 transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-sm`}>
                  <reason.icon size={32} strokeWidth={1.5} />
                </div>
                
                <h3 className="text-2xl font-bold text-primaryDark mb-6">{reason.title}</h3>
                <p className="text-gray-500 leading-relaxed font-light text-lg">
                  {reason.description}
                </p>

                {/* Decorative Bottom Line */}
                <div className="mt-10 w-12 h-1 bg-gray-100 rounded-full group-hover:w-24 group-hover:bg-primary transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
