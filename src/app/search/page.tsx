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
    <div className="min-h-[75vh] py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-semibold text-gray-900">Search Products</span>
        </div>

        {/* Search Header */}
        <div className="border-b border-gray-200 pb-6 mb-8 max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 mb-3">
            Search Our Store
          </h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by product name, category, or SKU..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>

        {/* Results */}
        {matchingProducts.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200 max-w-md mx-auto space-y-3">
            <Search className="w-8 h-8 text-gray-400 mx-auto" />
            <h3 className="text-base font-bold text-gray-950">No products found</h3>
            <p className="text-xs text-gray-500">
              No items matched &quot;{query}&quot;. Try checking for spelling mistakes or explore our main categories.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-950 text-white rounded-lg text-xs font-semibold hover:bg-black"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse All Products</span>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-xs font-medium text-gray-500 mb-6">
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
    <Suspense fallback={<div className="p-8 text-center text-xs">Loading search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
