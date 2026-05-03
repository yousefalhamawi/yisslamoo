
import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryCircles: React.FC = () => {
  const { categories, loading } = useCategories();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const allCategories = categories.filter(c => c.status === 'active' && !c.parent_id);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // RTL: scrollLeft is 0 at start (right side), negative as we scroll left
      setCanScrollRight(scrollLeft < 0);
      setCanScrollLeft(Math.abs(scrollLeft) < scrollWidth - clientWidth - 10);
    }
  };

  // Auto-scroll effect
  useEffect(() => {
    let animationFrameId: number;
    const scrollElement = scrollRef.current;
    
    if (!scrollElement || loading) return;

    const performScroll = () => {
      if (!isPaused && scrollElement) {
        // In RTL, scrollLeft is negative. To scroll right-to-left automatically:
        // We decrease scrollLeft (make it more negative)
        scrollElement.scrollLeft -= 1; 

        const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
        
        // Loop back if reached the end
        if (Math.abs(scrollLeft) >= scrollWidth - clientWidth - 1) {
          scrollElement.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(performScroll);
    };

    animationFrameId = requestAnimationFrame(performScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, loading]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [allCategories.length]);

  const scroll = (direction: 'right' | 'left') => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Drag functionality variables
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setIsPaused(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => setIsPaused(false), 2000); // Resume auto-scroll after 2 seconds
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  if (loading && categories.length === 0) {
    return (
      <div className="py-16 bg-white flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <section 
      dir="rtl" 
      className="py-32 bg-white relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => !isDragging && setIsPaused(false)}
    >
      {/* Subtle Background Text */}
      <div className="absolute top-20 left-0 right-0 flex justify-center pointer-events-none -z-10 opacity-[0.03]">
        <span className="text-[20vw] font-black text-primary uppercase select-none font-serif tracking-tighter">Collections</span>
      </div>

      <div className="container mx-auto px-6 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-px bg-accent"></div>
            <span className="text-accent font-bold uppercase tracking-[0.4em] text-[10px]">اكتشف عالم يسلمو</span>
            <div className="w-12 h-px bg-accent"></div>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-primaryDark tracking-tighter mb-4">تصفح حسب الفئة</h2>
          <p className="text-gray-400 max-w-lg mx-auto text-sm font-medium">اخترنا لك الأفضل من مجموعاتنا المنسقة بعناية لتناسب كافة ذائقتك ومناسباتك السعيدة</p>
        </motion.div>
        
        {/* Navigation Buttons */}
        <div className="absolute top-1/2 -left-4 md:left-4 z-30 -translate-y-1/2 hidden lg:flex">
          <button 
            onClick={() => scroll('left')}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-2 border-white transition-all duration-300 ${canScrollLeft ? 'bg-primaryDark text-white hover:bg-accent hover:text-primaryDark hover:scale-110 opacity-100' : 'bg-gray-50 text-gray-200 opacity-0 pointer-events-none'}`}
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </button>
        </div>
        <div className="absolute top-1/2 -right-4 md:right-4 z-30 -translate-y-1/2 hidden lg:flex">
          <button 
            onClick={() => scroll('right')}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-2 border-white transition-all duration-300 ${canScrollRight ? 'bg-primaryDark text-white hover:bg-accent hover:text-primaryDark hover:scale-110 opacity-100' : 'bg-gray-50 text-gray-200 opacity-0 pointer-events-none'}`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex gap-8 md:gap-12 lg:gap-16 overflow-x-auto scrollbar-none py-8 cursor-grab active:cursor-grabbing select-none ${isDragging ? 'snap-none' : 'snap-x snap-mandatory'}`}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {allCategories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 15,
                delay: index * 0.05 
              }}
              className="flex-shrink-0 group flex flex-col items-center snap-center first:pr-4 last:pl-4 pointer-events-none"
            >
              <Link 
                to={category.slug === 'all' ? '/shop' : `/category/${category.slug}`} 
                className="relative pointer-events-auto"
                onClick={(e) => isDragging && e.preventDefault()}
              >
                {/* Main Circle Container */}
                <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full p-2 bg-white shadow-[0_15px_40px_-10px_rgba(0,0,0,0.08)] group-hover:shadow-[0_25px_60px_-15px_rgba(var(--primary),0.2)] transition-all duration-700 z-10">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-slate-50 relative">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    {/* Glass Overlay on Hover */}
                    <div className="absolute inset-0 bg-primaryDark/0 group-hover:bg-primaryDark/20 transition-colors duration-500" />
                  </div>

                  {/* Icon Indicator on Top */}
                  <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-accent text-primaryDark flex items-center justify-center shadow-lg border-2 border-white scale-0 group-hover:scale-100 transition-transform duration-500 z-20">
                    <ChevronLeft className="w-5 h-5 rotate-180" />
                  </div>
                </div>

                {/* Decorative Animated Ring */}
                <div className="absolute -inset-4 rounded-full border border-dashed border-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-[spin_20s_linear_infinite] pointer-events-none" />
                <div className="absolute -inset-2 rounded-full border border-primary/5 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
              </Link>

              <div className="mt-8 text-center flex flex-col items-center gap-2">
                <h3 className="text-lg md:text-xl font-black text-primaryDark group-hover:text-primary transition-colors duration-300 tracking-tight">
                  {category.name}
                </h3>
                <div className="w-0 group-hover:w-12 h-1 bg-accent rounded-full transition-all duration-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity duration-500 translate-y-2 group-hover:translate-y-0 transition-all">
                  استكشف الآن
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button - Bottom */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-20 flex justify-center"
        >
          <Link 
            to="/shop" 
            className="group flex flex-col items-center gap-4"
          >
            <div className="w-px h-16 bg-gradient-to-b from-gray-100 to-primary/20 group-hover:to-accent transition-colors duration-500" />
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.5em] group-hover:text-primary transition-colors">عرض كافة الأقسام</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryCircles;

