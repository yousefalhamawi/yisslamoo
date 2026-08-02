import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, ShoppingBag } from 'lucide-react';
import { useHeroSlides } from '../../hooks/useHeroSlides';

const Hero: React.FC = () => {
  // فشل السلايدر لا يمنع التسوّق — نخفيه بصمت بدل إظهار خطأ للزائر
  const { heroSlides, loading } = useHeroSlides({ silentLoadErrors: true });
  const slides = heroSlides || [];
  const [currentSlide, setCurrentSlide] = useState(0);

  // Maps position key -> mobile (sm) responsive tailwind classes
  const getMobileClasses = (pos?: string) => {
    switch (pos) {
      case 'top-right':    return 'justify-start items-start text-right';
      case 'top-center':   return 'justify-start items-center text-center';
      case 'top-left':     return 'justify-start items-end text-left';
      case 'center':       return 'justify-center items-center text-center';
      case 'center-left':  return 'justify-center items-end text-left';
      case 'bottom-right': return 'justify-end items-start text-right';
      case 'bottom-center':return 'justify-end items-center text-center';
      case 'bottom-left':  return 'justify-end items-end text-left';
      case 'center-right':
      default:             return 'justify-center items-start text-right';
    }
  };

  // Maps position key -> desktop (md+) responsive tailwind classes
  const getDesktopClasses = (pos?: string) => {
    switch (pos) {
      case 'top-right':    return 'md:justify-start md:items-start md:text-right';
      case 'top-center':   return 'md:justify-start md:items-center md:text-center';
      case 'top-left':     return 'md:justify-start md:items-end md:text-left';
      case 'center':       return 'md:justify-center md:items-center md:text-center';
      case 'center-left':  return 'md:justify-center md:items-end md:text-left';
      case 'bottom-right': return 'md:justify-end md:items-start md:text-right';
      case 'bottom-center':return 'md:justify-end md:items-center md:text-center';
      case 'bottom-left':  return 'md:justify-end md:items-end md:text-left';
      case 'center-right':
      default:             return 'md:justify-center md:items-start md:text-right';
    }
  };

  // Auto-advance slides
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // يجب أن يأتي الشرط بعد جميع Hooks حتى يبقى ترتيبها ثابتاً بين عمليات العرض.
  if (loading && slides.length === 0) {
    return (
      <section className="w-full pt-36 md:pt-40 pb-10 px-4 md:px-10 bg-white" dir="rtl" aria-busy="true">
        <div className="w-full max-w-[1600px] mx-auto h-[400px] md:h-[500px] lg:h-[600px] rounded-[30px] bg-primary/[0.04] animate-pulse" />
      </section>
    );
  }

  if (slides.length === 0) return null;

  const nextSlide = () => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length <= 1) return;
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <section className="w-full pt-36 md:pt-40 pb-10 px-4 md:px-10 bg-white" dir="rtl">
      <div className="relative w-full max-w-[1600px] mx-auto h-[400px] md:h-[500px] lg:h-[600px] rounded-[30px] overflow-hidden group">
        
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            } ${slide.bgColor}`}
          >
            {/* Full Width Image Background */}
            <div className="absolute inset-0 w-full h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
                loading={index === currentSlide ? 'eager' : 'lazy'}
                fetchPriority={index === currentSlide ? 'high' : 'auto'}
              />
              {/* Optional slight gradient overlay for text readability if needed */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/40 md:to-white/60"></div>
            </div>

            {/* Text Content Overlay */}
            <div className={`relative z-10 w-full h-full flex flex-col px-10 md:px-24 lg:px-40 py-16 md:py-24 ${getMobileClasses(slide.mobileTextPosition || slide.textPosition)} ${getDesktopClasses(slide.textPosition)}`}>
              <h1 
                className="text-5xl md:text-7xl lg:text-8xl font-black mb-4 tracking-tighter drop-shadow-sm max-w-4xl"
                style={{ color: slide.titleColor || '#0f172a' }}
              >
                {slide.title}
              </h1>
              <p 
                className="text-lg md:text-xl mb-8 max-w-md font-bold leading-relaxed drop-shadow-sm"
                style={{ color: slide.subtitleColor || '#1e293b' }}
              >
                {slide.subtitle}
              </p>
              
              <Link
                to={slide.link}
                className="flex items-center gap-2 bg-[#1A1A1A] text-white px-8 py-3.5 rounded-xl hover:bg-black hover:scale-105 transition-all duration-300 shadow-xl shadow-black/20 font-bold"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>{slide.buttonText || 'تصفح المجموعة'}</span>
              </Link>
            </div>
          </div>
        ))}

        {slides.length > 1 && (
          <>
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              className="absolute top-1/2 right-4 md:right-8 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg text-slate-800 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute top-1/2 left-4 md:left-8 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg text-slate-800 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-slate-800 w-8' : 'bg-slate-400/50 hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default Hero;
