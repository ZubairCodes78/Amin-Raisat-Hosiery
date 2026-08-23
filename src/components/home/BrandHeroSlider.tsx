'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { HeroSlide } from '@/types';
import { INITIAL_HERO_SLIDES } from '@/data/initialData';

const DESKTOP_BANNER_WIDTH = 1920;
const DESKTOP_BANNER_HEIGHT = 800;
const MOBILE_BANNER_WIDTH = 1080;
const MOBILE_BANNER_HEIGHT = 1350;

export const BrandHeroSlider: React.FC = () => {
  const { heroSlides } = useStore();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Separate Desktop and Mobile slides
  const allSlides = heroSlides && heroSlides.length > 0 ? heroSlides : INITIAL_HERO_SLIDES;

  const desktopSlides: HeroSlide[] = useMemo(() => {
    const list = allSlides.filter(
      (s) => s.isActive !== false && (s.deviceType === 'desktop' || (!s.deviceType && !s.mobileImage?.includes('mobile')))
    );
    return list.length > 0
      ? list
      : INITIAL_HERO_SLIDES.filter((s) => s.deviceType === 'desktop');
  }, [allSlides]);

  const mobileSlides: HeroSlide[] = useMemo(() => {
    const list = allSlides.filter(
      (s) => s.isActive !== false && (s.deviceType === 'mobile' || s.desktopImage?.includes('mobile') || s.mobileImage?.includes('mobile'))
    );
    return list.length > 0
      ? list
      : INITIAL_HERO_SLIDES.filter((s) => s.deviceType === 'mobile');
  }, [allSlides]);

  const maxSlidesCount = Math.max(desktopSlides.length, mobileSlides.length, 1);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev >= maxSlidesCount - 1 ? 0 : prev + 1));
  }, [maxSlidesCount]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? maxSlidesCount - 1 : prev - 1));
  }, [maxSlidesCount]);

  // Premium slow auto-advance timer (5.5 seconds per slide)
  useEffect(() => {
    if (maxSlidesCount <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5500);

    return () => clearInterval(timer);
  }, [maxSlidesCount, isPaused, nextSlide]);

  // Touch Swipe Handlers for Mobile
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

  const activeDesktopSlide = desktopSlides[currentSlide % desktopSlides.length] || desktopSlides[0];
  const activeMobileSlide = mobileSlides[currentSlide % mobileSlides.length] || mobileSlides[0];

  return (
    <section
      aria-label="Amin Raisat Hosiery Campaign Banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full select-none bg-[#101114]"
    >
      {/* Container with responsive margins so rounded edges are visible and framed naturally */}
      <div className="mx-auto w-full md:w-[calc(100%-48px)] max-w-[1240px] px-3 sm:px-4 md:px-0 pt-2.5 sm:pt-3 md:pt-4 pb-2 md:pb-3">
        
        {/* ========================================================================= */}
        {/* 1. DESKTOP HERO VIEWPORT (Hidden on mobile < md) */}
        {/* ========================================================================= */}
        <div className="hidden md:block relative w-full rounded-2xl lg:rounded-[20px] overflow-hidden border border-[#30343A]/70 shadow-elevation bg-[#17191D]">
          {/* Invisible natural aspect sizer ensuring 0px Cumulative Layout Shift (CLS) */}
          <Image
            src={activeDesktopSlide.desktopImage || '/slider 1.png'}
            alt=""
            aria-hidden
            width={DESKTOP_BANNER_WIDTH}
            height={DESKTOP_BANNER_HEIGHT}
            sizes="(max-width: 1280px) 100vw, 1240px"
            className="block w-full h-auto invisible pointer-events-none"
            priority
          />

          {desktopSlides.map((slide, idx) => {
            const isCurrent = (currentSlide % desktopSlides.length) === idx;
            const imageSrc = slide.desktopImage || `/slider ${idx + 1}.png`;

            return (
              <div
                key={slide.id || `desktop-${idx}`}
                aria-hidden={!isCurrent}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out overflow-hidden ${
                  isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <Link
                  href={slide.link || slide.buttonLink || '/shop'}
                  className="block w-full h-full cursor-pointer overflow-hidden rounded-2xl lg:rounded-[20px]"
                >
                  <Image
                    src={imageSrc}
                    alt={slide.title || `Amin Raisat Hosiery Campaign ${idx + 1}`}
                    fill
                    priority={idx === 0}
                    sizes="(max-width: 1280px) 100vw, 1240px"
                    className="object-cover w-full h-full rounded-2xl lg:rounded-[20px]"
                  />
                </Link>
              </div>
            );
          })}

          {/* Desktop Slide Indicator Dots */}
          {desktopSlides.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-[#101114]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#30343A]">
              {desktopSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    (currentSlide % desktopSlides.length) === idx
                      ? 'w-8 bg-[#C9A96A] shadow-xs'
                      : 'w-2 bg-[#85888E]/50 hover:bg-[#F1F0EC]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 2. MOBILE HERO VIEWPORT (Visible on mobile < md) */}
        {/* ========================================================================= */}
        <div className="block md:hidden relative w-full rounded-xl sm:rounded-2xl overflow-hidden border border-[#30343A]/70 shadow-card bg-[#17191D]">
          {/* Invisible natural mobile aspect sizer ensuring 0px Cumulative Layout Shift (CLS) */}
          <Image
            src={activeMobileSlide.mobileImage || activeMobileSlide.desktopImage || '/mobile slider 1.png'}
            alt=""
            aria-hidden
            width={MOBILE_BANNER_WIDTH}
            height={MOBILE_BANNER_HEIGHT}
            sizes="100vw"
            className="block w-full h-auto invisible pointer-events-none"
            priority
          />

          {mobileSlides.map((slide, idx) => {
            const isCurrent = (currentSlide % mobileSlides.length) === idx;
            const imageSrc = slide.mobileImage || slide.desktopImage || `/mobile slider ${idx + 1}.png`;

            return (
              <div
                key={slide.id || `mobile-${idx}`}
                aria-hidden={!isCurrent}
                className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out overflow-hidden ${
                  isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                <Link
                  href={slide.link || slide.buttonLink || '/shop'}
                  className="block w-full h-full cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl"
                >
                  <Image
                    src={imageSrc}
                    alt={slide.title || `Amin Raisat Hosiery Mobile Banner ${idx + 1}`}
                    fill
                    priority={idx === 0}
                    sizes="100vw"
                    className="object-cover w-full h-full rounded-xl sm:rounded-2xl"
                  />
                </Link>
              </div>
            );
          })}

          {/* Mobile Slide Indicator Dots */}
          {mobileSlides.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-[#101114]/80 backdrop-blur-md px-3 py-1 rounded-full border border-[#30343A]">
              {mobileSlides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlide(idx)}
                  aria-label={`Go to mobile slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    (currentSlide % mobileSlides.length) === idx
                      ? 'w-6 bg-[#C9A96A] shadow-xs'
                      : 'w-1.5 bg-[#85888E]/50 hover:bg-[#F1F0EC]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </section>
  );
};
