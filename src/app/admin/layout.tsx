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
  Users,
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
    return <div className="min-h-screen bg-[#101114]">{children}</div>;
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#101114] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-[#C9A96A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#85888E] font-medium">Loading Admin Dashboard...</p>
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
    { href: '/admin/customers', label: 'Customers', icon: Users },
    { href: '/admin/stock', label: 'Inventory / Stock', icon: Boxes },
    { href: '/admin/reviews', label: 'Customer Reviews', icon: MessageSquare },
    { href: '/admin/settings', label: 'Delivery & Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#101114] text-[#F1F0EC] flex flex-col md:flex-row">
      {/* Dedicated Admin Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0D0F12] text-[#D7D7D4] border-r border-[#30343A] p-5 justify-between flex-shrink-0 min-h-screen sticky top-0">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#30343A]">
            <div className="relative w-10 h-10 overflow-hidden flex-shrink-0 bg-[#1D2025] rounded-xl border border-[#30343A] p-1">
              <Image
                src="/images/Favicon Logo.jpeg"
                alt="Amin Raisat Hosiery"
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <div>
              <h2 className="font-bold text-xs text-[#C9A96A] tracking-wider uppercase leading-none">Admin Portal</h2>
              <p className="text-[10px] text-[#8C8F95] font-medium tracking-wide mt-1">Amin Raisat Hosiery</p>
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-[#1F2227] text-[#F1F0EC] border-l-2 border-[#C9A96A] shadow-xs'
                      : 'hover:bg-[#17191D] text-[#8C8F95] hover:text-[#D7D7D4]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#C9A96A]' : 'text-[#8C8F95]'}`} />
                  <span>{link.label}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="space-y-2 pt-4 border-t border-[#30343A]">
          <a
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#8C8F95] hover:text-[#C9A96A] hover:bg-[#17191D] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Store className="w-4 h-4" /> Live Storefront
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-[#D96B6B] hover:bg-[#D96B6B]/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header Bar for Admin */}
      <div className="md:hidden bg-[#0D0F12] text-[#F1F0EC] p-4 flex items-center justify-between sticky top-0 z-40 border-b border-[#30343A]">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 overflow-hidden flex-shrink-0 bg-[#1D2025] rounded-lg border border-[#30343A] p-0.5">
            <Image
              src="/images/Favicon Logo.jpeg"
              alt="Amin Raisat Hosiery"
              fill
              className="object-contain rounded"
            />
          </div>
          <div>
            <h2 className="font-bold text-xs leading-none text-[#C9A96A]">Admin Portal</h2>
            <span className="text-[10px] text-[#8C8F95]">Amin Raisat Hosiery</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 text-[#8C8F95] hover:text-[#F1F0EC] hover:bg-[#17191D] rounded-xl"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileNavOpen && (
        <div className="md:hidden bg-[#0D0F12] border-b border-[#30343A] p-4 space-y-2 sticky top-[65px] z-30 animate-in fade-in">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                  isActive
                    ? 'bg-[#1F2227] text-[#F1F0EC] border-l-2 border-[#C9A96A]'
                    : 'text-[#8C8F95] hover:bg-[#17191D] hover:text-[#D7D7D4]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#C9A96A]' : 'text-[#8C8F95]'}`} />
                <span>{link.label}</span>
              </a>
            );
          })}

          <div className="pt-2 border-t border-[#30343A] flex justify-between items-center text-xs">
            <a href="/" target="_blank" className="text-[#8C8F95] hover:text-[#C9A96A] flex items-center gap-1">
              <Store className="w-3.5 h-3.5" /> View Storefront
            </a>
            <button onClick={handleLogout} className="text-[#D96B6B] font-semibold">
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Main Admin Content Viewport */}
      <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-[#101114]">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
