'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useStore } from '@/context/StoreContext';
import { useTheme } from '@/context/ThemeContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { Phone, Mail, MapPin, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, categories } = useStore();
  const { isDark } = useTheme();

  const activeCategories = categories
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  const logoSrc = isDark ? '/images/header logo.png' : '/images/light logo.png';

  return (
    <footer className="bg-light-elevated dark:bg-[#0E0E0C] text-charcoal-700 dark:text-[#B8B3A8] border-t border-light-border dark:border-[#34322D] text-left transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 text-left items-start">
          {/* 1. Brand Column */}
          <div className="space-y-3.5 text-left">
            <Link href="/" className="inline-flex items-center group py-0.5">
              <div className="relative w-44 h-12 lg:h-14 overflow-hidden flex-shrink-0 transition-transform duration-300 ease-out group-hover:scale-[1.02]">
                <Image
                  src={logoSrc}
                  alt={settings.brandName}
                  fill
                  sizes="200px"
                  className="object-contain object-left"
                />
              </div>
            </Link>
            <p className="text-xs text-charcoal-600 dark:text-[#B4B5BA] leading-relaxed font-normal text-left">
              Specialized in 100% pure combed cotton hosiery essentials and innerwear engineered for daily breathability and long-lasting durability across Pakistan.
            </p>
            <div className="pt-0.5 text-left">
              <Link
                href="/about"
                className="text-xs font-semibold text-[#C9A96A] hover:text-[#D8BD88] transition-colors inline-flex items-center gap-1"
              >
                Read Our Heritage Story &rarr;
              </Link>
            </div>
          </div>

          {/* 2. Shop Collections & Wholesale */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold text-[#C9A96A] uppercase tracking-wider text-left">
              Collections &amp; B2B
            </h4>
            <ul className="space-y-2.5 text-xs text-left">
              {activeCategories.map((cat) => (
                <li key={cat.id} className="text-left">
                  <Link
                    href={`/category/${cat.slug}`}
                    className="text-charcoal-600 dark:text-[#B4B5BA] hover:text-[#C9A96A] transition-colors block py-0.5"
                  >
                    {cat.name}&apos;s Collection
                  </Link>
                </li>
              ))}
              <li className="text-left">
                <Link
                  href="/shop"
                  className="text-charcoal-900 dark:text-[#F1F0EC] hover:text-[#C9A96A] transition-colors font-semibold block py-0.5"
                >
                  All Products
                </Link>
              </li>
              <li className="text-left pt-1">
                <Link
                  href="/wholesale"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-champagne-100 dark:bg-[#1D2025] text-[#C9A96A] border border-[#C9A96A]/40 rounded-lg text-xs font-bold hover:bg-champagne-200 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Wholesale Store (Bulk)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Customer Support */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold text-[#C9A96A] uppercase tracking-wider text-left">
              Customer Support
            </h4>
            <ul className="space-y-2.5 text-xs text-left">
              <li className="text-left">
                <a
                  href={`https://wa.me/92${settings.whatsapp.replace(/^0/, '').replace(/[\s-]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#25D366] transition-colors inline-flex items-center gap-2 text-charcoal-900 dark:text-[#F1F0EC] font-medium py-0.5"
                >
                  <WhatsAppIcon size={14} className="text-[#25D366] fill-current flex-shrink-0" />
                  <span>WhatsApp: {settings.whatsapp}</span>
                </a>
              </li>
              <li className="text-left">
                <a
                  href={`tel:${settings.phone || settings.whatsapp}`}
                  className="text-charcoal-600 dark:text-[#B4B5BA] hover:text-charcoal-900 dark:hover:text-[#F1F0EC] transition-colors inline-flex items-center gap-2 py-0.5"
                >
                  <Phone className="w-3.5 h-3.5 text-charcoal-400 dark:text-[#85888E] flex-shrink-0" />
                  <span>Call: {settings.phone || settings.whatsapp}</span>
                </a>
              </li>
              <li className="text-left">
                <a
                  href={`mailto:${settings.email}`}
                  className="text-charcoal-600 dark:text-[#B4B5BA] hover:text-charcoal-900 dark:hover:text-[#F1F0EC] transition-colors inline-flex items-center gap-2 py-0.5 break-all"
                >
                  <Mail className="w-3.5 h-3.5 text-charcoal-400 dark:text-[#85888E] flex-shrink-0" />
                  <span>{settings.email}</span>
                </a>
              </li>
              <li className="text-left">
                <Link
                  href="/contact"
                  className="text-charcoal-600 dark:text-[#B4B5BA] hover:text-charcoal-900 dark:hover:text-[#F1F0EC] transition-colors inline-flex items-center gap-2 py-0.5"
                >
                  <MapPin className="w-3.5 h-3.5 text-charcoal-400 dark:text-[#85888E] flex-shrink-0" />
                  <span>Faisalabad, Pakistan</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Information & Policies */}
          <div className="space-y-3 text-left">
            <h4 className="text-xs font-bold text-[#C9A96A] uppercase tracking-wider text-left">
              Information &amp; Trust
            </h4>
            <ul className="space-y-2.5 text-xs text-left">
              <li className="text-left">
                <Link
                  href="/shipping-policy"
                  className="text-charcoal-600 dark:text-[#B4B5BA] hover:text-charcoal-900 dark:hover:text-[#F1F0EC] transition-colors block py-0.5"
                >
                  Shipping Policy (3+ Free Delivery)
                </Link>
              </li>
              <li className="text-left">
                <Link
                  href="/exchange-returns"
                  className="text-charcoal-600 dark:text-[#B4B5BA] hover:text-charcoal-900 dark:hover:text-[#F1F0EC] transition-colors block py-0.5"
                >
                  Exchange &amp; Returns ({settings.exchangeReturnDays || 7} Days)
                </Link>
              </li>
              <li className="text-left">
                <Link
                  href="/privacy-policy"
                  className="text-charcoal-600 dark:text-[#B4B5BA] hover:text-charcoal-900 dark:hover:text-[#F1F0EC] transition-colors block py-0.5"
                >
                  Privacy Policy
                </Link>
              </li>
              <li className="text-left">
                <Link
                  href="/terms-conditions"
                  className="text-charcoal-600 dark:text-[#B4B5BA] hover:text-charcoal-900 dark:hover:text-[#F1F0EC] transition-colors block py-0.5"
                >
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="mt-10 sm:mt-12 pt-6 border-t border-light-border dark:border-[#30343A] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-charcoal-500 dark:text-[#85888E] gap-2.5 sm:gap-4 text-left">
          <p className="text-left">&copy; {new Date().getFullYear()} {settings.brandName}. All rights reserved.</p>
          <p className="font-normal text-left">100% Combed Cotton &bull; Market: Pakistan (PKR / Rs.)</p>
        </div>
      </div>
    </footer>
  );
};
