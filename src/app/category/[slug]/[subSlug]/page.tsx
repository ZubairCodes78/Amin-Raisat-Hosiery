'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';
import { ChevronRight, Package, ShoppingBag } from 'lucide-react';

export default function SubcategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const subSlug = params?.subSlug as string;
  const { categories, products } = useStore();

  const currentCategory = categories.find((c) => c.slug === slug);
  const currentSubcategory = currentCategory?.subcategories?.find((s) => s.slug === subSlug);

  const matchedProducts = products.filter((p) => {
    if (!currentCategory) return false;
    if (!p.isPublished) return false;

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
    <div className="min-h-[85vh] py-10 bg-dark-bg text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gold-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <Link href={`/category/${slug}`} className="hover:text-gold-400 capitalize transition-colors">
            {categoryName}&apos;s Collection
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-bold text-gray-200 capitalize">{subcategoryName}</span>
        </div>

        {/* Subcategory Header */}
        <div className="bg-dark-surface rounded-2xl p-6 sm:p-10 border border-dark-border shadow-card mb-8">
          <span className="text-[10px] font-bold text-gold-400 uppercase tracking-widest bg-dark-card px-3 py-1 rounded-full border border-dark-border inline-block mb-2">
            {categoryName} &gt; {subcategoryName}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 capitalize tracking-tight">
            {categoryName}&apos;s {subcategoryName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 mt-2 leading-relaxed font-normal">
            {currentSubcategory?.description ||
              `Explore high quality cotton ${subcategoryName.toLowerCase()} crafted for daily comfort.`}
          </p>
        </div>

        {/* Products Grid or Clean Empty State */}
        {matchedProducts.length === 0 ? (
          <div className="bg-dark-surface rounded-2xl p-10 sm:p-12 text-center border border-dark-border max-w-lg mx-auto shadow-card space-y-4">
            <div className="w-14 h-14 bg-dark-card rounded-2xl flex items-center justify-center mx-auto text-gold-400 border border-dark-border">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-100 capitalize">
              No Products in {subcategoryName}
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
                Showing {matchedProducts.length} Product{matchedProducts.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {matchedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
