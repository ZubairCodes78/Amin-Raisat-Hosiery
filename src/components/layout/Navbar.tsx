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
        className={`w-full bg-[#0D0D12]/95 backdrop-blur-md transition-all duration-300 border-b ${
          isScrolled ? 'border-dark-border shadow-elevation py-0.5' : 'border-dark-border/80 py-1'
        }`}
      >
        <div className="mx-auto w-full md:w-[calc(100%-48px)] max-w-[1240px] px-3 sm:px-6 md:px-0">
          <div className="flex items-center justify-between h-16 md:h-18">
            
            {/* === MOBILE NAVBAR ROW (md:hidden) === */}
            <div className="flex items-center justify-between w-full md:hidden">
              {/* Left: Mobile Hamburger Button (40px touch target) */}
              <div className="flex items-center flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-10 h-10 flex items-center justify-center text-gray-200 hover:text-gold-400 hover:bg-[#15151B] active:bg-[#1B1B22] rounded-xl transition-colors"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

              {/* Center: Mobile Header Logo (Enhanced scale +15-25%, crisp, centered) */}
              <div className="flex items-center justify-center flex-1 px-1 sm:px-2 min-w-0">
                <Link href="/" className="flex items-center justify-center py-1 group">
                  <div className="relative w-36 xs:w-44 sm:w-52 h-12 xs:h-13 sm:h-15 overflow-hidden flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                    <Image
                      src="/images/header logo.png"
                      alt="Amin Raisat Hosiery"
                      fill
                      sizes="(max-width: 640px) 210px, 240px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </Link>
              </div>

              {/* Right: Mobile Action Buttons (Consistent 40px touch targets, balanced spacing) */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                {/* Search Trigger */}
                <button
                  type="button"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                    searchOpen
                      ? 'bg-[#15151B] text-gold-400 border border-[#2A2A32]'
                      : 'text-gray-200 hover:text-gold-400 hover:bg-[#15151B]'
                  }`}
                  aria-label="Search products"
                >
                  <Search className="w-4.5 h-4.5" />
                </button>

                {/* Customer Account Button */}
                <Link
                  href={user ? '/account' : '/login'}
                  className="w-10 h-10 flex items-center justify-center text-gray-200 hover:text-gold-400 hover:bg-[#15151B] rounded-xl transition-colors"
                  aria-label="Customer Account"
                  title={user ? 'My Account' : 'Sign In'}
                >
                  <User className="w-4.5 h-4.5" />
                </Link>

                {/* Shopping Cart Button */}
                <button
                  type="button"
                  onClick={openDrawer}
                  className="relative w-10 h-10 bg-gold-500 hover:bg-gold-400 text-black rounded-xl transition-all duration-200 flex items-center justify-center shadow-xs active:scale-[0.96]"
                  aria-label="Shopping Cart"
                >
                  <ShoppingBag className="w-4.5 h-4.5 text-black stroke-[2.2]" />
                  {totalQuantity > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-extrabold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border border-black shadow-xs">
                      {totalQuantity}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* === DESKTOP NAVBAR (hidden md:flex) === */}
            <div className="hidden md:flex items-center justify-between w-full">
              {/* Desktop Header Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center group py-0.5">
                  <div className="relative w-48 lg:w-52 h-12 lg:h-13 overflow-hidden flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                    <Image
                      src="/images/header logo.png"
                      alt="Amin Raisat Hosiery"
                      fill
                      sizes="240px"
                      className="object-contain"
                      priority
                    />
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation Links */}
              <div className="flex items-center space-x-1 lg:space-x-1.5">
                <Link
                  href="/"
                  className={`px-2.5 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors rounded-lg ${
                    pathname === '/'
                      ? 'text-gold-400 bg-dark-surface border border-dark-border'
                      : 'text-gray-300 hover:text-gold-400 hover:bg-dark-surface'
                  }`}
                >
                  Home
                </Link>

                {/* Dynamic Category Menus with Dropdowns */}
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
                        className={`px-2.5 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors rounded-lg flex items-center gap-1 ${
                          isActive
                            ? 'text-gold-400 bg-dark-surface border border-dark-border'
                            : 'text-gray-300 hover:text-gold-400 hover:bg-dark-surface'
                        }`}
                      >
                        <span>{category.name}</span>
                        {subcats.length > 0 && (
                          <ChevronDown
                            className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${
                              isHovered ? 'rotate-180 text-gold-400' : ''
                            }`}
                          />
                        )}
                      </Link>

                      {/* Dropdown Menu */}
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
                            {subcats.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/category/${category.slug}/${sub.slug}`}
                                className="flex items-center justify-between px-3 py-2 text-xs text-gray-300 hover:text-gold-400 hover:bg-dark-hover rounded-md transition-colors"
                              >
                                <span className="font-medium">{sub.name}</span>
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
                  className={`px-2.5 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors rounded-lg ${
                    pathname === '/shop'
                      ? 'text-gold-400 bg-dark-surface border border-dark-border'
                      : 'text-gray-300 hover:text-gold-400 hover:bg-dark-surface'
                  }`}
                >
                  Shop
                </Link>

                <Link
                  href="/about"
                  className={`px-2.5 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors rounded-lg ${
                    pathname === '/about'
                      ? 'text-gold-400 bg-dark-surface border border-dark-border'
                      : 'text-gray-300 hover:text-gold-400 hover:bg-dark-surface'
                  }`}
                >
                  About
                </Link>

                <Link
                  href="/contact"
                  className={`px-2.5 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors rounded-lg ${
                    pathname === '/contact'
                      ? 'text-gold-400 bg-dark-surface border border-dark-border'
                      : 'text-gray-300 hover:text-gold-400 hover:bg-dark-surface'
                  }`}
                >
                  Contact
                </Link>
              </div>

              {/* Desktop Right Actions: Search, Customer Account, Cart */}
              <div className="flex items-center gap-1.5 lg:gap-2">
                {/* Search Trigger */}
                <button
                  type="button"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className={`w-9 h-9 lg:w-10 lg:h-10 flex items-center justify-center rounded-xl transition-colors ${
                    searchOpen
                      ? 'bg-dark-surface text-gold-400 border border-dark-border'
                      : 'text-gray-300 hover:text-gold-400 hover:bg-dark-surface'
                  }`}
                  aria-label="Search products"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Customer Account Button */}
                <Link
                  href={user ? '/account' : '/login'}
                  className="h-9 lg:h-10 px-3 text-gray-300 hover:text-gold-400 hover:bg-dark-surface rounded-xl transition-colors flex items-center gap-1.5 border border-transparent hover:border-dark-border"
                  aria-label="Customer Account"
                  title={user ? 'My Account' : 'Sign In'}
                >
                  <User className="w-4 h-4" />
                  <span className="text-[11px] font-semibold text-gray-200">
                    {user ? 'Account' : 'Sign In'}
                  </span>
                </Link>

                {/* Shopping Cart Drawer Trigger */}
                <button
                  type="button"
                  onClick={openDrawer}
                  className="relative h-9 lg:h-10 px-3.5 bg-gold-500 hover:bg-gold-400 text-black rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs hover:shadow-glow-gold active:scale-[0.98]"
                  aria-label="Shopping Cart"
                >
                  <ShoppingBag className="w-4 h-4 text-black stroke-[2.2]" />
                  <span className="text-xs font-extrabold text-black">Cart</span>
                  {totalQuantity > 0 && (
                    <span className="bg-black text-gold-400 text-[10px] font-extrabold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ml-0.5">
                      {totalQuantity}
                    </span>
                  )}
                </button>
              </div>
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
                  className="w-full pl-10 pr-24 py-2.5 bg-dark-surface border border-dark-border text-gray-100 placeholder-gray-400 rounded-xl text-xs focus:outline-none focus:border-gold-500"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <button
                  type="submit"
                  className="absolute right-2 top-1.5 px-3 py-1 bg-gold-500 text-black rounded-lg text-xs font-bold hover:bg-gold-400"
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

              return (
                <div key={cat.id} className="space-y-1 pt-1 border-t border-dark-border">
                  <Link
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between px-3 py-2 text-sm font-bold text-gray-100 hover:text-gold-400 hover:bg-dark-hover rounded-lg"
                  >
                    <span>{cat.name}</span>
                    <span className="text-xs text-gold-400 font-normal">View All →</span>
                  </Link>

                  {subcats.length > 0 && (
                    <div className="pl-4 space-y-0.5">
                      {subcats.map((sub) => (
                        <Link
                          key={sub.id}
                          href={`/category/${cat.slug}/${sub.slug}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-1.5 text-xs text-gray-400 hover:text-gold-400 hover:bg-dark-hover rounded"
                        >
                          <span>{sub.name}</span>
                        </Link>
                      ))}
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
