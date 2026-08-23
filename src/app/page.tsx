'use client';

import React from 'react';
import Link from 'next/link';
import { BrandHeroSlider } from '@/components/home/BrandHeroSlider';
import { BenefitsStrip } from '@/components/home/BenefitsStrip';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { FeaturesSection } from '@/components/home/FeaturesSection';
import { ProductCard } from '@/components/product/ProductCard';
import { useStore } from '@/context/StoreContext';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export default function HomePage() {
  const { products, settings } = useStore();
  const activeProducts = products.filter((p) => p.isPublished);
  const homepageProducts = activeProducts.slice(0, 8);

  return (
    <div className="space-y-0 bg-dark-bg text-gray-100">
      {/* 1. Full-Width Separate Desktop & Mobile Hero Slider */}
      <BrandHeroSlider />

      {/* 2. Promotional Benefits Strip Directly Below Hero Slider */}
      <BenefitsStrip />

      {/* 3. Main Categories Grid (Men, Women, Kids with dynamic counts) */}
      <CategoryGrid />

      {/* 3. Featured Available Products Section (Max 8 Products in 4x2 Grid) */}
      <section className="py-16 bg-[#0c0c11] border-b border-dark-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest">
                Store Collection
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 mt-1">
                Available Products
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 font-normal">
                Select your size and sleeve options directly to order online or via WhatsApp.
              </p>
            </div>

            <Link
              href="/shop"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-gold-400 hover:text-gold-300 transition-colors"
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
              className="inline-flex items-center justify-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs py-3.5 px-8 rounded-xl shadow-glow-gold transition-all active:scale-[0.99]"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 ml-1 stroke-[2.2]" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Quality & Delivery Features */}
      <FeaturesSection />

      {/* 5. Direct WhatsApp Consultation Banner with Official WhatsApp Icon */}
      <section className="py-14 bg-dark-surface border-t border-dark-border text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="inline-block text-[10px] font-bold tracking-widest uppercase text-gold-500">
            Direct Customer Support
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-100 tracking-tight">
            Order or Inquire Directly with Muhammad Amin
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed font-normal">
            Have questions about fabric quality, sleeve styles, or delivery anywhere in Pakistan? We are available on WhatsApp.
          </p>
          <div className="pt-2 flex justify-center">
            <a
              href={`https://wa.me/92${settings.whatsapp.replace(/^0/, '')}?text=${encodeURIComponent(
                'Assalam-o-Alaikum Amin Raisat Hosiery, I want to inquire about placing an order.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs py-3.5 px-7 rounded-xl shadow-glow-whatsapp transition-all"
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
