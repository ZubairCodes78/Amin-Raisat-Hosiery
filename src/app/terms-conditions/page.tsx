'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ChevronRight } from 'lucide-react';

export default function TermsConditionsPage() {
  const { settings } = useStore();

  return (
    <div className="min-h-[75vh] py-10 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-semibold text-gray-900">Terms &amp; Conditions</span>
        </div>

        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block">
            Customer Agreement
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 mt-1">
            Terms &amp; Conditions
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
            Standard store terms and order conditions for {settings.brandName}.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-950">1. Ordering &amp; Quantities</h2>
            <p>
              By placing an order on our website, you agree to our minimum order requirement of 2 pieces and maximum single web retail order of 12 pieces. Orders containing 3 or more pieces are entitled to 100% Free Delivery across Pakistan.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-950">2. Pricing &amp; Currency</h2>
            <p>
              All prices displayed on {settings.brandName} are in Pakistani Rupees (PKR / Rs.). Prices for High Quality and Standard Quality construction options are clearly indicated on product cards and the product detail page.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-950">3. Payment &amp; Verification</h2>
            <p>
              Orders placed via Cash on Delivery (COD) will be verified via SMS or WhatsApp confirmation prior to courier booking. For Direct Bank Transfer orders, payment verification occurs once proof of transfer is provided to our official WhatsApp ({settings.whatsapp}).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-950">4. Modifications &amp; Store Updates</h2>
            <p>
              {settings.brandName} reserves the right to update product stock, variant pricing, and shipping policies as needed without prior notice.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
