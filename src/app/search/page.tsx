'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';
import { Search, ChevronRight, ShoppingBag, PackageCheck } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const isWholesale = searchParams.get('wholesale') === 'true' || searchParams.get('mode') === 'wholesale';
  const [query, setQuery] = useState(initialQuery);
  const { products, categories, subcategories } = useStore();

  const matchingProducts = useMemo(() => {
    const q = query.toLowerCase().trim();

    return products.filter((prod) => {
      if (!prod.isPublished) return false;
      if (isWholesale && prod.isWholesaleEnabled === false) return false;

      if (!q) return true;

      const nameMatch = prod.name.toLowerCase().includes(q);
      const subtitleMatch = prod.subtitle?.toLowerCase().includes(q);
      const descMatch = prod.description?.toLowerCase().includes(q);

      const cat = categories.find((c) => c.id === prod.categoryId || c.slug === prod.categoryId);
      const catMatch = cat ? cat.name.toLowerCase().includes(q) : false;

      const subcat = subcategories.find((s) => s.id === prod.subcategoryId || s.slug === prod.subcategoryId);
      const subcatMatch = subcat ? subcat.name.toLowerCase().includes(q) : false;

      const skuMatch = prod.variants.some((v) => v.sku?.toLowerCase().includes(q));

      return nameMatch || subtitleMatch || descMatch || catMatch || subcatMatch || skuMatch;
    });
  }, [products, categories, subcategories, query, isWholesale]);

  return (
    <div className="min-h-[85vh] py-12 bg-light-bg dark:bg-[#11110F] text-charcoal-900 dark:text-[#F4F1E9] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-charcoal-500 dark:text-[#8E8A80] mb-6 flex-wrap">
          <Link href={isWholesale ? "/wholesale" : "/"} className="hover:text-[#B89555] dark:hover:text-[#C9A96A] transition-colors">
            {isWholesale ? "Wholesale" : "Home"}
          </Link>
          <ChevronRight className="w-3 h-3 text-charcoal-400 dark:text-[#6E6A62]" />
          <span className="font-semibold text-charcoal-900 dark:text-[#F4F1E9]">
            {isWholesale ? "Search Wholesale Catalog" : "Search Products"}
          </span>
        </div>

        {/* Search Header */}
        <div className="border-b border-light-border dark:border-[#34322D] pb-6 mb-8 max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-[#F4F1E9] tracking-tight">
              {isWholesale ? "Search Wholesale Catalog" : "Search Catalog"}
            </h1>
            {isWholesale && (
              <span className="text-[10px] font-extrabold bg-champagne-500 text-charcoal-950 px-2 py-0.5 rounded shadow-xs uppercase tracking-wider">
                Wholesale Mode
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder={isWholesale ? "Search wholesale vests, styles, sizes..." : "Search by product name, category, or style..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#191917] border border-light-border dark:border-[#34322D] rounded-xl text-xs text-charcoal-900 dark:text-[#F4F1E9] focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A] shadow-xs"
            />
            <Search className="w-4 h-4 text-[#B89555] dark:text-[#C9A96A] absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Results */}
        {matchingProducts.length === 0 ? (
          <div className="bg-white dark:bg-[#191917] rounded-2xl p-12 text-center border border-light-border dark:border-[#34322D] max-w-md mx-auto space-y-3 shadow-sm">
            <Search className="w-8 h-8 text-charcoal-400 dark:text-[#8E8A80] mx-auto" />
            <h3 className="text-base font-bold text-charcoal-900 dark:text-[#F4F1E9]">No products found</h3>
            <p className="text-xs text-charcoal-500 dark:text-[#8E8A80]">
              No items matched &quot;{query}&quot;. Try checking for spelling mistakes or explore our full catalog.
            </p>
            <div className="pt-2">
              <Link
                href={isWholesale ? "/wholesale" : "/shop"}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-champagne-500 hover:bg-champagne-400 text-charcoal-950 rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                {isWholesale ? <PackageCheck className="w-4 h-4 stroke-[2.2]" /> : <ShoppingBag className="w-4 h-4 stroke-[2.2]" />}
                <span>{isWholesale ? "Explore Wholesale Store" : "Browse All Products"}</span>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium text-charcoal-500 dark:text-[#8E8A80] mb-6">
              Found {matchingProducts.length} {isWholesale ? "wholesale " : ""}product{matchingProducts.length > 1 ? 's' : ''}
              {query && ` matching "${query}"`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {matchingProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} isWholesaleView={isWholesale} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-charcoal-500 dark:text-[#8E8A80] bg-light-bg dark:bg-[#11110F] min-h-[50vh]">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
