'use client';

import React from 'react';
import Link from 'next/link';
import { BrandHeroSlider } from '@/components/home/BrandHeroSlider';
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
    <div className="space-y-0">
      {/* 1. Full-Width Image-Only Hero Slider */}
      <BrandHeroSlider />

      {/* 2. Main Categories Grid (Men, Women, Kids & Subcategories) */}
      <CategoryGrid />

      {/* 3. Featured Available Products Section (Max 8 Products in 4x2 Grid) */}
      <section className="py-14 bg-gray-50/50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
                Store Collection
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-950 mt-1">
                Available Products
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 font-normal">
                Select your size and quality options directly to add to your shopping cart.
              </p>
            </div>

            <Link
              href="/shop"
              className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-900 hover:text-black transition-colors"
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
              className="inline-flex items-center justify-center gap-2 bg-gray-950 hover:bg-black text-white font-semibold text-xs py-3.5 px-8 rounded-lg shadow-sm transition-all active:scale-[0.99]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View All Products</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Quality & Delivery Features */}
      <FeaturesSection />

      {/* 5. Direct WhatsApp Consultation Banner with Official WhatsApp Icon */}
      <section className="py-12 bg-gray-950 text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <span className="inline-block text-[11px] font-semibold tracking-wider uppercase text-gray-400">
            Direct Customer Support
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Order or Inquire Directly with Muhammad Amin
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto leading-relaxed font-normal">
            Have questions about fabric quality, sleeve styles, or delivery anywhere in Pakistan? We are ready on WhatsApp.
          </p>
          <div className="pt-2 flex justify-center">
            <a
              href={`https://wa.me/92${settings.whatsapp.replace(/^0/, '')}?text=${encodeURIComponent(
                'Assalam-o-Alaikum Amin Raisat Hosiery, I want to inquire about placing an order.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs py-3 px-6 rounded-lg shadow-sm transition-colors"
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
