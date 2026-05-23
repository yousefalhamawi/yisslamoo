
import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategoryCircles: React.FC = () => {
  const { categories, loading } = useCategories();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftPos, setScrollLeftPos] = useState(0);

  const allCategories = categories.filter(c => c.status === 'active' && !c.parent_id);

  // Auto-scroll effect
  useEffect(() => {
    let animationFrameId: number;
    const scrollElement = scrollRef.current;
    if (!scrollElement || loading || allCategories.length === 0) return;

    const performScroll = () => {
      if (!isPaused && scrollElement) {
        scrollElement.scrollLeft -= 0.6;
        const { scrollLeft, scrollWidth, clientWidth } = scrollElement;
        if (Math.abs(scrollLeft) >= scrollWidth - clientWidth - 1) {
          scrollElement.scrollLeft = 0;
        }
      }
      animationFrameId = requestAnimationFrame(performScroll);
    };

    animationFrameId = requestAnimationFrame(performScroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, loading, allCategories.length]);

  const scroll = (direction: 'right' | 'left') => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.6;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -amount : amount,
        behavior: 'smooth'
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setIsPaused(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeftPos(scrollRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setTimeout(() => setIsPaused(false), 2000);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeftPos - walk;
  };

  if (loading && categories.length === 0) {
    return (
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex gap-4 overflow-hidden">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex-shrink-0 w-[130px] animate-pulse">
                <div className="w-full aspect-square bg-gray-100 rounded-2xl mb-3" />
                <div className="h-3 bg-gray-100 rounded-full w-3/4 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (allCategories.length === 0) return null;

  return (
    <section
      dir="rtl"
      className="py-10 bg-white relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { if (!isDragging) setIsPaused(false); }}
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => scroll('left')}
            className="text-sm font-bold text-slate-600 border border-slate-200 rounded-full px-4 py-1.5 hover:bg-slate-50 transition-colors flex items-center gap-1"
          >
            عرض الكل
          </button>

          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">تصفح حسب الفئة</h2>
          </div>
        </div>

        {/* Scroll Wrapper */}
        <div className="relative">
          {/* Left Arrow */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-9 h-9 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-lg transition-all hidden md:flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-20 w-9 h-9 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-lg transition-all hidden md:flex"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Scrollable Cards */}
          <div
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`flex gap-3 md:gap-4 overflow-x-auto scrollbar-none py-2 px-1 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {allCategories.map((category) => (
              <Link
                key={category.slug}
                to={category.slug === 'all' ? '/shop' : `/category/${category.slug}`}
                onClick={(e) => isDragging && e.preventDefault()}
                className="flex-shrink-0 flex flex-col items-center gap-2.5 group pointer-events-auto"
              >
                {/* Card */}
                <div className="relative w-[130px] md:w-[210px] aspect-square rounded-[20px] overflow-hidden bg-[#EFF3F8] transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                </div>

                {/* Label */}
                <span className="text-center text-[13px] md:text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors leading-tight max-w-[130px] md:max-w-[150px]">
                  {category.name}
                </span>
              </Link>
            ))}

            {/* Spacer at end */}
            <div className="flex-shrink-0 w-2" />
          </div>

          {/* Edge fade left */}
          <div className="pointer-events-none absolute top-0 left-0 h-full w-12 bg-gradient-to-r from-white to-transparent z-10 hidden md:block" />
          {/* Edge fade right */}
          <div className="pointer-events-none absolute top-0 right-0 h-full w-12 bg-gradient-to-l from-white to-transparent z-10 hidden md:block" />
        </div>
      </div>
    </section>
  );
};

export default CategoryCircles;
