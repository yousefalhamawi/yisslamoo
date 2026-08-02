
import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStableListKey } from '../../utils/stableListKey';
import { useCategories } from '../../hooks/useCategories';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/** سرعة التمرير التلقائي بالبكسل لكل إطار */
const SPEED = 0.6;
/** معامل التنعيم عند الضغط على أسهم التنقل */
const EASE = 0.12;

const CategoryCircles: React.FC = () => {
  const { categories, loading } = useCategories();

  const scrollRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);

  // حالة الحركة في refs لا في state: حلقة requestAnimationFrame تقرأها كل إطار،
  // ولو كانت state لالتقطت قيماً قديمة من الإغلاق (stale closure).
  const periodRef = useRef(0); // عرض نسخة واحدة من القائمة = طول الدورة
  const pausedRef = useRef(false);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollRef = useRef(0);
  const targetRef = useRef<number | null>(null); // هدف مؤقت عند الضغط على سهم
  const readyRef = useRef(false);
  const resumeTimerRef = useRef<number | null>(null);

  const [isDragging, setIsDragging] = useState(false); // للمؤشر فقط
  const [copies, setCopies] = useState(3);

  const allCategories = categories.filter(c => c.status === 'active' && !c.parent_id);
  const hasItems = allCategories.length > 0;

  /**
   * قياس طول الدورة وعدد النسخ المطلوبة.
   *
   * الشريط يتكوّن من عدة نسخ متطابقة، والموضع يبقى محصوراً داخل النسخة الوسطى.
   * عند تجاوز الحد نزيح الموضع بمقدار دورة كاملة — والمحتوى عند الموضعين متطابق
   * تماماً فلا تُرى أي قفزة، بخلاف الرجوع إلى الصفر الذي كان يُحدث الوثبة.
   *
   * نحتاج (copies - 2) × period ≥ عرض الإطار حتى يكون الحدّان قابلين للوصول
   * فعلاً قبل أن يقصّ المتصفح قيمة scrollLeft.
   */
  useLayoutEffect(() => {
    const el = scrollRef.current;
    const set = setRef.current;
    if (!el || !set || !hasItems) return;

    const measure = () => {
      const period = set.offsetWidth;
      if (period <= 0) return;
      periodRef.current = period;

      const needed = Math.max(3, Math.ceil(el.clientWidth / period) + 2);
      if (needed !== copies) {
        setCopies(needed);
        return; // سنقيس مجدداً بعد إعادة الرسم
      }

      if (!readyRef.current) {
        el.scrollLeft = -period; // البداية في النسخة الوسطى
        readyRef.current = true;
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(set);
    return () => observer.disconnect();
  }, [copies, hasItems, allCategories.length]);

  // حلقة الحركة: تمرير تلقائي + تنعيم الأسهم + اللف اللانهائي
  useEffect(() => {
    if (!hasItems || loading) return;

    const reduceMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    let frame: number;

    const step = () => {
      const el = scrollRef.current;
      if (el) {
        if (targetRef.current !== null) {
          const diff = targetRef.current - el.scrollLeft;
          if (Math.abs(diff) < 0.5) {
            el.scrollLeft = targetRef.current;
            targetRef.current = null;
          } else {
            el.scrollLeft += diff * EASE;
          }
        } else if (!pausedRef.current && !draggingRef.current && !reduceMotion) {
          el.scrollLeft -= SPEED;
        }

        // اللف: نُبقي الموضع داخل [-2×period, -period]
        const period = periodRef.current;
        if (period > 0 && readyRef.current) {
          let shift = 0;
          if (el.scrollLeft < -2 * period) shift = period;
          else if (el.scrollLeft > -period) shift = -period;

          if (shift !== 0) {
            el.scrollLeft += shift;
            // الهدف ومرجع السحب يُزاحان معاً وإلا انقطعت الحركة عند حدود اللف
            if (targetRef.current !== null) targetRef.current += shift;
            dragStartScrollRef.current += shift;
          }
        }
      }
      frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [hasItems, loading]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const resumeAfter = (ms: number) => {
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, ms);
  };

  /** نقلة بالأسهم — هدف يُنعَّم داخل الحلقة بدل scrollBy، حتى لا يفسدها اللف */
  const nudge = (direction: 'right' | 'left') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.6;
    const base = targetRef.current ?? el.scrollLeft;
    targetRef.current = base + (direction === 'left' ? -amount : amount);
    pausedRef.current = true;
    resumeAfter(1500);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    draggingRef.current = true;
    pausedRef.current = true;
    targetRef.current = null;
    setIsDragging(true);
    dragStartXRef.current = e.pageX;
    dragStartScrollRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseUp = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setIsDragging(false);
    resumeAfter(2000);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingRef.current || !scrollRef.current) return;
    e.preventDefault();
    const walk = (e.pageX - dragStartXRef.current) * 2;
    scrollRef.current.scrollLeft = dragStartScrollRef.current - walk;
  };

  // اللمس يمرّر أصلاً عبر overflow-x-auto — نوقف التمرير التلقائي فقط كي لا يتنازعا
  const handleTouchStart = () => {
    pausedRef.current = true;
    targetRef.current = null;
    if (resumeTimerRef.current) window.clearTimeout(resumeTimerRef.current);
  };
  const handleTouchEnd = () => resumeAfter(2000);

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

  if (!hasItems) return null;

  // المسافة بين البطاقات كهامش على البطاقة نفسها لا كـgap على الحاوية،
  // فيصبح عرض النسخة الواحدة مساوياً لطول الدورة بالضبط بلا حساب فجوات.
  const renderSet = (copyIndex: number, ref?: React.Ref<HTMLDivElement>) => (
    <div key={copyIndex} ref={ref} className="flex flex-shrink-0" aria-hidden={copyIndex > 0}>
      {allCategories.map((category, index) => (
        <Link
          key={getStableListKey(category.id, category.slug, 'category', index)}
          to={category.slug === 'all' ? '/shop' : `/category/${category.slug}`}
          onClick={(e) => isDragging && e.preventDefault()}
          tabIndex={copyIndex > 0 ? -1 : undefined}
          className="flex-shrink-0 flex flex-col items-center gap-2.5 group pointer-events-auto me-3 md:me-4"
        >
          {/* Card */}
          <div className="relative w-[130px] md:w-[210px] aspect-square rounded-[20px] overflow-hidden bg-[#EFF3F8] transition-all duration-300 group-hover:shadow-md group-hover:-translate-y-1">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              referrerPolicy="no-referrer"
              loading="lazy"
              draggable={false}
            />
          </div>

          {/* Label */}
          <span className="text-center text-[13px] md:text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors leading-tight max-w-[130px] md:max-w-[150px]">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );

  return (
    <section
      dir="rtl"
      className="py-10 bg-white relative"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { if (!draggingRef.current) pausedRef.current = false; }}
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => nudge('left')}
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
            onClick={() => nudge('left')}
            aria-label="التالي"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-20 w-9 h-9 bg-white rounded-full shadow-md border border-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:shadow-lg transition-all hidden md:flex"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => nudge('right')}
            aria-label="السابق"
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
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`flex overflow-x-auto scrollbar-none py-2 px-1 ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {Array.from({ length: copies }, (_, i) =>
              renderSet(i, i === 0 ? setRef : undefined),
            )}
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
