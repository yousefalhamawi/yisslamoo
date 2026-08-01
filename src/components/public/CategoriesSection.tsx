
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Collection } from '../../types/admin';
import { useCollections } from '../../hooks/useCollections';

/** أقصى عدد مجموعات تُعرض في مخطط البنتو */
const FEATURED_COLLECTIONS_LIMIT = 3;

/** يحوّل رقم الترتيب إلى أرقام عربية بخانتين — ٠١، ٠٢، ٠٣ */
const toArabicIndex = (index: number): string =>
  String(index + 1)
    .padStart(2, '0')
    .replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);

interface BentoTileProps {
  collection: Collection;
  index: number;
  /** البلاطة الكبيرة تأخذ عمودين وصفّين وخطاً أعرض */
  isFeature: boolean;
  reduceMotion: boolean;
}

const BentoTile: React.FC<BentoTileProps> = ({ collection, index, isFeature, reduceMotion }) => (
  <motion.div
    initial={reduceMotion ? false : { opacity: 0, scale: 0.97 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ duration: 0.45, delay: index * 0.08 }}
    className={isFeature ? 'md:row-span-2 h-56 md:h-auto' : 'h-40 md:h-auto'}
  >
    <Link
      to={`/collection/${collection.id}`}
      className="group relative block w-full h-full rounded-[1.5rem] overflow-hidden ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <img
        src={collection.image}
        alt={collection.name}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.08] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-primaryDark/95 via-primaryDark/30 to-transparent transition-opacity duration-500 group-hover:from-primaryDark motion-reduce:transition-none" />

      <span
        aria-hidden="true"
        className={`absolute top-4 right-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-accent ${
          isFeature ? 'w-11 h-11 text-sm' : 'w-8 h-8 text-[10px]'
        }`}
      >
        {toArabicIndex(index)}
      </span>

      <div className={`absolute inset-x-0 bottom-0 text-right ${isFeature ? 'p-6' : 'p-4'}`}>
        <h3
          className={`font-bold text-white leading-normal pb-0.5 ${
            isFeature ? 'text-2xl md:text-3xl' : 'text-base'
          }`}
        >
          {collection.name}
        </h3>

        {isFeature && collection.description && (
          <p className="text-xs text-white/70 leading-relaxed line-clamp-2 mt-1.5 max-w-sm">
            {collection.description}
          </p>
        )}

        <span
          className={`inline-flex items-center gap-2 font-bold text-accent uppercase tracking-[0.2em] ${
            isFeature ? 'mt-4 text-[10px]' : 'mt-2 text-[9px]'
          }`}
        >
          تصفح المجموعة
          <ArrowLeft className="w-3.5 h-3.5 transition-transform duration-500 group-hover:-translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
        </span>
      </div>
    </Link>
  </motion.div>
);

const CategoriesSection: React.FC = () => {
  const { collections, loading } = useCollections();
  const reduceMotion = !!useReducedMotion();

  const activeCollections = collections.filter(c => c.status === 'active');
  const featuredCollections = activeCollections.slice(0, FEATURED_COLLECTIONS_LIMIT);

  if (loading && collections.length === 0) {
    return (
      <div className="py-20 flex justify-center items-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (activeCollections.length === 0) {
    return null;
  }

  return (
    <section id="categories-section" className="py-16 md:py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-8"
        >
          <div className="text-right">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-primary font-bold uppercase tracking-[0.35em] text-[9px]">
                العوالم الحصرية
              </span>
              <div className="w-8 h-0.5 bg-accent rounded-full" />
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-textMain tracking-tighter leading-none">
              اختر عالمك <span className="text-primary">الخاص</span>
            </h2>
          </div>

          <Link
            to="/collections"
            className="group inline-flex items-center gap-2 text-xs font-bold text-textMain hover:text-primary transition-colors shrink-0 motion-reduce:transition-none"
          >
            كل المجموعات
            <span className="text-[10px] text-gray-300 font-normal">
              ({activeCollections.length})
            </span>
            <ArrowLeft className="w-4 h-4 transition-transform duration-500 group-hover:-translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0" />
          </Link>
        </motion.div>

        {/* مخطط البنتو: بلاطة كبيرة تأخذ صفّين، وبلاطتان أصغر بجانبها */}
        <div className="grid grid-cols-1 md:grid-cols-[1.6fr_1fr] md:grid-rows-2 gap-4 md:h-[460px]">
          {featuredCollections.map((collection, index) => (
            <BentoTile
              key={collection.id}
              collection={collection}
              index={index}
              isFeature={index === 0}
              reduceMotion={reduceMotion}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
