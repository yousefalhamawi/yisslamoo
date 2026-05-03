
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ChevronRight, ChevronLeft } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: "سارة الأحمد",
    role: "عميلة متميزة",
    content: "تجربة تسوق فريدة من نوعها. التغليف الملكي كان مبهراً جداً والجودة فاقت توقعاتي. فعلاً يسلمو!",
    rating: 5,
    avatar: "S"
  },
  {
    id: 2,
    name: "محمد الحسين",
    role: "جامع تحف",
    content: "دقة النقش بالليزر مذهلة جداً. طلبت طقم مكتبي وكان هدية راقية جداً لزميلي في العمل.",
    rating: 5,
    avatar: "M"
  },
  {
    id: 3,
    name: "لينا القاسم",
    role: "مهندسة ديكور",
    content: "أكثر ما أعجبني هو سرعة التوصيل والاهتمام بالتفاصيل الصغيرة في كل قطعة. فخورة بوجود هكذا براند سوري.",
    rating: 5,
    avatar: "L"
  }
];

const Testimonials: React.FC = () => {
  return (
    <section className="py-32 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-20 items-center">
          {/* Content Side */}
          <div className="lg:w-1/3 text-right">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6"
            >
              <span className="text-[10px] font-bold text-accent uppercase tracking-[0.4em]">آراء العملاء</span>
              <div className="w-10 h-1 bg-accent rounded-full"></div>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-primaryDark mb-8 tracking-tight leading-tight"
            >
              ماذا يقول <span className="text-accent underline decoration-accent/20 decoration-8 underline-offset-8">عشاق الفخامة</span> عن تجربتهم
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-sm leading-loose mb-12 font-normal"
            >
              نعتز بثقتكم ونسعى دائماً لتقديم الأفضل. كل تقييم هو دافع لنا للإبداع أكثر في عالم الهدايا الفاخرة.
            </motion.p>

            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-primaryDark hover:bg-accent hover:border-accent transition-all">
                <ChevronRight className="w-6 h-6" />
              </button>
              <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center text-primaryDark hover:bg-accent hover:border-accent transition-all">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Cards Side */}
          <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            <div className="absolute -top-10 -right-10 text-accent/5 -z-10">
              <Quote size={200} />
            </div>
            
            {TESTIMONIALS.map((t, idx) => (
              <motion.div 
                key={t.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={`p-10 rounded-[3rem] bg-[#FBFBFB] border border-gray-100/50 hover:bg-white hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 ${idx === 1 ? 'md:mt-12' : ''}`}
              >
                <div className="flex gap-1 text-accent mb-6">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                
                <p className="text-primaryDark/80 text-sm leading-[2] mb-8 font-normal italic">
                  "{t.content}"
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primaryDark text-accent flex items-center justify-center font-bold text-lg">
                    {t.avatar}
                  </div>
                  <div className="text-right">
                    <h4 className="text-sm font-bold text-primaryDark">{t.name}</h4>
                    <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">{t.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
