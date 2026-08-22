'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';
import { ArrowLeft, Package, ShoppingBag, Layers, ChevronRight } from 'lucide-react';

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { categories, products } = useStore();

  const [activeSubcatSlug, setActiveSubcatSlug] = useState<string>('all');

  const currentCategory = categories.find((c) => c.slug === slug);
  const subcategories = currentCategory?.subcategories || [];

  // Filter products by category and active subcategory tab
  const categoryProducts = products.filter((p) => {
    if (!currentCategory) return false;
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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-brand-950">Category Not Found</h1>
        <p className="text-xs text-brand-500 mt-2">The category you requested does not exist.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 bg-brand-900 text-white text-xs font-bold py-2.5 px-5 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const categoryName = currentCategory?.name || (slug === 'men' ? 'Men' : slug === 'women' ? 'Women' : 'Kids');

  return (
    <div className="min-h-[75vh] py-10 bg-brand-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-brand-500 mb-6">
          <Link href="/" className="hover:text-brand-900">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-bold text-brand-950">{categoryName}&apos;s Collection</span>
        </div>

        {/* Category Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-200 shadow-subtle mb-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 inline-block mb-2">
              Category
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-brand-950">
              {categoryName}&apos;s Hosiery &amp; Innerwear
            </h1>
            <p className="text-xs sm:text-sm text-brand-600 mt-2 leading-relaxed font-medium">
              {currentCategory?.description ||
                `Browse our collection of breathable cotton essentials for ${categoryName.toLowerCase()}.`}
            </p>
          </div>

          {/* Subcategories Filter Pills */}
          {subcategories.length > 0 && (
            <div className="mt-6 pt-5 border-t border-brand-100">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveSubcatSlug('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                    activeSubcatSlug === 'all'
                      ? 'bg-brand-950 text-white shadow-sm'
                      : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                  }`}
                >
                  All {categoryName} Items
                </button>

                {subcategories.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveSubcatSlug(sub.slug)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 ${
                      activeSubcatSlug === sub.slug
                        ? 'bg-brand-950 text-white shadow-sm'
                        : 'bg-brand-100 text-brand-700 hover:bg-brand-200'
                    }`}
                  >
                    <span>{sub.name}</span>
                    {sub.productCount && sub.productCount > 0 ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Grid / Empty State */}
        {categoryProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-lg mx-auto shadow-xs space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-700 border border-gray-200">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-brand-950">
              {activeSubcatSlug !== 'all'
                ? `${subcategories.find((s) => s.slug === activeSubcatSlug)?.name || 'Collection'} Coming Soon`
                : `${categoryName}'s Collection Coming Soon`}
            </h3>
            <p className="text-xs text-brand-500 leading-relaxed">
              We are carefully manufacturing genuine high quality cotton essentials for this collection. More products will be published soon by Muhammad Amin.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-brand-950 hover:bg-brand-900 text-white font-bold text-xs py-3 px-6 rounded-xl transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore All Available Products</span>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-semibold text-brand-600">
                Showing {categoryProducts.length} Product{categoryProducts.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
