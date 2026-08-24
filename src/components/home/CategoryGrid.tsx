'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, User, Users, Baby, Layers, ChevronRight } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const CategoryGrid: React.FC = () => {
  const { categories, products } = useStore();

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'men':
        return User;
      case 'women':
        return Users;
      case 'kids':
        return Baby;
      default:
        return Layers;
    }
  };

  return (
    <section className="py-14 bg-light-bg dark:bg-dark-bg border-b border-light-border dark:border-dark-border transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <span className="text-[10px] font-bold text-[#A07D38] dark:text-gold-500 uppercase tracking-widest">
              Store Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-gray-100 mt-1">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 dark:text-gray-400 mt-1 font-normal">
              Select a category to browse pure cotton vests, innerwear, and essentials.
            </p>
          </div>
          <Link
            href="/shop"
            className="mt-4 sm:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-[#A07D38] dark:text-gold-400 hover:text-[#C9A96A] transition-colors"
          >
            <span>Browse Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.slug);
            const subcats = category.subcategories || [];

            // Calculate active published products in this category
            const activeCategoryProducts = products.filter((p) => {
              if (!p.isPublished) return false;
              return (
                p.categoryId === category.id ||
                p.categoryId === category.slug ||
                (category.slug === 'men' && (!p.categoryId || p.categoryId === 'cat-men')) ||
                (category.slug === 'women' && p.categoryId === 'cat-women') ||
                (category.slug === 'kids' && p.categoryId === 'cat-kids')
              );
            });

            const hasActiveProducts = activeCategoryProducts.length > 0;

            return (
              <div
                key={category.id}
                className="rounded-2xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-surface p-6 flex flex-col justify-between card-hover-lift min-h-[300px] shadow-sm dark:shadow-card"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl bg-champagne-50 dark:bg-dark-card border border-light-border dark:border-dark-border text-[#A07D38] dark:text-gold-400 flex items-center justify-center shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    {hasActiveProducts && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                        {activeCategoryProducts.length} Product{activeCategoryProducts.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-charcoal-900 dark:text-gray-100 hover:text-[#C9A96A] transition-colors">
                      <Link href={`/category/${category.slug}`}>{category.name}&apos;s Collection</Link>
                    </h3>
                    <p className="text-xs text-charcoal-500 dark:text-gray-400 mt-1 leading-relaxed line-clamp-2 font-normal">
                      {category.description}
                    </p>
                  </div>

                  {/* Subcategories Pills */}
                  {subcats.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-light-border dark:border-dark-border">
                      <span className="text-[10px] font-bold text-charcoal-400 dark:text-gray-500 uppercase tracking-wider block mb-2">
                        Subcategories:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {subcats.map((sub) => {
                          const subHasProducts = products.some(
                            (p) =>
                              p.isPublished &&
                              (p.subcategoryId === sub.id || p.subcategoryId === sub.slug)
                          );

                          return (
                            <Link
                              key={sub.id}
                              href={`/category/${category.slug}/${sub.slug}`}
                              className="text-[11px] font-medium bg-light-elevated dark:bg-dark-card hover:bg-light-hover dark:hover:bg-dark-hover hover:text-[#A07D38] dark:hover:text-gold-400 text-charcoal-700 dark:text-gray-300 border border-light-border dark:border-dark-border px-2.5 py-1 rounded-md transition-colors shadow-2xs inline-flex items-center gap-1.5"
                            >
                              <span>{sub.name}</span>
                              {subHasProducts && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-2">
                  <Link
                    href={`/category/${category.slug}`}
                    className="w-full py-2.5 px-4 bg-light-elevated dark:bg-dark-card hover:bg-champagne-500 hover:text-black text-charcoal-900 dark:text-gray-200 border border-light-border dark:border-dark-border hover:border-champagne-500 rounded-lg text-xs font-bold flex items-center justify-between transition-all duration-200 shadow-2xs"
                  >
                    <span>View Collection</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
