'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { HeroSlide } from '@/types';
import { INITIAL_HERO_SLIDES } from '@/data/initialData';

export const BrandHeroSlider: React.FC = () => {
  const { heroSlides } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Active slides list (fallback to the 2 exact initial slider images)
  const slides: HeroSlide[] = React.useMemo(() => {
    const list = (heroSlides && heroSlides.length > 0 ? heroSlides : INITIAL_HERO_SLIDES).filter(
      (s) => s.isActive !== false
    );
    return list.length > 0 ? list : INITIAL_HERO_SLIDES;
  }, [heroSlides]);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev >= totalSlides - 1 ? 0 : prev + 1));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  }, [totalSlides]);

  // Auto-advance timer (2 seconds, pauses when hovered or touched)
  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 2000);

    return () => clearInterval(timer);
  }, [totalSlides, isPaused, nextSlide]);

  // Handle mobile swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      aria-label="Amin Raisat Hosiery Campaign Banner Slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full overflow-hidden bg-gray-950 select-none flex items-center justify-center border-b border-gray-900 shadow-xs"
    >
      {/* 
        Responsive Proportional Container:
        - Full-width hero banner with responsive aspect ratios
        - Mobile: Full height for better mobile experience
        - Uses object-cover for proper hero banner fit
      */}
      <div className="relative w-full max-w-[1920px] mx-auto h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[600px] flex items-center justify-center">
        {slides.map((slide, idx) => {
          const isCurrent = currentSlide === idx;
          const imageSrc = slide.desktopImage || slide.mobileImage || `/images/slider ${idx + 1}.png`;

          return (
            <div
              key={slide.id || idx}
              aria-hidden={!isCurrent}
              className={`absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-700 ease-in-out ${
                isCurrent
                  ? 'opacity-100 scale-100 z-10 pointer-events-auto'
                  : 'opacity-0 scale-[1.01] z-0 pointer-events-none'
              }`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={imageSrc}
                  alt={slide.title || `Amin Raisat Hosiery Campaign Banner ${idx + 1}`}
                  fill
                  priority={idx === 0}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 100vw"
                  className="object-cover object-center w-full h-full"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pill Indicator Dots */}
      {totalSlides > 1 && (
        <div className="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/40 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/15">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                currentSlide === idx
                  ? 'w-7 sm:w-9 bg-white shadow-xs'
                  : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};
