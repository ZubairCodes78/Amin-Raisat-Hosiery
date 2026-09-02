'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';
import { Truck, ShieldCheck, PackageCheck, Headphones, ArrowRight, Filter, Search, Layers } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { getWhatsAppUrl, DISPLAY_WHATSAPP_NUMBER } from '@/lib/whatsapp';

export default function WholesalePage() {
  const { products, categories, settings } = useStore();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.isActive !== false);
  }, [categories]);

  // Filter wholesale-enabled products dynamically from database
  const wholesaleProducts = useMemo(() => {
    return products.filter((p) => {
      if (!p.isPublished || p.isWholesaleEnabled === false) return false;

      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCat =
          p.categoryId === selectedCategory ||
          (selectedCategory === 'men' && (p.categoryId === 'cat-men' || !p.categoryId)) ||
          (selectedCategory === 'women' && p.categoryId === 'cat-women') ||
          (selectedCategory === 'kids' && p.categoryId === 'cat-kids');
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

  const whatsappInquiryUrl = getWhatsAppUrl(
    settings.whatsapp || DISPLAY_WHATSAPP_NUMBER,
    'Hello Amin Raisat Hosiery! I am interested in placing a wholesale/B2B order for cotton vests. Please share wholesale details.'
  );

  return (
    <div className="min-h-screen bg-light-bg dark:bg-[#11110F] text-charcoal-900 dark:text-[#F4F1E9] transition-colors duration-200">
      {/* 1. Wholesale Storefront Header */}
      <section className="border-b border-light-border dark:border-[#34322D] bg-white dark:bg-[#141412] py-10 sm:py-12 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <span className="text-[11px] font-bold text-[#B89555] dark:text-[#C9A96A] uppercase tracking-widest">
              B2B Commercial Storefront
            </span>
            <span className="text-[10px] font-extrabold bg-champagne-500 text-charcoal-950 px-2.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
              Wholesale Mode
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-charcoal-900 dark:text-[#F4F1E9] max-w-3xl mx-auto leading-tight">
            Wholesale Cotton Vests &amp; Innerwear
          </h1>

          <p className="text-sm sm:text-base text-charcoal-600 dark:text-[#B8B3A8] max-w-2xl mx-auto font-normal leading-relaxed">
            Order in bulk directly from our Faisalabad manufacturing unit. Save with dozen master packs (minimum 12 pieces) and enjoy 100% Free Nationwide Delivery across Pakistan.
          </p>

          {/* Wholesale Highlights Strip */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-light-elevated dark:bg-[#191917] border border-light-border dark:border-[#34322D] shadow-xs">
              <PackageCheck className="w-5 h-5 text-[#B89555] dark:text-[#C9A96A] mb-1.5" />
              <div className="font-bold text-xs text-charcoal-900 dark:text-[#F4F1E9]">Min 12 Pieces</div>
              <div className="text-[11px] text-charcoal-500 dark:text-[#8E8A80]">1 Dozen Master Packs</div>
            </div>

            <div className="p-3.5 rounded-xl bg-light-elevated dark:bg-[#191917] border border-light-border dark:border-[#34322D] shadow-xs">
              <Truck className="w-5 h-5 text-[#B89555] dark:text-[#C9A96A] mb-1.5" />
              <div className="font-bold text-xs text-charcoal-900 dark:text-[#F4F1E9]">100% Free Delivery</div>
              <div className="text-[11px] text-charcoal-500 dark:text-[#8E8A80]">Nationwide across Pakistan</div>
            </div>

            <div className="p-3.5 rounded-xl bg-light-elevated dark:bg-[#191917] border border-light-border dark:border-[#34322D] shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#B89555] dark:text-[#C9A96A] mb-1.5" />
              <div className="font-bold text-xs text-charcoal-900 dark:text-[#F4F1E9]">Combed Cotton</div>
              <div className="text-[11px] text-charcoal-500 dark:text-[#8E8A80]">Strict Factory Inspection</div>
            </div>

            <div className="p-3.5 rounded-xl bg-light-elevated dark:bg-[#191917] border border-light-border dark:border-[#34322D] shadow-xs">
              <Headphones className="w-5 h-5 text-[#B89555] dark:text-[#C9A96A] mb-1.5" />
              <div className="font-bold text-xs text-charcoal-900 dark:text-[#F4F1E9]">B2B Support Desk</div>
              <div className="text-[11px] text-charcoal-500 dark:text-[#8E8A80]">WhatsApp &amp; Direct Phone</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filter & Catalog Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-8">
        {/* Wholesale Category Quick Jump Navigation */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-charcoal-500 dark:text-[#8E8A80] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#B89555] dark:text-[#C9A96A]" />
              <span>Wholesale Collections</span>
            </h2>
            <Link
              href="/"
              className="text-xs font-semibold text-[#B89555] dark:text-[#C9A96A] hover:underline"
            >
              ← Return to Retail Storefront
            </Link>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-champagne-500 text-charcoal-950 shadow-xs'
                  : 'bg-white dark:bg-[#191917] text-charcoal-700 dark:text-[#B8B3A8] hover:text-charcoal-900 dark:hover:text-[#F4F1E9] border border-light-border dark:border-[#34322D]'
              }`}
            >
              All Wholesale Items
            </button>

            {activeCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug || cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                  selectedCategory === (cat.slug || cat.id)
                    ? 'bg-champagne-500 text-charcoal-950 shadow-xs'
                    : 'bg-white dark:bg-[#191917] text-charcoal-700 dark:text-[#B8B3A8] hover:text-charcoal-900 dark:hover:text-[#F4F1E9] border border-light-border dark:border-[#34322D]'
                }`}
              >
                {cat.name}&apos;s Wholesale
              </button>
            ))}
          </div>
        </div>

        {/* Search & Quality Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#191917] border border-light-border dark:border-[#34322D] shadow-xs">
          {/* Quality Filter Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-charcoal-500 dark:text-[#8E8A80] flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5" /> Quality:
            </span>
            <button
              type="button"
              onClick={() => setSelectedQuality('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                selectedQuality === 'all'
                  ? 'bg-champagne-500 text-charcoal-950 shadow-xs'
                  : 'bg-light-elevated dark:bg-[#22211E] text-charcoal-700 dark:text-[#B8B3A8] border border-light-border dark:border-[#34322D]'
              }`}
            >
              All Qualities
            </button>
            <button
              type="button"
              onClick={() => setSelectedQuality('high')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                selectedQuality === 'high'
                  ? 'bg-champagne-500 text-charcoal-950 shadow-xs'
                  : 'bg-light-elevated dark:bg-[#22211E] text-charcoal-700 dark:text-[#B8B3A8] border border-light-border dark:border-[#34322D]'
              }`}
            >
              High Quality (Taped Seams)
            </button>
            <button
              type="button"
              onClick={() => setSelectedQuality('standard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                selectedQuality === 'standard'
                  ? 'bg-champagne-500 text-charcoal-950 shadow-xs'
                  : 'bg-light-elevated dark:bg-[#22211E] text-charcoal-700 dark:text-[#B8B3A8] border border-light-border dark:border-[#34322D]'
              }`}
            >
              Standard Quality
            </button>
          </div>

          {/* Wholesale Search Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
                document.activeElement.blur();
              }
            }}
            className="relative min-w-[240px]"
          >
            <input
              type="text"
              enterKeyHint="search"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Search wholesale products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] text-charcoal-900 dark:text-[#F4F1E9] rounded-xl text-xs focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A]"
            />
            <Search className="w-4 h-4 text-charcoal-400 dark:text-[#8E8A80] absolute left-3 top-2.5" />
          </form>
        </div>

        {/* Product Grid */}
        {wholesaleProducts.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-[#191917] border border-light-border dark:border-[#34322D] text-center max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 bg-light-elevated dark:bg-[#22211E] rounded-2xl flex items-center justify-center mx-auto text-[#A07D38] dark:text-[#C9A96A] border border-light-border dark:border-[#34322D]">
              <PackageCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-charcoal-900 dark:text-[#F4F1E9]">No wholesale products match your filter</h3>
              <p className="text-xs text-charcoal-500 dark:text-[#8E8A80]">
                Try adjusting your search query or selecting &quot;All Qualities&quot;.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSelectedQuality('all');
                setSearchQuery('');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-champagne-500 text-charcoal-950 text-xs font-bold shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {wholesaleProducts.map((product) => (
              <ProductCard key={product.id} product={product} isWholesaleView={true} />
            ))}
          </div>
        )}

        {/* Custom Bulk Contract Inquiry Callout */}
        <div className="p-8 sm:p-10 rounded-2xl bg-white dark:bg-[#191917] border border-light-border dark:border-[#34322D] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1.5 max-w-xl">
            <span className="text-[10px] font-bold text-[#B89555] dark:text-[#C9A96A] uppercase tracking-wider block">
              Custom Industrial Orders
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 dark:text-[#F4F1E9]">
              Need 500+ pieces or custom private labeling?
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 dark:text-[#B8B3A8]">
              Connect directly with our Faisalabad factory management desk for customized OEM contract production and export billing.
            </p>
          </div>

          <a
            href={whatsappInquiryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-xs transition-all active:scale-[0.99]"
          >
            <WhatsAppIcon size={18} className="text-white fill-current" />
            <span>Chat with B2B Factory Desk</span>
          </a>
        </div>
      </section>
    </div>
  );
}
