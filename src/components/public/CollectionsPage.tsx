
import React from 'react';
import { motion } from 'framer-motion';
import { useCollections } from '../../hooks/useCollections';

interface CollectionsPageProps {
  onCollectionClick: (category: string) => void;
}

const CollectionsPage: React.FC<CollectionsPageProps> = ({ onCollectionClick }) => {
  const { collections, loading } = useCollections();

  const activeCollections = collections.filter(c => c.status === 'active');

  if (loading && collections.length === 0) {
    return (
      <div className="min-h-screen pt-48 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white min-h-screen pt-48 lg:pt-56 pb-32 overflow-hidden"
    >
      <div className="container mx-auto px-6">
        {/* Header Section */}
        <div className="max-w-4xl mx-auto text-center mb-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block px-5 py-1.5 bg-primary/5 text-primary rounded-full text-xs font-bold tracking-[0.2em] uppercase mb-6"
          >
            مجموعاتنا الحصرية
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-textMain tracking-tight leading-tight mb-8"
          >
            مجموعات <br />
            <span className="text-primary">يسلمو</span> الحصرية
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 font-normal max-w-xl mx-auto leading-relaxed"
          >
            كل مجموعة هي رحلة فريدة في عالم الجمال والإبداع، صُممت لتلبي تطلعاتكم وتليق بمناسباتكم الغالية.
          </motion.p>

          {/* Decorative Background Text */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[20vw] font-black text-gray-50 -z-10 select-none opacity-50">
            مختارة
          </div>
        </div>

        {/* Collections Stack */}
        <div className="space-y-32">
          {activeCollections.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-xl font-light">لا توجد مجموعات متاحة حالياً</p>
            </div>
          ) : (
            activeCollections.map((col, idx) => (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 100 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => onCollectionClick(col.id)}
                className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-16 items-center group cursor-pointer`}
              >
                {/* Image Side */}
                <div className="flex-1 relative w-full aspect-[16/10] lg:aspect-square rounded-[4rem] overflow-hidden shadow-2xl">
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 1.5 }}
                    src={col.image}
                    alt={col.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-primaryDark/10 group-hover:bg-transparent transition-colors duration-700" />

                  {/* Floating Tag */}
                  <div className="absolute top-8 right-8 bg-accent text-primaryDark px-4 py-2 rounded-xl font-bold text-[10px] shadow-xl">
                    {idx === 0 ? 'الأكثر رواجاً' : idx === 1 ? 'إصدارات محدودة' : 'تغليف ملكي'}
                  </div>
                </div>

                {/* Info Side */}
                <div className={`flex-1 text-right ${idx % 2 === 0 ? 'lg:pr-12' : 'lg:pl-12'}`}>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-primary font-bold text-xs uppercase tracking-widest">{col.products?.length || 0} قطعة فريدة</span>
                    <div className="w-8 h-px bg-primary/20" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-textMain mb-6 leading-tight group-hover:text-primary transition-colors duration-500">
                    {col.name}
                  </h2>
                  <p className="text-lg text-gray-400 font-normal leading-relaxed mb-8 max-w-lg mr-0 ml-auto">
                    {col.description}
                  </p>

                  <motion.button
                    whileHover={{ gap: '1.5rem' }}
                    className="flex items-center gap-4 text-primary font-bold text-base flex-row-reverse group-hover:text-primaryDark transition-all"
                  >
                    <span className="border-b border-primary/20 pb-1">اكتشف المجموعة كاملة</span>
                    <div className="w-12 h-12 rounded-full border border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Bottom Decorative Section */}
        <div className="mt-32 pt-16 border-t border-gray-50 flex flex-col items-center">
          <p className="text-gray-300 font-bold uppercase tracking-[0.3em] text-[10px] mb-8">نخبة • الفخامة كمعيار</p>
          <div className="flex gap-12 md:gap-20">
            <div className="text-center">
              <h4 className="text-3xl font-bold text-textMain">١٠٠٪</h4>
              <p className="text-gray-400 font-bold text-[10px] mt-2">جودة مضمونة</p>
            </div>
            <div className="text-center">
              <h4 className="text-3xl font-bold text-textMain">٢٤/٧</h4>
              <p className="text-gray-400 font-bold text-[10px] mt-2">دعم مخصص</p>
            </div>
            <div className="text-center">
              <h4 className="text-3xl font-bold text-textMain">∞</h4>
              <p className="text-gray-400 font-bold text-[10px] mt-2">ذكريات خالدة</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CollectionsPage;
