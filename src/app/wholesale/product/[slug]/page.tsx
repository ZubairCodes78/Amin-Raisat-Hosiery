'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductGallery } from '@/components/product/ProductGallery';
import { VariantSelector } from '@/components/product/VariantSelector';
import { ProductReviews } from '@/components/product/ProductReviews';
import { SleeveType, ProductSize } from '@/types';
import { ChevronRight, PackageCheck, Truck, ShieldCheck, Headphones } from 'lucide-react';

export default function WholesaleProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { products, categories, subcategories, isLoading } = useStore();

  const product = products.find((p) => (p.slug === slug || p.id === slug) && p.isWholesaleEnabled !== false) ||
    products.find((p) => p.slug === slug || p.id === slug) ||
    products[0];

  // Variant Selections State
  const [selectedSleeve, setSelectedSleeve] = useState<SleeveType>(() => {
    return product?.variants?.[0]?.sleeve || 'Sleeveless';
  });
  const [selectedSize, setSelectedSize] = useState<ProductSize>('L');

  // Accordion Sections State
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    description: true,
    care: false,
    shipping: true,
    returns: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-light-bg dark:bg-[#11110F]">
        <div className="w-9 h-9 border-4 border-[#B89555] dark:border-[#C9A96A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center bg-light-bg dark:bg-[#11110F]">
        <h1 className="text-2xl font-bold text-charcoal-900 dark:text-[#F4F1E9]">Wholesale Product Not Found</h1>
        <p className="text-xs text-charcoal-500 dark:text-[#B8B3A8] mt-2">The wholesale product you requested does not exist or has been moved.</p>
        <Link
          href="/wholesale"
          className="mt-6 inline-block bg-champagne-500 text-charcoal-950 text-xs font-bold py-3 px-6 rounded-xl shadow-xs"
        >
          Return to Wholesale Catalog
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId || c.slug === product.categoryId);
  const subcategory = subcategories.find((s) => s.id === product.subcategoryId || s.slug === product.subcategoryId);

  return (
    <div className="min-h-screen py-10 bg-light-bg dark:bg-[#11110F] text-charcoal-900 dark:text-[#F4F1E9] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Wholesale Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-charcoal-500 dark:text-[#B8B3A8] mb-8 flex-wrap">
          <Link href="/wholesale" className="hover:text-[#B89555] dark:text-[#C9A96A] font-bold transition-colors">
            Wholesale
          </Link>
          {category && (
            <>
              <ChevronRight className="w-3 h-3 text-charcoal-400 dark:text-[#6E6A62]" />
              <Link href={`/wholesale/category/${category.slug}`} className="hover:text-[#B89555] dark:hover:text-[#C9A96A] capitalize transition-colors">
                {category.name}
              </Link>
            </>
          )}
          {subcategory && (
            <>
              <ChevronRight className="w-3 h-3 text-charcoal-400 dark:text-[#6E6A62]" />
              <Link
                href={`/wholesale/category/${category?.slug || 'men'}/${subcategory.slug}`}
                className="hover:text-[#B89555] dark:hover:text-[#C9A96A] capitalize transition-colors"
              >
                {subcategory.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-charcoal-400 dark:text-[#6E6A62]" />
          <span className="font-semibold text-charcoal-900 dark:text-[#F4F1E9] truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Dynamic Variant Media Gallery */}
          <div className="lg:col-span-6">
            <ProductGallery
              media={product.media}
              productName={product.name}
              selectedSleeve={selectedSleeve}
            />
          </div>

          {/* Right Column: Wholesale Details & Variant Selection */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#96763D] dark:text-[#C9A96A] uppercase tracking-widest block">
                  Wholesale &gt; {category ? category.name : 'Men'} &gt; {subcategory ? subcategory.name : 'Vests'}
                </span>
                <span className="text-[10px] font-extrabold bg-champagne-500 text-charcoal-950 px-2 py-0.5 rounded uppercase tracking-wider shadow-xs">
                  B2B Wholesale
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-[#F4F1E9] tracking-tight mt-1.5 leading-tight">
                {product.name}
              </h1>

              <p className="text-xs sm:text-sm text-charcoal-600 dark:text-[#B8B3A8] mt-2 font-normal">
                {product.subtitle || '100% Pure Combed Cotton Rib Weave • Direct Factory Master Packs'}
              </p>
            </div>

            {/* Wholesale Value Props Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 rounded-2xl bg-white dark:bg-[#191917] border border-light-border dark:border-[#34322D] shadow-xs">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-[#B89555] dark:text-[#C9A96A] flex-shrink-0" />
                <div className="text-[11px] leading-tight">
                  <div className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">Min 12 pcs</div>
                  <div className="text-charcoal-500 dark:text-[#8E8A80]">Master Pack</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#B89555] dark:text-[#C9A96A] flex-shrink-0" />
                <div className="text-[11px] leading-tight">
                  <div className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">100% Free</div>
                  <div className="text-charcoal-500 dark:text-[#8E8A80]">Delivery across PK</div>
                </div>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <ShieldCheck className="w-4 h-4 text-[#B89555] dark:text-[#C9A96A] flex-shrink-0" />
                <div className="text-[11px] leading-tight">
                  <div className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">Factory Direct</div>
                  <div className="text-charcoal-500 dark:text-[#8E8A80]">Faisalabad Unit</div>
                </div>
              </div>
            </div>

            {/* Variant & Wholesale Quantity Stepper (Locked to Wholesale Mode) */}
            <VariantSelector
              product={product}
              selectedSleeve={selectedSleeve}
              setSelectedSleeve={setSelectedSleeve}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
              defaultWholesale={true}
              lockWholesaleMode={true}
            />

            {/* Accordion Sections for Specifications & Bulk Shipping */}
            <div className="border-t border-light-border dark:border-[#34322D] pt-6 space-y-3">
              {/* Description */}
              <div className="border border-light-border dark:border-[#34322D] rounded-2xl overflow-hidden bg-white dark:bg-[#191917]">
                <button
                  type="button"
                  onClick={() => toggleSection('description')}
                  className="w-full p-4 flex items-center justify-between font-bold text-xs sm:text-sm text-left hover:bg-light-hover dark:hover:bg-[#22211E] transition-colors"
                >
                  <span>Fabric &amp; Manufacturing Details</span>
                  <span className="text-[#B89555] dark:text-[#C9A96A]">{openSections.description ? '−' : '+'}</span>
                </button>
                {openSections.description && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-charcoal-600 dark:text-[#B8B3A8] leading-relaxed border-t border-light-border dark:border-[#34322D] space-y-2">
                    <p>{product.description}</p>
                    {product.features && product.features.length > 0 && (
                      <ul className="list-disc pl-5 space-y-1 pt-2">
                        {product.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Wholesale Shipping & Delivery Policy */}
              <div className="border border-light-border dark:border-[#34322D] rounded-2xl overflow-hidden bg-white dark:bg-[#191917]">
                <button
                  type="button"
                  onClick={() => toggleSection('shipping')}
                  className="w-full p-4 flex items-center justify-between font-bold text-xs sm:text-sm text-left hover:bg-light-hover dark:hover:bg-[#22211E] transition-colors"
                >
                  <span>Wholesale Logistics &amp; Nationwide Delivery</span>
                  <span className="text-[#B89555] dark:text-[#C9A96A]">{openSections.shipping ? '−' : '+'}</span>
                </button>
                {openSections.shipping && (
                  <div className="p-4 pt-0 text-xs sm:text-sm text-charcoal-600 dark:text-[#B8B3A8] leading-relaxed border-t border-light-border dark:border-[#34322D] space-y-2">
                    <p>
                      <strong>Free Delivery:</strong> All wholesale orders (minimum 12 pieces) enjoy 100% Free Nationwide Delivery across Pakistan via Leopard, Trax, Call Courier, or Daewoo Cargo.
                    </p>
                    <p>
                      <strong>Payment Options:</strong> Cash on Delivery (COD) and Direct Bank Transfer (IBFT) accepted.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews */}
        <div className="mt-16 border-t border-light-border dark:border-[#34322D] pt-14">
          <ProductReviews
            productId={product.id}
            productName={product.name}
            reviews={product.reviews}
          />
        </div>
      </div>
    </div>
  );
}
