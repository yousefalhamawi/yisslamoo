
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCollections } from '../../hooks/useCollections';

const CategoriesSection: React.FC = () => {
  const { collections, loading } = useCollections();

  const activeCollections = collections.filter(c => c.status === 'active');

  // Take the first 3 collections for the featured layout
  const mainCollection = activeCollections[0];
  const secondCollection = activeCollections[1];
  const thirdCollection = activeCollections[2];

  if (loading && collections.length === 0) {
    return (
      <div className="py-24 flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If no collections, optionally show something or return null
  if (activeCollections.length === 0) {
    return null;
  }

  return (
    <section id="categories-section" className="py-48 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-end justify-between mb-32 gap-12 relative">
          <div className="text-right relative z-10">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 mb-6"
            >
              <span className="text-primary font-bold uppercase tracking-[0.4em] text-[9px]">العوالم الحصرية</span>
              <div className="w-10 h-1 bg-accent rounded-full"></div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold text-textMain tracking-tighter leading-none"
            >
              اختر عالمك <br />
              <span className="text-primary relative">
                الخاص
                <svg className="absolute -bottom-3 left-0 w-full h-3 text-accent/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 0 100 5" fill="none" stroke="currentColor" strokeWidth="3" />
                </svg>
              </span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="max-w-md text-right"
          >
            <p className="text-lg text-gray-400 font-normal leading-relaxed mb-8">
              مجموعات منسقة بعناية لتعكس شخصيتك وتخلد ذكرياتك، من القطع الكلاسيكية الخالدة إلى الابتكارات العصرية الجريئة.
            </p>
            <div className="flex justify-end gap-10">
              <div className="text-right">
                <p className="text-xl font-bold text-textMain">+١٥٠</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">تصميم حصري</p>
              </div>
              <div className="w-px h-12 bg-gray-100"></div>
              <div className="text-right">
                <p className="text-xl font-bold text-textMain">٢٤</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">مجموعة عالمية</p>
              </div>
            </div>
          </motion.div>

          <div className="absolute -top-20 -left-20 text-[15rem] font-black text-gray-50 select-none pointer-events-none -z-10">
            نخبة
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 h-auto md:h-[900px]">
          {mainCollection && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="md:col-span-8 relative rounded-[4rem] overflow-hidden group cursor-pointer shadow-2xl shadow-black/5"
            >
              <Link to={`/collection/${mainCollection.id}`} className="block w-full h-full">
                <img
                  src={mainCollection.image}
                  className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                  alt={mainCollection.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primaryDark/80 via-primaryDark/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-700" />

                <div className="absolute inset-0 p-16 flex flex-col justify-end items-end text-right">
                  <motion.div className="overflow-hidden">
                    <span className="text-accent font-bold text-[10px] uppercase tracking-[0.4em] mb-4 block transform translate-y-10 group-hover:translate-y-0 transition-transform duration-700">الإصدار المخملي</span>
                    <h3 className="text-5xl md:text-6xl font-bold text-white mb-6 transform translate-y-10 group-hover:translate-y-0 transition-transform duration-700 delay-75">{mainCollection.name}</h3>
                    <p className="text-white/60 text-sm max-w-sm mb-10 transform translate-y-10 group-hover:translate-y-0 transition-transform duration-700 delay-150">{mainCollection.description}</p>

                    <div className="flex items-center gap-6 transform translate-y-10 group-hover:translate-y-0 transition-transform duration-700 delay-200">
                      <span className="text-white font-bold text-xs border-b-2 border-accent pb-1">تصفح المجموعة</span>
                      <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white group-hover:bg-accent group-hover:text-primaryDark group-hover:border-accent transition-all duration-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </Link>

              <div className="absolute top-12 left-12 w-20 h-20 rounded-full border border-white/10 backdrop-blur-md flex items-center justify-center text-white font-black text-2xl">
                ٠١
              </div>
            </motion.div>
          )}

          <div className="md:col-span-4 flex flex-col gap-10">
            {secondCollection && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                className="flex-1 relative rounded-[4rem] overflow-hidden group cursor-pointer shadow-2xl shadow-black/5"
              >
                <Link to={`/collection/${secondCollection.id}`} className="block w-full h-full">
                  <img
                    src={secondCollection.image}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                    alt={secondCollection.name}
                  />
                  <div className="absolute inset-0 bg-primaryDark/40 group-hover:bg-primaryDark/60 transition-colors duration-700" />

                  <div className="absolute inset-0 p-12 flex flex-col justify-end items-end text-right">
                    <span className="text-accent font-bold text-[9px] uppercase tracking-[0.3em] mb-3">للشخصية القيادية</span>
                    <h3 className="text-3xl font-bold text-white mb-6">{secondCollection.name}</h3>
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-white group-hover:text-primaryDark transition-all duration-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {thirdCollection && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -10 }}
                className="flex-1 relative rounded-[4rem] overflow-hidden group cursor-pointer shadow-2xl shadow-black/5"
              >
                <Link to={`/collection/${thirdCollection.id}`} className="block w-full h-full">
                  <img
                    src={thirdCollection.image}
                    className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110"
                    alt={thirdCollection.name}
                  />
                  <div className="absolute inset-0 bg-primary/30 mix-blend-multiply group-hover:opacity-40 transition-all" />
                  <div className="absolute inset-0 bg-gradient-to-t from-primaryDark/90 via-transparent to-transparent" />

                  <div className="absolute inset-0 p-12 flex flex-col justify-end items-end text-right">
                    <h3 className="text-2xl font-bold text-white mb-2">{thirdCollection.name}</h3>
                    <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">تغليف يدوي فاخر</p>
                  </div>
                </Link>
              </motion.div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-24 flex flex-col items-center"
        >
          <Link
            to="/collections"
            className="group flex flex-col items-center gap-6"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-primary transition-colors duration-500">
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-primary"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </motion.div>
              </div>
              <div className="absolute -inset-4 border border-dashed border-primary/20 rounded-full animate-[spin_10s_linear_infinite] group-hover:border-primary/40 transition-colors" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.5em] text-gray-400 group-hover:text-primary transition-colors">تصفح كافة المواسم</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoriesSection;
