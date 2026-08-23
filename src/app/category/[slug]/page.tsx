'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';
import { ArrowLeft, Package, ShoppingBag, ChevronRight } from 'lucide-react';

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
    if (!p.isPublished) return false;

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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center bg-dark-bg text-gray-100 min-h-[70vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-100">Category Not Found</h1>
        <p className="text-xs text-gray-400 mt-2">The category you requested does not exist.</p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold py-3 px-6 rounded-xl shadow-glow-gold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>
    );
  }

  const categoryName = currentCategory?.name || (slug === 'men' ? 'Men' : slug === 'women' ? 'Women' : 'Kids');

  return (
    <div className="min-h-[85vh] py-10 bg-dark-bg text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gold-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <Link href="/shop" className="hover:text-gold-400 transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-bold text-gray-200">{categoryName}&apos;s Collection</span>
        </div>

        {/* Category Header Banner */}
        <div className="bg-dark-surface rounded-2xl p-6 sm:p-10 border border-dark-border shadow-card mb-8">
          <div className="max-w-2xl">
            <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest bg-dark-card px-3 py-1 rounded-full border border-dark-border inline-block mb-2">
              Category
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 tracking-tight">
              {categoryName}&apos;s Collection
            </h1>
            <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed font-medium">
              {currentCategory?.description ||
                `Browse our collection of breathable cotton essentials for ${categoryName.toLowerCase()}.`}
            </p>
          </div>

          {/* Subcategories Filter Pills */}
          {subcategories.length > 0 && (
            <div className="mt-6 pt-5 border-t border-dark-border">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setActiveSubcatSlug('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex-shrink-0 ${
                    activeSubcatSlug === 'all'
                      ? 'bg-gold-500 text-black shadow-glow-gold'
                      : 'bg-dark-card text-gray-300 hover:bg-dark-hover border border-dark-border'
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
                        ? 'bg-gold-500 text-black shadow-glow-gold'
                        : 'bg-dark-card text-gray-300 hover:bg-dark-hover border border-dark-border'
                    }`}
                  >
                    <span>{sub.name}</span>
                    {sub.productCount && sub.productCount > 0 ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Grid / Empty State */}
        {categoryProducts.length === 0 ? (
          <div className="bg-dark-surface rounded-2xl p-10 sm:p-12 text-center border border-dark-border max-w-lg mx-auto shadow-card space-y-4">
            <div className="w-14 h-14 bg-dark-card rounded-2xl flex items-center justify-center mx-auto text-gold-400 border border-dark-border">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-100">
              {activeSubcatSlug !== 'all'
                ? `No Products Found in ${subcategories.find((s) => s.slug === activeSubcatSlug)?.name || 'Collection'}`
                : `No Products in ${categoryName}'s Collection`}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Explore our current in-stock pure cotton vests and innerwear in the main shop.
            </p>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs py-3 px-6 rounded-xl shadow-glow-gold transition-colors"
              >
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
                <span>Explore Full Shop</span>
              </Link>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs font-semibold text-gray-400">
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
