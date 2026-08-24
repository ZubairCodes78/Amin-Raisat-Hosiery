'use client';

import React from 'react';
import Link from 'next/link';
import { BrandHeroSlider } from '@/components/home/BrandHeroSlider';
import { BenefitsStrip } from '@/components/home/BenefitsStrip';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { ProductCard } from '@/components/product/ProductCard';
import { useStore } from '@/context/StoreContext';
import { ArrowRight, ShoppingBag, Sparkles, PackageCheck } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export default function HomePage() {
  const { products, settings } = useStore();
  const activeProducts = products.filter((p) => p.isPublished);
  const homepageProducts = activeProducts.slice(0, 8);

  return (
    <div className="space-y-0 bg-light-bg dark:bg-dark-bg text-charcoal-900 dark:text-gray-100 transition-colors duration-200">
      {/* 1. Full-Width Separate Desktop & Mobile Hero Slider */}
      <BrandHeroSlider />

      {/* 2. Promotional Benefits Strip Directly Below Hero Slider */}
      <BenefitsStrip />

      {/* 3. Main Categories Grid */}
      <CategoryGrid />

      {/* 4. Wholesale B2B Commercial Callout Strip */}
      <section className="py-10 bg-gradient-to-r from-champagne-100 via-champagne-50 to-champagne-100 dark:from-[#17191D] dark:via-[#1D2025] dark:to-[#17191D] border-y border-light-border dark:border-[#30343A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#C9A96A]/20 text-[#A07D38] dark:text-[#C9A96A] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Wholesale &amp; Bulk Commercial Portal</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 dark:text-gray-100">
              Retailers &amp; Bulk Buyers: Save Up to 27% with 1-Dozen Packs
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-600 dark:text-gray-400">
              Factory-direct prices starting from minimum 12 pieces with 100% Free Nationwide Delivery across Pakistan.
            </p>
          </div>

          <Link
            href="/wholesale"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-champagne-500 hover:bg-champagne-400 text-black font-extrabold text-xs py-3.5 px-6 rounded-xl shadow-xs transition-all"
          >
            <PackageCheck className="w-4 h-4" />
            <span>Explore Wholesale Store</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 5. Featured Available Products Section (Max 8 Products in 4x2 Grid) */}
      <section className="py-16 bg-white dark:bg-[#0c0c11] border-b border-light-border dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-[10px] font-bold text-[#A07D38] dark:text-gold-500 uppercase tracking-widest">
                Store Collection
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-gray-100 mt-1">
                Available Products
              </h2>
              <p className="text-xs sm:text-sm text-charcoal-500 dark:text-gray-400 mt-1 font-normal">
                Select your size and sleeve options directly to order online or via WhatsApp.
              </p>
            </div>

            <Link
              href="/shop"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-[#A07D38] dark:text-gold-400 hover:text-[#C9A96A] transition-colors"
            >
              <span>Explore Full Shop</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homepageProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Prominent "View All Products" Button below products */}
          <div className="mt-12 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-champagne-500 hover:bg-champagne-400 text-black font-bold text-xs py-3.5 px-8 rounded-xl shadow-xs transition-all active:scale-[0.99]"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 ml-1 stroke-[2.2]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. Quality & Delivery Features */}
      <FeaturesSection />

      {/* 7. Direct WhatsApp Consultation Banner */}
      <section className="py-14 bg-light-elevated dark:bg-dark-surface border-t border-light-border dark:border-dark-border text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-[#A07D38] dark:text-gold-500">
            Direct Customer Support
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-gray-100 tracking-tight">
            Order or Inquire Directly with Muhammad Amin
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-gray-400 max-w-xl mx-auto leading-relaxed font-normal">
            Have questions about fabric quality, sleeve styles, or delivery anywhere in Pakistan? We are available on WhatsApp.
          </p>
          <div className="pt-2 flex justify-center">
            <a
              href={`https://wa.me/92${settings.whatsapp.replace(/^0/, '')}?text=${encodeURIComponent(
                'Assalam-o-Alaikum Amin Raisat Hosiery, I want to inquire about placing an order.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs py-3.5 px-7 rounded-xl shadow-xs transition-all"
            >
              <WhatsAppIcon size={18} className="text-white fill-current" />
              <span>Chat on WhatsApp ({settings.whatsapp})</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
