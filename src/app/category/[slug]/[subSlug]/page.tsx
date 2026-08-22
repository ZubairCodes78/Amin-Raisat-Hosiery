'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';
import { ChevronRight, ArrowLeft, Package, ShoppingBag } from 'lucide-react';

export default function SubcategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const subSlug = params?.subSlug as string;
  const { categories, products } = useStore();

  const currentCategory = categories.find((c) => c.slug === slug);
  const currentSubcategory = currentCategory?.subcategories?.find((s) => s.slug === subSlug);

  const matchedProducts = products.filter((p) => {
    if (!currentCategory) return false;
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
    <div className="min-h-[75vh] py-10 bg-gray-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/category/${slug}`} className="hover:text-gray-900 capitalize">
            {categoryName}&apos;s Collection
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-bold text-gray-950 capitalize">{subcategoryName}</span>
        </div>

        {/* Subcategory Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-xs mb-8">
          <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200 inline-block mb-2">
            {categoryName} &gt; {subcategoryName}
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 capitalize">
            {categoryName}&apos;s {subcategoryName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed font-normal">
            {currentSubcategory?.description ||
              `Explore high quality cotton ${subcategoryName.toLowerCase()} crafted for daily comfort.`}
          </p>
        </div>

        {/* Products Grid or Clean Coming Soon */}
        {matchedProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 max-w-lg mx-auto shadow-xs space-y-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-700 border border-gray-200">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-brand-950 capitalize">
              {subcategoryName} Collection Coming Soon
            </h3>
            <p className="text-xs text-brand-500 leading-relaxed">
              We are manufacturing authentic cotton essentials for {subcategoryName.toLowerCase()}. The store owner will add products to this section soon.
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
