'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingCart,
  Boxes,
  MessageSquare,
  Settings,
  Sliders,
  LogOut,
  ExternalLink,
  Store,
  Menu,
  X,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';

const ADMIN_AUTH_KEY = 'arh_admin_auth_token_v1';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { settings } = useStore();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    const auth = localStorage.getItem(ADMIN_AUTH_KEY);
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.push('/admin/login');
    }
  }, [pathname, router]);

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
    router.push('/admin/login');
  };

  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-gray-950">{children}</div>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-gray-600 font-semibold">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/hero', label: 'Hero Banners & Slider', icon: Sliders },
    { href: '/admin/products', label: 'Products & Variants', icon: Package },
    { href: '/admin/categories', label: 'Categories & Subcategories', icon: Layers },
    { href: '/admin/orders', label: 'Customer Orders', icon: ShoppingCart },
    { href: '/admin/stock', label: 'Inventory / Stock', icon: Boxes },
    { href: '/admin/reviews', label: 'Customer Reviews', icon: MessageSquare },
    { href: '/admin/settings', label: 'Delivery & Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Dedicated Admin Sidebar for Desktop (No website header/footer) */}
      <aside className="hidden md:flex flex-col w-64 bg-gray-950 text-gray-300 border-r border-gold-600/20 p-5 justify-between flex-shrink-0 min-h-screen sticky top-0">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-gold-600/20">
            <div className="relative w-10 h-10 overflow-hidden flex-shrink-0 transition-transform duration-300 ease-out hover:scale-[1.02]">
              <Image
                src="/images/Logo.png"
                alt="Amin Raisat Hosiery"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-white tracking-wider uppercase leading-none">Admin Portal</h2>
              <p className="font-serif italic text-[11px] text-gray-400 font-medium tracking-wide mt-1">Amin Raisat Hosiery</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-gray-800 text-white'
                      : 'hover:bg-gray-900 text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 pt-4 border-t border-gold-600/20">
          <a
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-gray-900 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Store className="w-4 h-4" /> Live Storefront
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header Bar for Admin */}
      <div className="md:hidden bg-gray-950 text-white p-4 flex items-center justify-between sticky top-0 z-40 border-b border-gold-600/20">
        <div className="flex items-center gap-2.5">
          <div className="relative w-9 h-9 overflow-hidden flex-shrink-0">
            <Image
              src="/images/Logo.png"
              alt="Amin Raisat Hosiery"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h2 className="font-bold text-sm leading-none">Admin Portal</h2>
            <span className="text-[10px] text-gray-400">Amin Raisat Hosiery</span>
          </div>
        </div>

        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-1.5 text-gray-300 hover:text-white"
          aria-label="Toggle admin menu"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-gray-900 text-white p-4 space-y-1.5 border-b border-gold-600/20 shadow-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                  isActive ? 'bg-gray-800 text-white' : 'text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </a>
            );
          })}
          <div className="pt-2 border-t border-gold-600/20 flex justify-between">
            <a href="/" target="_blank" className="text-xs text-gray-400 flex items-center gap-1">
              Live Store ↗
            </a>
            <button onClick={handleLogout} className="text-xs font-semibold text-rose-400">
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Page Content (Dedicated view, zero customer footer) */}
      <main className="flex-1 p-4 sm:p-8 lg:p-10 overflow-y-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
}
