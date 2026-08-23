'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';
import { Search, ChevronRight, ShoppingBag } from 'lucide-react';

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const { products, categories, subcategories } = useStore();

  const matchingProducts = useMemo(() => {
    if (!query.trim()) return products.filter((p) => p.isPublished);

    const q = query.toLowerCase().trim();
    return products.filter((prod) => {
      if (!prod.isPublished) return false;

      const nameMatch = prod.name.toLowerCase().includes(q);
      const subtitleMatch = prod.subtitle.toLowerCase().includes(q);
      const descMatch = prod.description.toLowerCase().includes(q);

      const cat = categories.find((c) => c.id === prod.categoryId);
      const catMatch = cat ? cat.name.toLowerCase().includes(q) : false;

      const subcat = subcategories.find((s) => s.id === prod.subcategoryId);
      const subcatMatch = subcat ? subcat.name.toLowerCase().includes(q) : false;

      const skuMatch = prod.variants.some((v) => v.sku.toLowerCase().includes(q));

      return nameMatch || subtitleMatch || descMatch || catMatch || subcatMatch || skuMatch;
    });
  }, [products, categories, subcategories, query]);

  return (
    <div className="min-h-[85vh] py-12 bg-dark-bg text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gold-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-semibold text-gray-200">Search Products</span>
        </div>

        {/* Search Header */}
        <div className="border-b border-dark-border pb-6 mb-8 max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-100 mb-3 tracking-tight">
            Search Catalog
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by product name, category, or SKU..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-dark-surface border border-dark-border rounded-xl text-xs text-gray-100 focus:outline-none focus:border-gold-500 shadow-card"
            />
            <Search className="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
          </div>
        </div>

        {/* Results */}
        {matchingProducts.length === 0 ? (
          <div className="bg-dark-surface rounded-2xl p-12 text-center border border-dark-border max-w-md mx-auto space-y-3 shadow-card">
            <Search className="w-8 h-8 text-gray-500 mx-auto" />
            <h3 className="text-base font-bold text-gray-200">No products found</h3>
            <p className="text-xs text-gray-400">
              No items matched &quot;{query}&quot;. Try checking for spelling mistakes or explore our main catalog.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gold-500 hover:bg-gold-400 text-black rounded-xl text-xs font-bold shadow-glow-gold"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                <span>Browse All Products</span>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-6">
              Found {matchingProducts.length} product{matchingProducts.length > 1 ? 's' : ''}
              {query && ` matching "${query}"`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {matchingProducts.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
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
    <Suspense fallback={<div className="p-12 text-center text-xs text-gray-400 bg-dark-bg min-h-[50vh]">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
