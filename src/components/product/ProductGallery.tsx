'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { ProductMedia } from '@/types';
import { Maximize2, X, Play, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  media: ProductMedia[];
  productName: string;
  selectedQuality?: string;
  selectedSleeve?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  media,
  productName,
  selectedQuality,
  selectedSleeve,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  // Dynamically prioritize/filter media matching selected variant quality and sleeve
  const activeMediaList = useMemo(() => {
    if (!media || media.length === 0) return [];

    // Find exact match for quality + sleeve
    const exactMatch = media.filter(
      (m) =>
        (!selectedQuality || !m.variantQuality || m.variantQuality === 'All' || m.variantQuality === selectedQuality) &&
        (!selectedSleeve || !m.variantSleeve || m.variantSleeve === 'All' || m.variantSleeve === selectedSleeve)
    );

    if (exactMatch.length > 0) {
      const others = media.filter((m) => !exactMatch.includes(m));
      return [...exactMatch, ...others];
    }

    return media;
  }, [media, selectedQuality, selectedSleeve]);

  // Reset to first matching photo whenever user switches quality or sleeve
  useEffect(() => {
    setSelectedIndex(0);
  }, [selectedQuality, selectedSleeve]);

  const activeItem = activeMediaList[selectedIndex] || activeMediaList[0];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev === 0 ? activeMediaList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === activeMediaList.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4 select-none">
      {/* 
        Main Product Image Container:
        - Large, prominent, and clearly visible
        - object-contain ensures complete source image (model, vest, packaging) is visible with 0 cropping
        - No zoom distortion on hover
      */}
      <div className="relative w-full aspect-square sm:aspect-[4/4.2] md:aspect-square bg-gray-50/90 rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center p-2 sm:p-4 group">
        {activeItem?.type === 'video' ? (
          <div className="relative w-full h-full flex items-center justify-center bg-gray-950 rounded-xl overflow-hidden">
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
            <span className="bg-gray-950/90 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded shadow-xs">
              {activeItem.title}
            </span>
          )}
          {activeItem?.type === 'video' && (
            <span className="bg-red-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded flex items-center gap-1 shadow-xs">
              <Play className="w-3 h-3 fill-current" /> Video Demo
            </span>
          )}
        </div>

        {/* Fullscreen Enlarge Trigger */}
        {activeItem?.type === 'photo' && (
          <button
            type="button"
            onClick={() => setIsZoomOpen(true)}
            className="absolute top-3.5 right-3.5 p-2.5 bg-white/90 hover:bg-white text-gray-900 rounded-xl border border-gray-200 shadow-sm opacity-85 group-hover:opacity-100 transition-all hover:scale-105 z-10"
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
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-900 border border-gray-200 shadow-md transition-all active:scale-95 z-10"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-900 border border-gray-200 shadow-md transition-all active:scale-95 z-10"
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
              className={`relative w-18 h-18 sm:w-20 sm:h-20 flex-shrink-0 rounded-xl overflow-hidden border bg-gray-50 p-1 transition-all duration-200 ${
                selectedIndex === idx
                  ? 'border-gray-950 ring-2 ring-gray-950 shadow-sm'
                  : 'border-gray-200 opacity-75 hover:opacity-100 hover:border-gray-400'
              }`}
            >
              {item.type === 'video' ? (
                <div className="w-full h-full bg-gray-900 rounded-lg flex flex-col items-center justify-center text-white">
                  <Play className="w-4 h-4 fill-current text-white" />
                  <span className="text-[9px] font-semibold mt-0.5">Video</span>
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <Image
                    src={item.url}
                    alt={item.alt || `${productName} thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
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
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 p-2.5 bg-white/90 hover:bg-white text-gray-950 rounded-full shadow-lg transition-transform hover:scale-105 z-50"
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
