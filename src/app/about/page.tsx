'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ChevronRight, ShieldCheck, Truck, Phone, Sparkles } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export default function AboutPage() {
  const { settings } = useStore();

  return (
    <div className="min-h-[85vh] py-12 bg-light-bg dark:bg-dark-bg text-charcoal-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-charcoal-500 dark:text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#C9A96A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-charcoal-400 dark:text-gray-600" />
          <span className="font-semibold text-charcoal-900 dark:text-gray-200">About Us</span>
        </div>

        {/* Header */}
        <div className="border-b border-light-border dark:border-dark-border pb-6 mb-8">
          <span className="text-[10px] font-bold text-[#A07D38] dark:text-gold-500 uppercase tracking-widest block">
            Our Story &amp; Values
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 dark:text-gray-100 mt-1 tracking-tight">
            About {settings.brandName}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 dark:text-gray-400 mt-2 leading-relaxed">
            Crafting genuine 100% fine combed cotton hosiery essentials and wholesale commercial innerwear in Pakistan.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-xs sm:text-sm text-charcoal-700 dark:text-gray-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 dark:text-gray-100">
              Founded on Craftsmanship and Comfort
            </h2>
            <p>
              Started by <strong>Muhammad Amin</strong>, {settings.brandName} was created with a straightforward mission: to provide authentic, high quality pure cotton hosiery and innerwear made specifically for the warm Pakistani climate.
            </p>
            <p>
              We believe that everyday essentials should never compromise on comfort. That is why our products are manufactured from 100% fine combed cotton yarn — offering natural breathability, gentle softness on the skin, and dependable sweat absorption throughout the day.
            </p>
          </section>

          <section className="p-6 sm:p-8 bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-sm dark:shadow-card space-y-4">
            <h3 className="text-base font-bold text-[#A07D38] dark:text-gold-400">Our Quality Principles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-charcoal-900 dark:text-gray-100 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#A07D38] dark:text-gold-400" />
                  100% Combed Cotton
                </h4>
                <p className="text-xs text-charcoal-500 dark:text-gray-400">
                  Long-staple combed cotton fabric that resists collar stretching, pilling, and shape distortion after washing.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-charcoal-900 dark:text-gray-100 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#A07D38] dark:text-gold-400" />
                  Separate Quality Listings
                </h4>
                <p className="text-xs text-charcoal-500 dark:text-gray-400">
                  Offering distinct High Quality (anti-sag taped collar and seams) and Standard Quality (folded seams) options.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-charcoal-900 dark:text-gray-100 text-xs flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Free Delivery on 3+ Pieces &amp; Wholesale
                </h4>
                <p className="text-xs text-charcoal-500 dark:text-gray-400">
                  Minimum retail order is 3 pieces with automatic 100% Free Nationwide Delivery across all Pakistan cities.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-charcoal-900 dark:text-gray-100 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#A07D38] dark:text-gold-400" />
                  Factory Wholesale Program
                </h4>
                <p className="text-xs text-charcoal-500 dark:text-gray-400">
                  Commercial retail packaging and bulk discounts starting from minimum 12 pieces (1 dozen).
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 dark:text-gray-100">
              Direct Contact &amp; Support
            </h2>
            <p>
              For wholesale bulk requirements, institutional uniform supply, or questions about sizes, reach out to us directly:
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={`https://wa.me/92${settings.whatsapp.replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs"
              >
                <WhatsAppIcon size={14} className="text-white fill-current" />
                <span>WhatsApp ({settings.whatsapp})</span>
              </a>
              <Link
                href="/wholesale"
                className="inline-flex items-center gap-2 bg-champagne-500 hover:bg-champagne-400 text-black text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Wholesale Store</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
