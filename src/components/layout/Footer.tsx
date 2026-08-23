'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export const Footer: React.FC = () => {
  const { settings, categories } = useStore();

  return (
    <footer className="bg-dark-surface text-gray-400 border-t border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* 1. Brand Column */}
          <div className="space-y-3">
            <Link href="/" className="inline-flex items-center group py-1">
              <div className="relative w-44 h-14 overflow-hidden flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                <Image
                  src="/images/Logo.png"
                  alt={settings.brandName}
                  fill
                  sizes="200px"
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed font-normal">
              Specialized in 100% pure combed cotton hosiery essentials and innerwear engineered for daily breathability and long-lasting durability across Pakistan.
            </p>
            <div className="pt-1">
              <Link href="/about" className="text-xs font-semibold text-gold-400 hover:text-gold-300 transition-colors">
                Read Our Story →
              </Link>
            </div>
          </div>

          {/* 2. Shop Collections */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gold-500 uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-xs">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-gold-400 transition-colors"
                  >
                    {cat.name}&apos;s Collection
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/shop" className="hover:text-gold-400 transition-colors font-medium">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Customer Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gold-500 uppercase tracking-wider">Customer Support</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a
                  href={`https://wa.me/92${settings.whatsapp.replace(/^0/, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors flex items-center gap-2 text-gray-300 font-medium"
                >
                  <WhatsAppIcon size={14} className="text-[#25D366] fill-current" />
                  <span>WhatsApp: {settings.whatsapp}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${settings.phone}`} className="hover:text-gray-200 transition-colors">
                  Phone: {settings.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${settings.email}`} className="hover:text-gray-200 transition-colors">
                  Email: {settings.email}
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-gray-200 transition-colors">
                  Contact Us Form
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Information & Policies */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-gold-500 uppercase tracking-wider">Information</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <Link href="/shipping-policy" className="hover:text-gray-200 transition-colors">
                  Shipping Policy (3+ Free Delivery)
                </Link>
              </li>
              <li>
                <Link href="/exchange-returns" className="hover:text-gray-200 transition-colors">
                  Exchange &amp; Returns (7 Days)
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="hover:text-gray-200 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms-conditions" className="hover:text-gray-200 transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-12 pt-6 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} {settings.brandName}. All rights reserved.</p>
          <p className="font-normal">100% Combed Cotton • Market: Pakistan (PKR / Rs.)</p>
        </div>
      </div>
    </footer>
  );
};
