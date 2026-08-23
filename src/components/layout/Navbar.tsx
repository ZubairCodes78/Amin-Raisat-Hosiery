'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, Search, ChevronDown, User } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementMarquee } from '@/components/home/AnnouncementMarquee';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { totalQuantity, openDrawer } = useCart();
  const { categories } = useStore();
  const { user } = useAuth();

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
        className={`w-full bg-[#09090c]/95 backdrop-blur-md transition-all duration-300 border-b ${
          isScrolled ? 'border-dark-border shadow-elevation py-0.5' : 'border-dark-border/80 py-1.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 sm:h-24 relative md:static">
            {/* Mobile Hamburger Button */}
            <div className="flex items-center md:hidden absolute left-0 z-10">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-300 hover:text-gold-400 hover:bg-dark-surface rounded-lg transition-colors"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Header Logo - Centered on Mobile */}
            <div className="flex items-center md:hidden absolute left-1/2 -translate-x-1/2">
              <Link href="/" className="flex items-center group py-1">
                <div className="relative w-44 h-14 overflow-hidden flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.02] drop-shadow-sm">
                  <Image
                    src="/images/header logo.png"
                    alt="Amin Raisat Hosiery"
                    fill
                    sizes="200px"
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Header Logo */}
            <div className="hidden md:flex items-center">
              <Link href="/" className="flex items-center group py-1">
                <div className="relative w-52 sm:w-60 lg:w-64 h-16 sm:h-20 overflow-hidden flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.02] drop-shadow-sm">
                  <Image
                    src="/images/header logo.png"
                    alt="Amin Raisat Hosiery"
                    fill
                    sizes="300px"
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Desktop Navigation: Home | Men | Women | Kids | Shop | About | Contact */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <Link
                href="/"
                className={`px-3 py-2 text-xs font-bold tracking-wide uppercase transition-colors rounded-md ${
                  pathname === '/' ? 'text-gold-400 bg-dark-surface border border-dark-border' : 'text-gray-300 hover:text-gold-400 hover:bg-dark-surface'
                }`}
              >
                Home
              </Link>

              {/* Dynamic Category Menus with Dropdowns */}
              {categories.map((category) => {
                const subcats = category.subcategories || [];
                const isHovered = activeCategoryMenu === category.id;
                const isActive = pathname.startsWith(`/category/${category.slug}`);
                const isComingSoon = !category.productCount || category.productCount === 0;

                return (
                  <div
                    key={category.id}
                    className="relative"
                    onMouseEnter={() => setActiveCategoryMenu(category.id)}
                    onMouseLeave={() => setActiveCategoryMenu(null)}
                  >
                    <Link
                      href={`/category/${category.slug}`}
                      className={`px-3 py-2 text-xs font-bold tracking-wide uppercase transition-colors rounded-md flex items-center gap-1 ${
                        isActive
                          ? 'text-gold-400 bg-dark-surface border border-dark-border'
                          : 'text-gray-300 hover:text-gold-400 hover:bg-dark-surface'
                      }`}
                    >
                      <span>{category.name}</span>
                      {isComingSoon && (
                        <span className="text-[9px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.2 rounded ml-0.5 normal-case">
                          Coming Soon
                        </span>
                      )}
                      {subcats.length > 0 && (
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                            isHovered ? 'rotate-180 text-gold-400' : ''
                          }`}
                        />
                      )}
                    </Link>

                    {/* Visually Organized Clean Dropdown Menu */}
                    {subcats.length > 0 && isHovered && (
                      <div className="absolute top-full left-0 w-64 bg-dark-surface rounded-xl shadow-elevation border border-dark-border p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-3 py-2 border-b border-dark-border mb-1 flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {category.name} Collections
                          </span>
                          <Link
                            href={`/category/${category.slug}`}
                            className="text-[10px] font-semibold text-gold-400 hover:underline"
                          >
                            View All →
                          </Link>
                        </div>

                        <div className="space-y-0.5">
                          {subcats.map((sub) => {
                            const subComingSoon = !sub.productCount || sub.productCount === 0;
                            return (
                              <Link
                                key={sub.id}
                                href={`/category/${category.slug}/${sub.slug}`}
                                className="flex items-center justify-between px-3 py-2 text-xs text-gray-300 hover:text-gold-400 hover:bg-dark-hover rounded-md transition-colors"
                              >
                                <span className="font-medium">{sub.name}</span>
                                {subComingSoon && (
                                  <span className="text-[9px] text-amber-300/80 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                                    Coming Soon
                                  </span>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              <Link
                href="/shop"
                className={`px-3 py-2 text-xs font-bold tracking-wide uppercase transition-colors rounded-md ${
                  pathname === '/shop'
                    ? 'text-gold-400 bg-dark-surface border border-dark-border'
                    : 'text-gray-300 hover:text-gold-400 hover:bg-dark-surface'
                }`}
              >
                Shop
              </Link>

              <Link
                href="/about"
                className={`px-3 py-2 text-xs font-bold tracking-wide uppercase transition-colors rounded-md ${
                  pathname === '/about'
                    ? 'text-gold-400 bg-dark-surface border border-dark-border'
                    : 'text-gray-300 hover:text-gold-400 hover:bg-dark-surface'
                }`}
              >
                About
              </Link>

              <Link
                href="/contact"
                className={`px-3 py-2 text-xs font-bold tracking-wide uppercase transition-colors rounded-md ${
                  pathname === '/contact'
                    ? 'text-gold-400 bg-dark-surface border border-dark-border'
                    : 'text-gray-300 hover:text-gold-400 hover:bg-dark-surface'
                }`}
              >
                Contact
              </Link>
            </div>

            {/* Right Action Icons: Search, Customer Account, Cart */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Search Trigger */}
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-lg transition-colors ${
                  searchOpen ? 'bg-dark-surface text-gold-400' : 'text-gray-300 hover:text-gold-400 hover:bg-dark-surface'
                }`}
                aria-label="Search products"
              >
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>

              {/* Customer Account Button */}
              <Link
                href={user ? '/account' : '/login'}
                className="p-2 text-gray-300 hover:text-gold-400 hover:bg-dark-surface rounded-lg transition-colors flex items-center gap-1.5"
                aria-label="Customer Account"
                title={user ? 'My Account' : 'Sign In'}
              >
                <User className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                {user && (
                  <span className="hidden lg:inline text-[11px] font-semibold text-gold-400 max-w-[80px] truncate">
                    Account
                  </span>
                )}
              </Link>

              {/* Shopping Cart Drawer Trigger */}
              <button
                type="button"
                onClick={openDrawer}
                className="relative p-2.5 bg-gold-500 hover:bg-gold-400 text-black rounded-lg transition-all duration-200 flex items-center justify-center shadow-xs hover:shadow-glow-gold active:scale-[0.98]"
                aria-label="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4 text-black stroke-[2.2]" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-black shadow-xs">
                    {totalQuantity}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Integrated Search Bar Drawer */}
          {searchOpen && (
            <div className="py-3 border-t border-dark-border animate-in fade-in">
              <form onSubmit={handleSearchSubmit} className="relative max-w-lg mx-auto">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search products by name, category, or style..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 bg-dark-surface border border-dark-border text-gray-100 placeholder-gray-500 rounded-lg text-xs focus:outline-none focus:border-gold-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <button
                  type="submit"
                  className="absolute right-2 top-1.5 px-3 py-1 bg-gold-500 text-black rounded text-xs font-bold hover:bg-gold-400"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-dark-border bg-dark-surface px-4 pt-3 pb-6 space-y-2 shadow-elevation max-h-[85vh] overflow-y-auto">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-gray-200 hover:text-gold-400 hover:bg-dark-hover rounded-lg"
            >
              Home
            </Link>

            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-sm font-semibold text-gray-200 hover:text-gold-400 hover:bg-dark-hover rounded-lg"
            >
              Shop All Products
            </Link>

            {/* Mobile Dynamic Categories */}
            {categories.map((cat) => {
              const subcats = cat.subcategories || [];
              const isComingSoon = !cat.productCount || cat.productCount === 0;

              return (
                <div key={cat.id} className="space-y-1 pt-1 border-t border-dark-border">
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm font-bold text-gray-100 hover:text-gold-400 hover:bg-dark-hover rounded-lg"
                  >
                    <span>{cat.name}</span>
                    {isComingSoon ? (
                      <span className="text-[10px] text-amber-300 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded font-normal">
                        Coming Soon
                      </span>
                    ) : (
                      <span className="text-xs text-gold-400 font-normal">View All →</span>
                    )}
                  </Link>

                  {subcats.length > 0 && (
                    <div className="pl-4 space-y-0.5">
                      {subcats.map((sub) => {
                        const subComingSoon = !sub.productCount || sub.productCount === 0;
                        return (
                          <Link
                            key={sub.id}
                            href={`/category/${cat.slug}/${sub.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center justify-between px-3 py-1.5 text-xs text-gray-400 hover:text-gold-400 hover:bg-dark-hover rounded"
                          >
                            <span>{sub.name}</span>
                            {subComingSoon && (
                              <span className="text-[9px] text-amber-300/80 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.2 rounded">
                                Coming Soon
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="pt-2 border-t border-dark-border space-y-1">
              <Link
                href={user ? '/account' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-gold-400 hover:bg-dark-hover rounded-lg"
              >
                {user ? 'My Customer Account' : 'Sign In / Register'}
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-gray-300 hover:text-gold-400 hover:bg-dark-hover rounded-lg"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-sm font-semibold text-gray-300 hover:text-gold-400 hover:bg-dark-hover rounded-lg"
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
