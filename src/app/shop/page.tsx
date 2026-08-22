'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ProductCard } from '@/components/product/ProductCard';
import { ChevronRight, Filter, X, ArrowUpDown, Check } from 'lucide-react';
import { QualityType, SleeveType, ProductSize } from '@/types';

export default function ShopPage() {
  const { products, categories, subcategories } = useStore();

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedQuality, setSelectedQuality] = useState<string>('all');
  const [selectedSleeve, setSelectedSleeve] = useState<string>('all');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Available subcategories for selected category
  const activeSubcats = useMemo(() => {
    if (selectedCategory === 'all') return subcategories;
    const cat = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
    return subcategories.filter((s) => s.categoryId === cat?.id);
  }, [selectedCategory, categories, subcategories]);

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.isPublished);

    // Category Filter
    if (selectedCategory !== 'all') {
      const cat = categories.find((c) => c.slug === selectedCategory || c.id === selectedCategory);
      if (cat) {
        list = list.filter((p) => p.categoryId === cat.id);
      }
    }

    // Subcategory Filter
    if (selectedSubcategory !== 'all') {
      const sub = subcategories.find((s) => s.slug === selectedSubcategory || s.id === selectedSubcategory);
      if (sub) {
        list = list.filter((p) => p.subcategoryId === sub.id);
      }
    }

    // Quality Filter
    if (selectedQuality !== 'all') {
      list = list.filter((p) => p.variants.some((v) => v.quality === selectedQuality));
    }

    // Sleeve Filter
    if (selectedSleeve !== 'all') {
      list = list.filter((p) => p.variants.some((v) => v.sleeve === selectedSleeve));
    }

    // Size Filter
    if (selectedSize !== 'all') {
      list = list.filter((p) => p.variants.some((v) => v.size === selectedSize));
    }

    // Stock Filter
    if (inStockOnly) {
      list = list.filter((p) => p.variants.some((v) => v.isAvailable && v.stock > 0));
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        list = [...list].sort((a, b) => {
          const minA = Math.min(...a.variants.map((v) => v.price));
          const minB = Math.min(...b.variants.map((v) => v.price));
          return minA - minB;
        });
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => {
          const minA = Math.min(...a.variants.map((v) => v.price));
          const minB = Math.min(...b.variants.map((v) => v.price));
          return minB - minA;
        });
        break;
      case 'name-asc':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        list = [...list].sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'newest':
        list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      default:
        // 'featured'
        break;
    }

    return list;
  }, [
    products,
    categories,
    subcategories,
    selectedCategory,
    selectedSubcategory,
    selectedQuality,
    selectedSleeve,
    selectedSize,
    inStockOnly,
    sortBy,
  ]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedSubcategory('all');
    setSelectedQuality('all');
    setSelectedSleeve('all');
    setSelectedSize('all');
    setInStockOnly(false);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    selectedSubcategory !== 'all' ||
    selectedQuality !== 'all' ||
    selectedSleeve !== 'all' ||
    selectedSize !== 'all' ||
    inStockOnly;

  return (
    <div className="min-h-[75vh] py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-semibold text-gray-900">Shop All Products</span>
        </div>

        {/* Page Header */}
        <div className="border-b border-gray-200 pb-6 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950">
              All Products &amp; Collections
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Browse authentic combed cotton hosiery essentials tailored for Pakistan.
            </p>
          </div>

          {/* Sort selector & Mobile filter trigger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-gray-300 text-xs font-semibold text-gray-900 bg-white"
            >
              <Filter className="w-4 h-4" />
              <span>Filters {hasActiveFilters && '•'}</span>
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-500 hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A–Z</option>
                <option value="name-desc">Name: Z–A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Grid: Sidebar Filters + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 space-y-6 bg-gray-50/70 p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <Filter className="w-3.5 h-3.5" /> Filter Collection
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] font-semibold text-gray-500 hover:text-black"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">Category</label>
              <div className="space-y-1 text-xs">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedSubcategory('all');
                  }}
                  className={`block w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-gray-950 text-white font-semibold'
                      : 'text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCategory(c.slug);
                      setSelectedSubcategory('all');
                    }}
                    className={`block w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                      selectedCategory === c.slug
                        ? 'bg-gray-950 text-white font-semibold'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Subcategory Filter */}
            {activeSubcats.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <label className="text-xs font-bold text-gray-900 block">Subcategory</label>
                <div className="space-y-1 text-xs">
                  <button
                    onClick={() => setSelectedSubcategory('all')}
                    className={`block w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                      selectedSubcategory === 'all'
                        ? 'bg-gray-950 text-white font-semibold'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    All Subcategories
                  </button>
                  {activeSubcats.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSubcategory(s.slug)}
                      className={`block w-full text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                        selectedSubcategory === s.slug
                          ? 'bg-gray-950 text-white font-semibold'
                          : 'text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quality Filter */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <label className="text-xs font-bold text-gray-900 block">Quality</label>
              <div className="grid grid-cols-1 gap-1 text-xs">
                {['all', 'High Quality', 'Standard Quality'].map((q) => (
                  <button
                    key={q}
                    onClick={() => setSelectedQuality(q)}
                    className={`text-left px-2.5 py-1.5 rounded-lg transition-colors ${
                      selectedQuality === q
                        ? 'bg-gray-950 text-white font-semibold'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {q === 'all' ? 'All Qualities' : q}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Filter */}
            <div className="space-y-2 pt-2 border-t border-gray-200">
              <label className="text-xs font-bold text-gray-900 block">Size</label>
              <div className="flex flex-wrap gap-1">
                {['all', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      selectedSize === s
                        ? 'border-gray-950 bg-gray-950 text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {s === 'all' ? 'All' : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Available Products Only */}
            <div className="pt-2 border-t border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-900">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-gray-300 text-gray-950 focus:ring-black"
                />
                <span>Available Products Only</span>
              </label>
            </div>
          </aside>

          {/* Products Grid Area */}
          <div className="lg:col-span-9">
            {filteredProducts.length === 0 ? (
              <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200 space-y-3">
                <p className="text-sm font-bold text-gray-900">No products found matching your filters.</p>
                <p className="text-xs text-gray-500">Try adjusting or clearing your filters to see more results.</p>
                <button
                  onClick={clearAllFilters}
                  className="mt-2 inline-block px-4 py-2 bg-gray-950 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-4">
                  Showing {filteredProducts.length} Product{filteredProducts.length > 1 ? 's' : ''}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xs h-full p-6 overflow-y-auto space-y-6 shadow-2xl transition-transform duration-300 ease-out animate-in slide-in-from-right">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3">
              <h3 className="font-bold text-sm text-gray-950">Filters</h3>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1 text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategory('all');
                }}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mobile Quality */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">Quality</label>
              <select
                value={selectedQuality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-xs"
              >
                <option value="all">All Qualities</option>
                <option value="High Quality">High Quality</option>
                <option value="Standard Quality">Standard Quality</option>
              </select>
            </div>

            {/* Mobile Size */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900 block">Size</label>
              <div className="flex flex-wrap gap-1">
                {['all', 'S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                      selectedSize === s
                        ? 'border-gray-950 bg-gray-950 text-white'
                        : 'border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    {s === 'all' ? 'All' : s}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex gap-2">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-2.5 bg-gray-100 text-gray-800 font-semibold text-xs rounded-lg"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-gray-950 text-white font-semibold text-xs rounded-lg"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
