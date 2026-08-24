'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ChevronRight } from 'lucide-react';

export default function TermsConditionsPage() {
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
          <span className="font-semibold text-charcoal-900 dark:text-gray-200">Terms &amp; Conditions</span>
        </div>

        {/* Header */}
        <div className="border-b border-light-border dark:border-dark-border pb-6 mb-8">
          <span className="text-[10px] font-bold text-[#A07D38] dark:text-gold-500 uppercase tracking-widest block">
            Customer Agreement
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 dark:text-gray-100 mt-1 tracking-tight">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 dark:text-gray-400 mt-2 leading-relaxed">
            Standard store terms and order conditions for {settings.brandName}.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-xs sm:text-sm text-charcoal-700 dark:text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 dark:text-gray-100">1. Ordering &amp; Quantities</h2>
            <p>
              By placing an order on our website, you agree to our minimum retail order requirement of 3 pieces. Retail orders containing 3 or more pieces are entitled to <strong className="text-emerald-700 dark:text-emerald-400">100% Free Delivery</strong> across Pakistan. For bulk and commercial quantities, our wholesale minimum is 12 pieces (1 dozen).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 dark:text-gray-100">2. Pricing &amp; Currency</h2>
            <p>
              All prices displayed on {settings.brandName} are in Pakistani Rupees (PKR / Rs.). High Quality and Standard Quality garments are listed as separate product offerings with their own distinct specifications.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 dark:text-gray-100">3. Payment &amp; Verification</h2>
            <p>
              Orders placed via Cash on Delivery (COD) will be verified via SMS or WhatsApp confirmation prior to courier booking. For Direct Bank Transfer orders, payment verification occurs once proof of transfer is provided to our official WhatsApp (<strong className="text-[#A07D38] dark:text-gold-400">{settings.whatsapp}</strong>).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 dark:text-gray-100">4. Modifications &amp; Store Updates</h2>
            <p>
              {settings.brandName} reserves the right to update product stock, variant pricing, and shipping policies as needed without prior notice.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
