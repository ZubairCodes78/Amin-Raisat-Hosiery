'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';
import { ArrowLeft, PackageCheck, ShoppingBag, ChevronRight, Truck, ShieldCheck } from 'lucide-react';

export default function WholesaleCategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { categories, subcategories: allSubcategories, products } = useStore();

  const [activeSubcatSlug, setActiveSubcatSlug] = useState<string>('all');

  const currentCategory = categories.find(
    (c) => c.slug?.toLowerCase() === slug?.toLowerCase() || c.id === slug
  );
  
  // Find subcategories belonging to this category
  const subcategories = (currentCategory?.subcategories && currentCategory.subcategories.length > 0)
    ? currentCategory.subcategories.filter((s) => s.isActive !== false)
    : allSubcategories.filter(
        (s) => s.categoryId === currentCategory?.id && s.isActive !== false
      );

  // Filter wholesale-enabled products by category and active subcategory tab
  const wholesaleCategoryProducts = products.filter((p) => {
    if (!currentCategory) return false;
    if (!p.isPublished || p.isWholesaleEnabled === false) return false;

    const matchesCat =
      p.categoryId === currentCategory.id ||
      p.categoryId === currentCategory.slug ||
      (slug === 'men' && (!p.categoryId || p.categoryId === 'cat-men')) ||
      (slug === 'women' && p.categoryId === 'cat-women') ||
      (slug === 'kids' && p.categoryId === 'cat-kids');
    if (!matchesCat) return false;

    if (activeSubcatSlug === 'all') return true;
    const activeSub = subcategories.find((s) => s.slug === activeSubcatSlug);
    return p.subcategoryId === activeSub?.id || p.subcategoryId === activeSub?.slug;
  });

  if (!currentCategory && slug !== 'men' && slug !== 'women' && slug !== 'kids') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center bg-light-bg dark:bg-[#11110F] text-charcoal-900 dark:text-[#F4F1E9] min-h-[70vh] flex flex-col items-center justify-center transition-colors duration-200">
        <h1 className="text-2xl font-bold text-charcoal-900 dark:text-[#F4F1E9]">Wholesale Category Not Found</h1>
        <p className="text-xs text-charcoal-500 dark:text-[#B8B3A8] mt-2">The wholesale category you requested does not exist.</p>
        <Link
          href="/wholesale"
          className="mt-6 inline-flex items-center gap-2 bg-champagne-500 hover:bg-champagne-400 text-charcoal-950 text-xs font-bold py-3 px-6 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Wholesale Store
        </Link>
      </div>
    );
  }

  const categoryName = currentCategory?.name || (slug === 'men' ? 'Men' : slug === 'women' ? 'Women' : 'Kids');

  return (
    <div className="min-h-[85vh] py-10 bg-light-bg dark:bg-[#11110F] text-charcoal-900 dark:text-[#F4F1E9] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Wholesale Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-charcoal-500 dark:text-[#B8B3A8] mb-6 flex-wrap">
          <Link href="/wholesale" className="hover:text-[#B89555] dark:text-[#C9A96A] font-bold transition-colors">
            Wholesale
          </Link>
          <ChevronRight className="w-3 h-3 text-charcoal-400 dark:text-[#6E6A62]" />
          <span className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">{categoryName}&apos;s Wholesale</span>
        </div>

        {/* Wholesale Category Header Banner */}
        <div className="bg-white dark:bg-[#191917] rounded-2xl p-6 sm:p-10 border border-light-border dark:border-[#34322D] shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#B89555] dark:text-[#C9A96A] uppercase tracking-widest block">
                Wholesale Storefront • {categoryName}
              </span>
              <span className="text-[9.5px] font-bold bg-champagne-500 text-charcoal-950 px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                Min 12 pcs
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 dark:text-[#F4F1E9] tracking-tight">
              Wholesale {categoryName}&apos;s Collection
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600 dark:text-[#B8B3A8] leading-relaxed font-normal pt-1">
              Direct factory master packs with wholesale volume rates and 100% Free Nationwide Delivery across Pakistan.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <Link
              href={`/category/${slug}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-light-elevated dark:bg-[#22211E] hover:bg-light-hover dark:hover:bg-[#2A2925] text-charcoal-700 dark:text-[#D7D7D4] border border-light-border dark:border-[#34322D] text-xs font-semibold transition-colors shadow-2xs"
            >
              <span>View in Retail Mode &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Subcategories Filter Pills */}
        {subcategories.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setActiveSubcatSlug('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                  activeSubcatSlug === 'all'
                    ? 'bg-champagne-500 text-charcoal-950 shadow-xs'
                    : 'bg-white dark:bg-[#22211E] text-charcoal-700 dark:text-[#B8B3A8] hover:text-charcoal-900 dark:hover:text-[#F4F1E9] hover:bg-light-hover dark:hover:bg-[#262521] border border-light-border dark:border-[#34322D]'
                }`}
              >
                All {categoryName} Wholesale
              </button>

              {subcategories.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/wholesale/category/${slug}/${sub.slug}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 bg-white dark:bg-[#22211E] text-charcoal-700 dark:text-[#B8B3A8] hover:text-charcoal-900 dark:hover:text-[#F4F1E9] hover:bg-light-hover dark:hover:bg-[#262521] border border-light-border dark:border-[#34322D]"
                >
                  <span>{sub.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Wholesale Product Grid */}
        {wholesaleCategoryProducts.length === 0 ? (
          <div className="bg-white dark:bg-[#191917] rounded-2xl p-10 sm:p-12 text-center border border-light-border dark:border-[#34322D] max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 bg-light-elevated dark:bg-[#22211E] rounded-2xl flex items-center justify-center mx-auto text-[#A07D38] dark:text-[#C9A96A] border border-light-border dark:border-[#34322D]">
              <PackageCheck className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-charcoal-900 dark:text-[#F4F1E9]">No wholesale items in this category yet</h3>
              <p className="text-xs text-charcoal-500 dark:text-[#8E8A80]">
                Check back soon or explore our complete wholesale catalog.
              </p>
            </div>
            <Link
              href="/wholesale"
              className="inline-flex items-center gap-2 bg-champagne-500 text-charcoal-950 text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs"
            >
              Browse All Wholesale
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {wholesaleCategoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} isWholesaleView={true} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
