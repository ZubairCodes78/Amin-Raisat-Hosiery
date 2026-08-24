'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';
import { Sparkles, Truck, ShieldCheck, PackageCheck, Headphones, ArrowRight, Filter, Search } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export default function WholesalePage() {
  const { products, categories, settings } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter wholesale-enabled products dynamically from database
  const wholesaleProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isPublished || p.isWholesaleEnabled === false) return false;

      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCat =
          p.categoryId === selectedCategory ||
          (selectedCategory === 'men' && (p.categoryId === 'cat-men' || !p.categoryId));
        if (!matchesCat) return false;
      }

      // Quality filter
      if (selectedQuality !== 'all') {
        const hasQuality = p.variants.some((v) => v.quality.toLowerCase().includes(selectedQuality.toLowerCase()));
        if (!hasQuality) return false;
      }

      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
        if (!matchesName) return false;
      }

      return true;
    });
  }, [products, selectedCategory, selectedQuality, searchQuery]);

  const whatsappInquiryUrl = `https://wa.me/92${settings.whatsapp.replace(/^0/, '').replace(/[\s-]/g, '')}?text=${encodeURIComponent(
    'Hello Amin Raisat Hosiery! I am interested in placing a custom bulk/wholesale order for cotton vests. Please share wholesale details.'
  )}`;

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-charcoal-900 dark:text-[#F1F0EC] transition-colors duration-200">
      {/* 1. Wholesale Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-champagne-100/60 via-light-elevated to-light-bg dark:from-[#17191D] dark:via-[#14161A] dark:to-dark-bg border-b border-light-border dark:border-[#30343A] py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C9A96A]/20 border border-[#C9A96A]/40 text-[#A07D38] dark:text-[#C9A96A] text-xs font-extrabold uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>Factory-Direct B2B Commercial Store</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-charcoal-900 dark:text-[#F1F0EC] max-w-3xl mx-auto leading-tight">
            Wholesale Men&apos;s Cotton Vests &amp; Innerwear
          </h1>

          <p className="text-sm sm:text-base text-charcoal-600 dark:text-[#B4B5BA] max-w-2xl mx-auto font-normal leading-relaxed">
            Order in bulk directly from the factory. Save 15%–27% with dozen packs (minimum 12 pieces) and enjoy 100% Free Nationwide Delivery across Pakistan.
          </p>

          {/* Wholesale Highlights Strip */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] shadow-xs">
              <PackageCheck className="w-5 h-5 text-[#A07D38] dark:text-[#C9A96A] mb-1.5" />
              <div className="font-bold text-xs text-charcoal-900 dark:text-gray-100">Min 12 Pieces</div>
              <div className="text-[11px] text-charcoal-500 dark:text-gray-400">1 Dozen Master Packs</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] shadow-xs">
              <Truck className="w-5 h-5 text-[#A07D38] dark:text-[#C9A96A] mb-1.5" />
              <div className="font-bold text-xs text-charcoal-900 dark:text-gray-100">100% Free Delivery</div>
              <div className="text-[11px] text-charcoal-500 dark:text-gray-400">Nationwide across Pakistan</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#A07D38] dark:text-[#C9A96A] mb-1.5" />
              <div className="font-bold text-xs text-charcoal-900 dark:text-gray-100">Combed Cotton</div>
              <div className="text-[11px] text-charcoal-500 dark:text-gray-400">Strict Quality Inspection</div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] shadow-xs">
              <Headphones className="w-5 h-5 text-[#A07D38] dark:text-[#C9A96A] mb-1.5" />
              <div className="font-bold text-xs text-charcoal-900 dark:text-gray-100">B2B Support</div>
              <div className="text-[11px] text-charcoal-500 dark:text-gray-400">WhatsApp &amp; Phone desk</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filter & Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-light-elevated dark:bg-[#17191D] border border-light-border dark:border-[#30343A]">
          {/* Quality Quick Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-charcoal-500 dark:text-[#85888E] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedQuality('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedQuality === 'all'
                  ? 'bg-champagne-500 text-black shadow-xs'
                  : 'bg-white dark:bg-[#1D2025] text-charcoal-700 dark:text-[#B4B5BA] border border-light-border dark:border-[#30343A]'
              }`}
            >
              All Qualities
            </button>
            <button
              type="button"
              onClick={() => setSelectedQuality('high')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedQuality === 'high'
                  ? 'bg-champagne-500 text-black shadow-xs'
                  : 'bg-white dark:bg-[#1D2025] text-charcoal-700 dark:text-[#B4B5BA] border border-light-border dark:border-[#30343A]'
              }`}
            >
              High Quality (Taped Seams)
            </button>
            <button
              type="button"
              onClick={() => setSelectedQuality('standard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedQuality === 'standard'
                  ? 'bg-champagne-500 text-black shadow-xs'
                  : 'bg-white dark:bg-[#1D2025] text-charcoal-700 dark:text-[#B4B5BA] border border-light-border dark:border-[#30343A]'
              }`}
            >
              Standard Quality
            </button>
          </div>

          {/* Search input */}
          <div className="relative min-w-[240px]">
            <input
              type="text"
              placeholder="Search wholesale vests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] text-charcoal-900 dark:text-gray-100 rounded-xl text-xs focus:outline-none focus:border-[#C9A96A]"
            />
            <Search className="w-4 h-4 text-charcoal-400 dark:text-gray-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Product Grid */}
        {wholesaleProducts.length === 0 ? (
          <div className="text-center py-16 bg-light-elevated dark:bg-[#17191D] rounded-2xl border border-light-border dark:border-[#30343A] p-8 space-y-3">
            <h3 className="font-bold text-lg text-charcoal-900 dark:text-gray-100">No Wholesale Products Matched</h3>
            <p className="text-xs text-charcoal-500 dark:text-gray-400 max-w-md mx-auto">
              Please clear search filters or contact our wholesale desk directly for custom manufacturing orders.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedQuality('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-champagne-500 text-black rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {wholesaleProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} isWholesaleView={true} />
            ))}
          </div>
        )}
      </section>

      {/* 3. Wholesale Bulk Inquiry Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20">
        <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-[#17191D] via-[#1D2025] to-[#17191D] border border-[#C9A96A]/40 text-white shadow-elevation flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-[#C9A96A]/20 text-[#C9A96A] text-[10px] font-extrabold uppercase tracking-wider">
              <span>Large Master Carton Orders (100+ Pieces)</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Need a Custom Bulk Quote or Institutional Supply?
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
              Talk directly with Muhammad Amin (Owner) for customized packaging, commercial merchant invoicing, or large master carton rates.
            </p>
          </div>

          <div className="flex-shrink-0 flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-xs transition-all"
            >
              <WhatsAppIcon size={16} className="text-white fill-current" />
              <span>WhatsApp Bulk Desk</span>
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-bold text-xs bg-[#23262B] hover:bg-[#2A2E35] text-white border border-[#3E434B] transition-colors"
            >
              <span>Contact Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
