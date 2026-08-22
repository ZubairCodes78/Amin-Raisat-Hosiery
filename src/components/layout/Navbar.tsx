'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, Search, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { AnnouncementMarquee } from '@/components/home/AnnouncementMarquee';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { totalQuantity, openDrawer } = useCart();
  const { categories } = useStore();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryMenu, setActiveCategoryMenu] = useState<string | null>(null);

  // Scroll detection for subtle background transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full select-none">
      {/* 1. Continuous Motion Announcement Bar */}
      <AnnouncementMarquee />

      {/* 2. Main Brand Navbar */}
      <nav
        className={`w-full bg-white transition-all duration-300 border-b ${
          isScrolled ? 'border-gray-200 shadow-xs py-0' : 'border-gray-200/80 py-1'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-24 relative md:static">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center md:hidden absolute left-4 z-10">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 text-gray-800 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* New Brand Logo - Centered on Mobile */}
            <div className="flex items-center md:hidden absolute left-1/2 -translate-x-1/2">
              <Link href="/" className="flex items-center group">
                <div className="relative w-16 h-16 overflow-hidden flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                  <Image
                    src="/images/Logo.png"
                    alt="Amin Raisat Hosiery"
                    fill
                    className="object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Logo */}
            <div className="hidden md:flex items-center">
              <Link href="/" className="flex items-center group">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 overflow-hidden flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                  <Image
                    src="/images/Logo.png"
                    alt="Amin Raisat Hosiery"
                    fill
                    className="object-contain transition-transform duration-300 ease-out group-hover:scale-[1.02]"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation: Logo | Men | Women | Kids | Shop | About | Contact */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link
                href="/"
                className={`px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-colors rounded-md ${
                  pathname === '/' ? 'text-black bg-gray-100' : 'text-gray-700 hover:text-black hover:bg-gray-50'
                }`}
              >
                Home
              </Link>

              {/* Dynamic Category Menus with Clean Dropdown Mega-Menu */}
              {categories.map((category) => {
                const subcats = category.subcategories || [];
                const isHovered = activeCategoryMenu === category.id;
                const isActive = pathname.startsWith(`/category/${category.slug}`);

                return (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => setActiveCategoryMenu(category.id)}
                    onMouseLeave={() => setActiveCategoryMenu(null)}
                  >
                    <Link
                      href={`/category/${category.slug}`}
                      className={`px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-colors rounded-md flex items-center gap-1 ${
                        isActive
                          ? 'text-black bg-gray-100'
                          : 'text-gray-700 hover:text-black hover:bg-gray-50'
                      }`}
                    >
                      <span>{category.name}</span>
                      {subcats.length > 0 && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                            isHovered ? 'rotate-180 text-black' : ''
                          }`}
                        />
                      )}
                    </Link>

                    {/* Visually Organized Clean Dropdown Menu */}
                    {subcats.length > 0 && isHovered && (
                      <div className="absolute top-full left-0 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-3 py-2 border-b border-gray-100 mb-1 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {category.name} Collections
                          </span>
                          <Link
                            href={`/category/${category.slug}`}
                            className="text-[10px] font-semibold text-gray-900 hover:underline"
                          >
                            View All →
                          </Link>
                        </div>

                        <div className="space-y-0.5">
                          {subcats.map((sub) => (
                            <Link
                              key={sub.id}
                              href={`/category/${category.slug}/${sub.slug}`}
                              className="flex items-center justify-between px-3 py-2 text-xs text-gray-800 hover:text-black hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <span className="font-medium">{sub.name}</span>
                              {(!sub.productCount || sub.productCount === 0) && (
                                <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                  Coming Soon
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <Link
                href="/shop"
                className={`px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-colors rounded-md ${
                  pathname === '/shop'
                    ? 'text-black bg-gray-100'
                    : 'text-gray-700 hover:text-black hover:bg-gray-50'
                }`}
              >
                Shop
              </Link>

              <Link
                href="/about"
                className={`px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-colors rounded-md ${
                  pathname === '/about'
                    ? 'text-black bg-gray-100'
                    : 'text-gray-700 hover:text-black hover:bg-gray-50'
                }`}
              >
                About
              </Link>

              <Link
                href="/contact"
                className={`px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-colors rounded-md ${
                  pathname === '/contact'
                    ? 'text-black bg-gray-100'
                    : 'text-gray-700 hover:text-black hover:bg-gray-50'
                }`}
              >
                Contact
              </Link>
            </div>

            {/* Right Action Icons: Search & Cart (No Customer Account Icon) */}
            <div className="flex items-center gap-1.5 sm:gap-2 md:hidden absolute right-4 z-10">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  searchOpen ? 'bg-gray-100 text-black' : 'text-gray-700 hover:text-black hover:bg-gray-50 hover:shadow-glow-gold'
                }`}
                aria-label="Search products"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                type="button"
                onClick={openDrawer}
                className="relative p-2.5 bg-gray-950 hover:bg-black hover:shadow-glow-gold text-white rounded-lg transition-all duration-200 flex items-center justify-center ml-1 shadow-xs active:scale-[0.98]"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gold-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {totalQuantity}
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Right Action Icons */}
            <div className="hidden md:flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-1.5 rounded-lg transition-colors ${
                  searchOpen ? 'bg-gray-100 text-black' : 'text-gray-700 hover:text-black hover:bg-gray-50 hover:shadow-glow-gold'
                }`}
                aria-label="Search products"
              >
                <Search className="w-4 h-4 sm:w-4 sm:h-4" />
              </button>

              <button
                type="button"
                onClick={openDrawer}
                className="relative p-1.5 bg-gray-950 hover:bg-black hover:shadow-glow-gold text-white rounded-lg transition-all duration-200 flex items-center justify-center ml-1 shadow-xs active:scale-[0.98]"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-gold-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {totalQuantity}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Clean Integrated Search Bar Drawer */}
          {searchOpen && (
            <div className="py-3 border-t border-gray-200 animate-in fade-in">
              <form onSubmit={handleSearchSubmit} className="relative max-w-lg mx-auto">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search products by name, category, or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-20 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-black"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <button
                  type="submit"
                  className="absolute right-2 top-1.5 px-3 py-1 bg-gray-950 text-white rounded text-xs font-semibold hover:bg-black"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl max-h-[85vh] overflow-y-auto">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-gray-950 hover:bg-gray-50 rounded-lg"
            >
              Home
            </Link>

            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-gray-950 hover:bg-gray-50 rounded-lg"
            >
              Shop All Products
            </Link>

            {/* Mobile Dynamic Categories & Subcategories */}
            {categories.map((cat) => {
              const subcats = cat.subcategories || [];
              return (
                <div key={cat.id} className="space-y-1 pt-1 border-t border-gray-100">
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm font-bold text-gray-950 hover:bg-gray-50 rounded-lg"
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-gray-400 font-normal">View Category →</span>
                  </Link>

                  {subcats.length > 0 && (
                    <div className="pl-4 space-y-0.5">
                      {subcats.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/category/${cat.slug}/${sub.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 rounded"
                        >
                          <span>{sub.name}</span>
                          {(!sub.productCount || sub.productCount === 0) && (
                            <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded">
                              Coming Soon
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-2 border-t border-gray-100 space-y-1">
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                Contact Us
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
