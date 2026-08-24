'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';
import { ChevronRight, PackageCheck, ShoppingBag } from 'lucide-react';

export default function WholesaleSubcategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const subSlug = params?.subSlug as string;
  const { categories, subcategories: allSubcategories, products } = useStore();

  const currentCategory = categories.find(
    (c) => c.slug?.toLowerCase() === slug?.toLowerCase() || c.id === slug
  );
  
  const currentSubcategory = (currentCategory?.subcategories && currentCategory.subcategories.length > 0)
    ? currentCategory.subcategories.find((s) => s.slug?.toLowerCase() === subSlug?.toLowerCase() || s.id === subSlug)
    : allSubcategories.find(
        (s) =>
          (s.categoryId === currentCategory?.id || !currentCategory) &&
          (s.slug?.toLowerCase() === subSlug?.toLowerCase() || s.id === subSlug)
      );

  const matchedProducts = products.filter((p) => {
    if (!currentCategory) return false;
    if (!p.isPublished || p.isWholesaleEnabled === false) return false;

    const matchesCat =
      p.categoryId === currentCategory.id ||
      p.categoryId === currentCategory.slug ||
      (slug === 'men' && (!p.categoryId || p.categoryId === 'cat-men')) ||
      (slug === 'women' && p.categoryId === 'cat-women') ||
      (slug === 'kids' && p.categoryId === 'cat-kids');
    if (!matchesCat) return false;
    return (
      p.subcategoryId === currentSubcategory?.id ||
      p.subcategoryId === currentSubcategory?.slug ||
      (slug === 'men' && subSlug === 'vests' && (!p.subcategoryId || p.subcategoryId === 'sub-men-vests'))
    );
  });

  const categoryName = currentCategory?.name || (slug === 'men' ? 'Men' : slug === 'women' ? 'Women' : 'Kids');
  const subcategoryName = currentSubcategory?.name || subSlug.replace(/-/g, ' ');

  return (
    <div className="min-h-[85vh] py-10 bg-light-bg dark:bg-[#11110F] text-charcoal-900 dark:text-[#F4F1E9] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Wholesale Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-charcoal-500 dark:text-[#B8B3A8] mb-6 flex-wrap">
          <Link href="/wholesale" className="hover:text-[#B89555] dark:text-[#C9A96A] font-bold transition-colors">
            Wholesale
          </Link>
          <ChevronRight className="w-3 h-3 text-charcoal-400 dark:text-[#6E6A62]" />
          <Link href={`/wholesale/category/${slug}`} className="hover:text-[#B89555] capitalize transition-colors">
            {categoryName}&apos;s Wholesale
          </Link>
          <ChevronRight className="w-3 h-3 text-charcoal-400 dark:text-[#6E6A62]" />
          <span className="font-bold text-charcoal-900 dark:text-[#F4F1E9] capitalize">{subcategoryName}</span>
        </div>

        {/* Wholesale Subcategory Header */}
        <div className="bg-white dark:bg-[#191917] rounded-2xl p-6 sm:p-10 border border-light-border dark:border-[#34322D] shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#B89555] dark:text-[#C9A96A] uppercase tracking-widest block">
                Wholesale Storefront • {categoryName} &gt; {subcategoryName}
              </span>
              <span className="text-[9.5px] font-bold bg-champagne-500 text-charcoal-950 px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                Min 12 pcs
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 dark:text-[#F4F1E9] capitalize tracking-tight">
              Wholesale {categoryName}&apos;s {subcategoryName}
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600 dark:text-[#B8B3A8] mt-2 leading-relaxed font-normal">
              {currentSubcategory?.description ||
                `Explore bulk master packs of pure combed cotton ${subcategoryName.toLowerCase()} at factory-direct rates.`}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <Link
              href={`/category/${slug}/${subSlug}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-light-elevated dark:bg-[#22211E] hover:bg-light-hover dark:hover:bg-[#2A2925] text-charcoal-700 dark:text-[#D7D7D4] border border-light-border dark:border-[#34322D] text-xs font-semibold transition-colors shadow-2xs"
            >
              <span>View in Retail Mode &rarr;</span>
            </Link>
          </div>
        </div>

        {/* Wholesale Products Grid */}
        {matchedProducts.length === 0 ? (
          <div className="bg-white dark:bg-[#191917] rounded-2xl p-10 sm:p-12 text-center border border-light-border dark:border-[#34322D] max-w-lg mx-auto shadow-sm space-y-4">
            <div className="w-14 h-14 bg-light-elevated dark:bg-[#22211E] rounded-2xl flex items-center justify-center mx-auto text-[#A07D38] dark:text-[#C9A96A] border border-light-border dark:border-[#34322D]">
              <PackageCheck className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-charcoal-900 dark:text-[#F4F1E9] capitalize">
              No Wholesale Products in {subcategoryName}
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-[#8E8A80]">
              Check our complete wholesale catalog for all available items.
            </p>
            <div className="pt-2">
              <Link
                href="/wholesale"
                className="inline-flex items-center gap-2 bg-champagne-500 text-charcoal-950 font-bold text-xs py-3 px-6 rounded-xl shadow-xs transition-colors"
              >
                <PackageCheck className="w-4 h-4 stroke-[2.2]" />
                <span>Explore Wholesale Catalog</span>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-semibold text-charcoal-500 dark:text-[#8E8A80]">
                Showing {matchedProducts.length} Wholesale Product{matchedProducts.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {matchedProducts.map((product) => (
                <ProductCard key={product.id} product={product} isWholesaleView={true} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
