'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ProductMedia } from '@/types';
import { Maximize2, X, Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  media: ProductMedia[];
  productName: string;
  selectedSleeve?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  media,
  productName,
  selectedSleeve,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Dynamically prioritize media matching selected sleeve
  const activeMediaList = useMemo(() => {
    if (!media || media.length === 0) return [];

    const exactMatch = media.filter(
      (m) => !selectedSleeve || !m.variantSleeve || m.variantSleeve === 'All' || m.variantSleeve === selectedSleeve
    );

    if (exactMatch.length > 0) {
      const others = media.filter((m) => !exactMatch.includes(m));
      return [...exactMatch, ...others];
    }

    return media;
  }, [media, selectedSleeve]);

  // Reset index when sleeve style switches
  useEffect(() => {
    setSelectedIndex(0);
  }, [selectedSleeve]);

  const activeItem = activeMediaList[selectedIndex] || activeMediaList[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? activeMediaList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === activeMediaList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4 select-none">
      {/* Main Product Image Container */}
      <div className="relative w-full aspect-square sm:aspect-[4/4.2] md:aspect-square bg-dark-surface rounded-2xl overflow-hidden border border-dark-border flex items-center justify-center p-3 sm:p-5 group shadow-card">
        {activeItem?.type === 'video' ? (
          <div className="relative w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
            <video
              src={activeItem.url}
              controls
              className="w-full h-full object-contain"
              poster="/images/products/sleevless high.jpeg"
            />
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={activeItem?.url || '/images/products/sleevless high.jpeg'}
              alt={activeItem?.alt || productName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-contain object-center w-full h-full transition-opacity duration-300"
            />
          </div>
        )}

        {/* Media Title Badge */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
          {activeItem?.title && (
            <span className="bg-black/80 backdrop-blur-xs text-gold-400 border border-dark-border text-[10px] font-bold px-2.5 py-1 rounded shadow-xs uppercase tracking-wider">
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
            className="absolute top-3.5 right-3.5 p-2.5 bg-dark-card/90 hover:bg-dark-hover text-gray-200 hover:text-gold-400 rounded-xl border border-dark-border shadow-xs opacity-85 group-hover:opacity-100 transition-all hover:scale-105 z-10"
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
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-dark-card/90 hover:bg-dark-surface rounded-full flex items-center justify-center text-gray-200 hover:text-gold-400 border border-dark-border shadow-md transition-all active:scale-95 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-dark-card/90 hover:bg-dark-surface rounded-full flex items-center justify-center text-gray-200 hover:text-gold-400 border border-dark-border shadow-md transition-all active:scale-95 z-10"
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
              className={`relative w-20 h-20 sm:w-22 sm:h-22 flex-shrink-0 rounded-xl overflow-hidden border bg-dark-surface p-1 transition-all duration-200 ${
                selectedIndex === idx
                  ? 'border-gold-500 ring-2 ring-gold-500/30 shadow-glow-gold'
                  : 'border-dark-border opacity-70 hover:opacity-100 hover:border-dark-border-light'
              }`}
            >
              {item.type === 'video' ? (
                <div className="w-full h-full bg-dark-card rounded-lg flex flex-col items-center justify-center text-gold-400">
                  <Play className="w-4 h-4 fill-current" />
                  <span className="text-[9px] font-bold mt-0.5">Video</span>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={item.url}
                    alt={item.alt || `${productName} thumbnail ${idx + 1}`}
                    fill
                    sizes="90px"
                    className="object-contain object-center w-full h-full"
                  />
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal View */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 p-2.5 bg-dark-surface hover:bg-dark-hover text-gray-200 hover:text-gold-400 rounded-full border border-dark-border shadow-lg transition-transform hover:scale-105 z-50"
            aria-label="Close zoom"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="relative w-full max-w-4xl max-h-[85vh] aspect-square flex items-center justify-center">
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
