'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X, Search, ChevronDown, ChevronRight, User, Layers } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementMarquee } from '@/components/home/AnnouncementMarquee';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { totalQuantity, openDrawer } = useCart();
  const { categories, subcategories, settings } = useStore();
  const { user, profile } = useAuth();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Desktop Categories Dropdown / Mega Menu
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mobile Accordion States
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(true);
  const [expandedMobileCategory, setExpandedMobileCategory] = useState<string | null>(null);

  // Filter and sort active categories dynamically from Supabase
  const activeCategories = categories
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  // Get active subcategories for a given category sorted by displayOrder
  const getActiveSubcategoriesForCat = (catId: string, directSubs?: any[]) => {
    const rawList = (directSubs && directSubs.length > 0)
      ? directSubs
      : subcategories.filter((s) => s.categoryId === catId);

    return rawList
      .filter((s) => s.isActive !== false)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  };

  // Scroll detection for subtle background transition
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setIsCategoriesDropdownOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleMouseEnterCategories = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setIsCategoriesDropdownOpen(true);
  };

  const handleMouseLeaveCategories = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setIsCategoriesDropdownOpen(false);
    }, 180);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchOpen(false);
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const isCategoryActive = pathname.startsWith('/category');

  return (
    <header className="sticky top-0 z-40 w-full select-none">
      {/* 1. Continuous Motion Announcement Bar */}
      <AnnouncementMarquee />

      {/* 2. Main Brand Navbar */}
      <nav
        className={`w-full bg-[#101114]/95 backdrop-blur-md transition-all duration-300 border-b ${
          isScrolled ? 'border-[#30343A] shadow-elevation py-0.5' : 'border-[#30343A]/80 py-1'
        }`}
      >
        <div className="mx-auto w-full md:w-[calc(100%-48px)] max-w-[1240px] px-3 sm:px-6 md:px-0">
          <div className="flex items-center justify-between h-16 md:h-18">
            
            {/* ========================================================================= */}
            {/* MOBILE NAVBAR ROW (md:hidden) */}
            {/* ========================================================================= */}
            <div className="relative flex items-center justify-between w-full md:hidden min-h-[52px]">
              {/* Left: Mobile Hamburger Button (44px touch target) */}
              <div className="flex items-center flex-shrink-0 z-10">
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="w-11 h-11 flex items-center justify-center text-[#F1F0EC] hover:text-[#C9A96A] hover:bg-[#1D2025] active:bg-[#202329] rounded-xl transition-colors"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>

              {/* Center: Mobile Header Logo (Centered accurately using absolute layout with pointer-events-auto) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-12 sm:px-14">
                <Link href="/" className="pointer-events-auto flex items-center justify-center py-0.5 group">
                  <div className="relative w-[92px] xs:w-[100px] sm:w-[110px] h-11 xs:h-12 overflow-hidden flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                    <Image
                      src="/images/header logo.png"
                      alt="Amin Raisat Hosiery"
                      fill
                      sizes="(max-width: 640px) 120px, 140px"
                      className="object-contain object-center"
                      priority
                    />
                  </div>
                </Link>
              </div>

              {/* Right: Mobile Action Buttons (Consistent 40-44px touch targets) */}
              <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0 z-10">
                {/* Search Trigger */}
                <button
                  type="button"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                    searchOpen
                      ? 'bg-[#1D2025] text-[#C9A96A] border border-[#30343A]'
                      : 'text-[#F1F0EC] hover:text-[#C9A96A] hover:bg-[#1D2025]'
                  }`}
                  aria-label="Search products"
                >
                  <Search className="w-4.5 h-4.5" />
                </button>

                {/* Customer Account Button */}
                <Link
                  href={user ? '/account' : '/login'}
                  className="w-10 h-10 flex items-center justify-center text-[#F1F0EC] hover:text-[#C9A96A] hover:bg-[#1D2025] rounded-xl transition-colors"
                  aria-label="Customer Account"
                  title={user ? 'My Account' : 'Sign In'}
                >
                  <User className="w-4.5 h-4.5" />
                </Link>

                {/* Shopping Cart Button */}
                <button
                  type="button"
                  onClick={openDrawer}
                  className="relative w-10 h-10 bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] rounded-xl transition-all duration-200 flex items-center justify-center shadow-xs active:scale-[0.96]"
                  aria-label="Shopping Cart"
                >
                  <ShoppingBag className="w-4.5 h-4.5 text-[#101114] stroke-[2.2]" />
                  {totalQuantity > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#D96B6B] text-white text-[10px] font-extrabold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border border-[#101114] shadow-xs">
                      {totalQuantity}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* DESKTOP NAVBAR (hidden md:flex) */}
            {/* ========================================================================= */}
            <div className="hidden md:flex items-center justify-between w-full">
              {/* Desktop Header Logo */}
              <div className="flex items-center">
                <Link href="/" className="flex items-center group py-0.5">
                  <div className="relative w-52 lg:w-60 h-13 lg:h-14 overflow-hidden flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                    <Image
                      src="/images/header logo.png"
                      alt="Amin Raisat Hosiery"
                      fill
                      sizes="(max-width: 1024px) 210px, 240px"
                      className="object-contain object-left"
                      priority
                    />
                  </div>
                </Link>
              </div>

              {/* Desktop Navigation Links: HOME | CATEGORIES ▾ | SHOP | ABOUT | CONTACT */}
              <div className="flex items-center space-x-1 lg:space-x-1.5">
                {/* 1. HOME */}
                <Link
                  href="/"
                  className={`px-3 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors rounded-lg ${
                    pathname === '/'
                      ? 'text-[#C9A96A] bg-[#17191D] border border-[#30343A]'
                      : 'text-[#B4B5BA] hover:text-[#C9A96A] hover:bg-[#17191D]'
                  }`}
                >
                  Home
                </Link>

                {/* 2. DYNAMIC CATEGORIES ▾ DROPDOWN / MEGA MENU */}
                <div
                  className="relative"
                  onMouseEnter={handleMouseEnterCategories}
                  onMouseLeave={handleMouseLeaveCategories}
                >
                  <button
                    type="button"
                    onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                    className={`px-3 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors rounded-lg flex items-center gap-1.5 ${
                      isCategoryActive || isCategoriesDropdownOpen
                        ? 'text-[#C9A96A] bg-[#17191D] border border-[#30343A]'
                        : 'text-[#B4B5BA] hover:text-[#C9A96A] hover:bg-[#17191D]'
                    }`}
                    aria-expanded={isCategoriesDropdownOpen}
                  >
                    <span>Categories</span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-[#85888E] transition-transform duration-200 ${
                        isCategoriesDropdownOpen ? 'rotate-180 text-[#C9A96A]' : ''
                      }`}
                    />
                  </button>

                  {/* Desktop Dropdown / Mega Menu Container (Controlled max width, scalable) */}
                  {isCategoriesDropdownOpen && (
                    <div
                      className={`absolute top-full left-0 mt-1 bg-[#17191D] rounded-2xl shadow-elevation border border-[#30343A] p-4 z-50 animate-in fade-in slide-in-from-top-1 duration-150 max-h-[75vh] overflow-y-auto ${
                        activeCategories.length > 3
                          ? 'w-[560px] lg:w-[640px]'
                          : activeCategories.length > 1
                          ? 'w-[420px]'
                          : 'w-[290px]'
                      }`}
                    >
                      <div className="px-3 py-2 border-b border-[#30343A] mb-3 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-[#85888E] uppercase tracking-wider flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#C9A96A]" />
                          <span>Garment Collections ({activeCategories.length})</span>
                        </span>
                        <Link
                          href="/shop"
                          onClick={() => setIsCategoriesDropdownOpen(false)}
                          className="text-[11px] font-semibold text-[#C9A96A] hover:text-[#D8BD88] transition-colors"
                        >
                          View All Products &rarr;
                        </Link>
                      </div>

                      {/* Adaptive Grid for Categories */}
                      <div
                        className={`grid gap-4 ${
                          activeCategories.length > 3
                            ? 'grid-cols-3'
                            : activeCategories.length > 1
                            ? 'grid-cols-2'
                            : 'grid-cols-1'
                        }`}
                      >
                        {activeCategories.map((category) => {
                          const subs = getActiveSubcategoriesForCat(category.id, category.subcategories);

                          return (
                            <div key={category.id} className="space-y-2 p-2 rounded-xl hover:bg-[#1D2025]/50 transition-colors">
                              {/* Main Category Header Link */}
                              <Link
                                href={`/category/${category.slug}`}
                                onClick={() => setIsCategoriesDropdownOpen(false)}
                                className="block font-bold text-xs text-[#F1F0EC] hover:text-[#C9A96A] transition-colors border-b border-[#30343A]/60 pb-1.5"
                              >
                                <span>{category.name}</span>
                              </Link>

                              {/* Subcategories under this category */}
                              {subs.length > 0 ? (
                                <ul className="space-y-1 pl-1">
                                  {subs.map((sub) => (
                                    <li key={sub.id}>
                                      <Link
                                        href={`/category/${category.slug}/${sub.slug}`}
                                        onClick={() => setIsCategoriesDropdownOpen(false)}
                                        className="text-[11px] text-[#85888E] hover:text-[#F1F0EC] hover:underline flex items-center gap-1 transition-colors py-0.5"
                                      >
                                        <span className="text-[#C9A96A]/60">&bull;</span>
                                        <span>{sub.name}</span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-[10px] text-[#85888E] italic pl-1">
                                  View all {category.name.toLowerCase()} items
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom Banner inside Dropdown */}
                      <div className="mt-3 pt-2.5 border-t border-[#30343A] flex items-center justify-between text-[11px] text-[#85888E] px-2">
                        <span>Free Delivery Across Pakistan on 3+ Pieces</span>
                        <span className="text-[#3FB982] font-semibold">100% Combed Cotton</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. SHOP */}
                <Link
                  href="/shop"
                  className={`px-3 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors rounded-lg ${
                    pathname === '/shop'
                      ? 'text-[#C9A96A] bg-[#17191D] border border-[#30343A]'
                      : 'text-[#B4B5BA] hover:text-[#C9A96A] hover:bg-[#17191D]'
                  }`}
                >
                  Shop
                </Link>

                {/* 4. ABOUT */}
                <Link
                  href="/about"
                  className={`px-3 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors rounded-lg ${
                    pathname === '/about'
                      ? 'text-[#C9A96A] bg-[#17191D] border border-[#30343A]'
                      : 'text-[#B4B5BA] hover:text-[#C9A96A] hover:bg-[#17191D]'
                  }`}
                >
                  About
                </Link>

                {/* 5. CONTACT */}
                <Link
                  href="/contact"
                  className={`px-3 py-1.5 text-xs font-bold tracking-wide uppercase transition-colors rounded-lg ${
                    pathname === '/contact'
                      ? 'text-[#C9A96A] bg-[#17191D] border border-[#30343A]'
                      : 'text-[#B4B5BA] hover:text-[#C9A96A] hover:bg-[#17191D]'
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
                      ? 'bg-[#17191D] text-[#C9A96A] border border-[#30343A]'
                      : 'text-[#B4B5BA] hover:text-[#C9A96A] hover:bg-[#17191D]'
                  }`}
                  aria-label="Search products"
                >
                  <Search className="w-4 h-4" />
                </button>

                {/* Customer Account Button */}
                <Link
                  href={user ? '/account' : '/login'}
                  className="h-9 lg:h-10 px-3 text-[#B4B5BA] hover:text-[#C9A96A] hover:bg-[#17191D] rounded-xl transition-colors flex items-center gap-1.5 border border-transparent hover:border-[#30343A]"
                  aria-label="Customer Account"
                  title={user ? 'My Account' : 'Sign In'}
                >
                  <User className="w-4 h-4" />
                  <span className="text-[11px] font-semibold text-[#F1F0EC] max-w-[90px] truncate">
                    {user ? (profile?.fullName ? profile.fullName.split(' ')[0] : 'Account') : 'Sign In'}
                  </span>
                </Link>

                {/* Shopping Cart Drawer Trigger */}
                <button
                  type="button"
                  onClick={openDrawer}
                  className="relative h-9 lg:h-10 px-3.5 bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 shadow-xs hover:shadow-xs active:scale-[0.98]"
                  aria-label="Shopping Cart"
                >
                  <ShoppingBag className="w-4 h-4 text-[#101114] stroke-[2.2]" />
                  <span className="text-xs font-bold text-[#101114]">Cart</span>
                  {totalQuantity > 0 && (
                    <span className="bg-[#101114] text-[#C9A96A] text-[10px] font-extrabold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center ml-0.5">
                      {totalQuantity}
                    </span>
                  )}
                </button>
              </div>
            </div>

          </div>

          {/* Integrated Search Bar Drawer */}
          {searchOpen && (
            <div className="py-3 border-t border-[#30343A] animate-in fade-in">
              <form onSubmit={handleSearchSubmit} className="relative max-w-lg mx-auto">
                <input
                  type="text"
                  autoFocus
                  placeholder="Search products by name, category, or style..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-24 py-2.5 bg-[#17191D] border border-[#343840] text-[#F1F0EC] placeholder-[#85888E] rounded-xl text-xs focus:outline-none focus:border-[#C9A96A]"
                />
                <Search className="w-4 h-4 text-[#85888E] absolute left-3.5 top-3" />
                <button
                  type="submit"
                  className="absolute right-2 top-1.5 px-3 py-1 bg-[#C9A96A] text-[#101114] rounded-lg text-xs font-bold hover:bg-[#D8BD88]"
                >
                  Search
                </button>
              </form>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* MOBILE NAVIGATION DRAWER */}
        {/* ========================================================================= */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#30343A] bg-[#17191D] px-4 pt-3 pb-6 space-y-2 shadow-elevation max-h-[85vh] overflow-y-auto">
            {/* 1. Home */}
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-semibold text-[#F1F0EC] hover:text-[#C9A96A] hover:bg-[#1D2025] rounded-xl"
            >
              Home
            </Link>

            {/* 2. Dynamic Categories Accordion */}
            <div className="border-t border-[#30343A] pt-2 space-y-1.5">
              <div
                onClick={() => setMobileCategoriesOpen(!mobileCategoriesOpen)}
                className="flex items-center justify-between px-3 py-2.5 text-sm font-bold text-[#C9A96A] hover:bg-[#1D2025] rounded-xl cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Categories ({activeCategories.length})</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#85888E] transition-transform duration-200 ${
                    mobileCategoriesOpen ? 'rotate-180 text-[#C9A96A]' : ''
                  }`}
                />
              </div>

              {mobileCategoriesOpen && (
                <div className="space-y-2 pl-2 pr-1 pt-1">
                  {activeCategories.map((cat) => {
                    const subs = getActiveSubcategoriesForCat(cat.id, cat.subcategories);
                    const isExpanded = expandedMobileCategory === cat.id;

                    return (
                      <div key={cat.id} className="bg-[#1D2025] rounded-xl border border-[#30343A] overflow-hidden">
                        {/* Two usable interactions: Category Name link (44px) + Chevron toggle (44px) */}
                        <div className="flex items-center justify-between min-h-[44px]">
                          {/* 1. Category Link (Navigates directly to /category/[slug]) */}
                          <Link
                            href={`/category/${cat.slug}`}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex-1 py-3 px-3.5 font-bold text-xs text-[#F1F0EC] hover:text-[#C9A96A] flex items-center justify-between gap-1"
                          >
                            <span>{cat.name}</span>
                            <span className="text-[10px] text-[#85888E] font-normal">&rarr;</span>
                          </Link>

                          {/* 2. Subcategory Accordion Toggle Button (Expands subcategories without page jump) */}
                          {subs.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setExpandedMobileCategory(isExpanded ? null : cat.id)}
                              className="w-11 h-11 flex items-center justify-center text-[#85888E] hover:text-[#C9A96A] hover:bg-[#202329] border-l border-[#30343A]/60"
                              aria-label={`Toggle ${cat.name} subcategories`}
                            >
                              <ChevronDown
                                className={`w-4 h-4 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180 text-[#C9A96A]' : ''
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {/* Subcategories Accordion Content */}
                        {subs.length > 0 && isExpanded && (
                          <div className="px-3.5 pb-3 pt-1 border-t border-[#30343A]/60 bg-[#17191D]/60 space-y-1 animate-in fade-in">
                            {subs.map((sub) => (
                              <Link
                                key={sub.id}
                                href={`/category/${cat.slug}/${sub.slug}`}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block py-2 px-2 text-xs text-[#B4B5BA] hover:text-[#C9A96A] hover:bg-[#1D2025] rounded-lg transition-colors"
                              >
                                &bull; {sub.name}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Shop All Products */}
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 text-sm font-semibold text-[#F1F0EC] hover:text-[#C9A96A] hover:bg-[#1D2025] rounded-xl border-t border-[#30343A] pt-2"
            >
              Shop All Products
            </Link>

            {/* 4. Customer Account / Sign In */}
            <div className="pt-2 border-t border-[#30343A] space-y-1">
              <Link
                href={user ? '/account' : '/login'}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-semibold text-[#C9A96A] hover:bg-[#1D2025] rounded-xl"
              >
                {user ? `My Account (${profile?.fullName ? profile.fullName.split(' ')[0] : 'Customer'})` : 'Sign In / Register'}
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-semibold text-[#B4B5BA] hover:text-[#C9A96A] hover:bg-[#1D2025] rounded-xl"
              >
                About Us
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 text-sm font-semibold text-[#B4B5BA] hover:text-[#C9A96A] hover:bg-[#1D2025] rounded-xl"
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
