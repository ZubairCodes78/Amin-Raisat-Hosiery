'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { ProductMedia } from '@/types';
import { Maximize2, X, Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  media: ProductMedia[];
  productName: string;
  selectedSleeve?: string;
  videoUrl?: string;
}

function getEmbedVideoUrl(url?: string): { isEmbed: boolean; embedUrl: string } {
  if (!url) return { isEmbed: false, embedUrl: '' };
  // YouTube watch URL or short link
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch && ytMatch[1]) {
    return { isEmbed: true, embedUrl: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?autoplay=1&rel=0` };
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) {
    return { isEmbed: true, embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
  }
  return { isEmbed: false, embedUrl: url };
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  media,
  productName,
  selectedSleeve,
  videoUrl,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Dynamically prioritize media matching selected sleeve and merge videoUrl
  const activeMediaList = useMemo(() => {
    let list: ProductMedia[] = media ? [...media] : [];

    // If videoUrl prop exists and isn't in media list yet, add it
    if (videoUrl && !list.some((m) => m.type === 'video' || m.url === videoUrl)) {
      list.push({
        id: 'product-video-prop',
        productId: '',
        type: 'video',
        url: videoUrl,
        title: 'Product Video Demo',
      });
    }

    if (list.length === 0) return [];

    const exactMatch = list.filter(
      (m) => !selectedSleeve || !m.variantSleeve || m.variantSleeve === 'All' || m.variantSleeve === selectedSleeve || m.type === 'video'
    );

    if (exactMatch.length > 0) {
      const others = list.filter((m) => !exactMatch.includes(m));
      return [...exactMatch, ...others];
    }

    return list;
  }, [media, selectedSleeve, videoUrl]);

  // Support ?video=1 query parameter from product card "Watch Video" button
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('video') === '1' || params.get('watchVideo') === 'true') {
        const videoIdx = activeMediaList.findIndex((m) => m.type === 'video');
        if (videoIdx !== -1) {
          setSelectedIndex(videoIdx);
        }
      }
    }
  }, [activeMediaList]);

  // Reset index when sleeve style switches (only if not on video)
  useEffect(() => {
    if (activeMediaList[selectedIndex]?.type !== 'video') {
      setSelectedIndex(0);
    }
  }, [selectedSleeve]);

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? activeMediaList.length - 1 : prev - 1));
  }, [activeMediaList.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === activeMediaList.length - 1 ? 0 : prev + 1));
  }, [activeMediaList.length]);

  // Keyboard: arrow keys for gallery navigation, Escape to close zoom
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isZoomOpen) {
        setIsZoomOpen(false);
        return;
      }
      if (!isZoomOpen) {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isZoomOpen, handlePrev, handleNext]);

  // Lock body scroll while zoom modal is open
  useEffect(() => {
    if (isZoomOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isZoomOpen]);

  const activeItem = activeMediaList[selectedIndex] || activeMediaList[0];
  const videoDetails = activeItem?.type === 'video' ? getEmbedVideoUrl(activeItem.url) : null;

  return (
    <div className="w-full space-y-4 select-none">
      {/* Main Full-Width Product Image Container */}
      <div className="relative w-full aspect-square sm:aspect-[4/4.2] md:aspect-square bg-light-elevated dark:bg-[#22211E] rounded-2xl overflow-hidden border border-light-border dark:border-[#34322D] flex items-center justify-center p-2 sm:p-4 group shadow-sm dark:shadow-card">
        {activeItem?.type === 'video' ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
            {videoDetails?.isEmbed ? (
              <iframe
                src={videoDetails.embedUrl}
                title="Product Video"
                className="w-full h-full border-0 rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video
                src={activeItem.url}
                controls
                autoPlay
                className="w-full h-full object-contain"
                poster="/images/products/sleevless high.jpeg"
              />
            )}
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={activeItem?.url || '/images/products/sleevless high.jpeg'}
              alt={activeItem?.alt || productName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 650px"
              className="object-contain object-center w-full h-full transition-opacity duration-300"
            />
          </div>
        )}

        {/* Media Title Badge */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
          {activeItem?.title && (
            <span className="bg-charcoal-900/85 dark:bg-black/80 backdrop-blur-xs text-champagne-400 dark:text-[#C9A96A] border border-charcoal-700 dark:border-[#34322D] text-[10px] font-bold px-2.5 py-1 rounded shadow-xs uppercase tracking-wider">
              {activeItem.title}
            </span>
          )}
          {activeItem?.type === 'video' && (
            <span className="bg-rose-600 text-white text-[10px] font-bold px-2.5 py-1 rounded flex items-center gap-1 shadow-xs">
              <Play className="w-3 h-3 fill-current" /> Video Demo
            </span>
          )}
        </div>

        {/* Fullscreen Enlarge Trigger */}
        {activeItem?.type === 'photo' && (
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="absolute top-3.5 right-3.5 p-2.5 bg-white/90 dark:bg-[#22211E]/90 hover:bg-light-hover dark:hover:bg-[#2A2925] text-charcoal-700 dark:text-[#D7D7D4] hover:text-[#B89555] dark:hover:text-[#C9A96A] rounded-xl border border-light-border dark:border-[#34322D] shadow-xs opacity-85 group-hover:opacity-100 transition-all hover:scale-105 z-10"
            aria-label="Enlarge image"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}

        {/* Prev / Next Carousel Arrows */}
        {activeMediaList.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 dark:bg-[#22211E]/90 hover:bg-light-hover dark:hover:bg-[#2A2925] rounded-full flex items-center justify-center text-charcoal-700 dark:text-[#D7D7D4] hover:text-[#B89555] dark:hover:text-[#C9A96A] border border-light-border dark:border-[#34322D] shadow-sm transition-all active:scale-95 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 dark:bg-[#22211E]/90 hover:bg-light-hover dark:hover:bg-[#2A2925] rounded-full flex items-center justify-center text-charcoal-700 dark:text-[#D7D7D4] hover:text-[#B89555] dark:hover:text-[#C9A96A] border border-light-border dark:border-[#34322D] shadow-sm transition-all active:scale-95 z-10"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails Navigation */}
      {activeMediaList.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {activeMediaList.map((item, idx) => (
            <button
              key={item.id || idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-20 sm:w-22 sm:h-22 flex-shrink-0 rounded-xl overflow-hidden border bg-light-elevated dark:bg-[#22211E] p-1 transition-all duration-200 ${
                selectedIndex === idx
                  ? 'border-[#B89555] dark:border-[#C9A96A] ring-2 ring-[#B89555]/30 dark:ring-[#C9A96A]/30 shadow-xs'
                  : 'border-light-border dark:border-[#34322D] opacity-70 hover:opacity-100 hover:border-[#B89555]/40 dark:hover:border-[#C9A96A]/40'
              }`}
            >
              {item.type === 'video' ? (
                <div className="w-full h-full bg-light-hover dark:bg-[#2A2925] rounded-lg flex flex-col items-center justify-center text-[#B89555] dark:text-[#C9A96A]">
                  <Play className="w-4 h-4 fill-current" />
                  <span className="text-[9px] font-bold mt-0.5">Video</span>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={item.url}
                    alt={item.alt || `${productName} thumbnail ${idx + 1}`}
                    fill
                    loading="lazy"
                    sizes="90px"
                    quality={75}
                    className="object-contain object-center w-full h-full"
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Zoom Modal — click backdrop or press Escape to close */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-5 right-5 p-2.5 bg-charcoal-800/90 hover:bg-charcoal-700 text-charcoal-200 hover:text-[#C9A96A] rounded-full border border-charcoal-600 shadow-lg transition-transform hover:scale-105 z-50"
            aria-label="Close zoom"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            className="relative w-full max-w-4xl max-h-[85vh] aspect-square flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={activeItem?.url || '/images/products/sleevless high.jpeg'}
              alt={activeItem?.alt || productName}
              fill
              className="object-contain object-center"
            />
          </div>
        </div>
      )}
    </div>
  );
};

