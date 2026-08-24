'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ChevronRight } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <span className="font-semibold text-charcoal-900 dark:text-gray-200">Privacy Policy</span>
        </div>

        {/* Header */}
        <div className="border-b border-light-border dark:border-dark-border pb-6 mb-8">
          <span className="text-[10px] font-bold text-[#A07D38] dark:text-gold-500 uppercase tracking-widest block">
            Customer Data Security
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 dark:text-gray-100 mt-1 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 dark:text-gray-400 mt-2 leading-relaxed">
            How {settings.brandName} protects your personal and order information.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-xs sm:text-sm text-charcoal-700 dark:text-gray-300 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 dark:text-gray-100">1. Information We Collect</h2>
            <p>
              When you place an order on our store, we collect only the essential details required to process and deliver your package: customer full name, contact phone/WhatsApp number, delivery address, city, province, and optional order notes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 dark:text-gray-100">2. How We Use Your Information</h2>
            <p>Your details are used strictly for:</p>
            <ul className="pl-4 list-disc space-y-1 text-charcoal-600 dark:text-gray-400">
              <li>Packaging and dispatching your parcel via authorized courier partners in Pakistan.</li>
              <li>Sending SMS or WhatsApp order confirmations and tracking updates.</li>
              <li>Customer service communication regarding sizing, exchange, or delivery updates.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 dark:text-gray-100">3. No Third-Party Sharing or Spam</h2>
            <p>
              We do not sell, rent, or lease your contact information to any third-party advertisers. Your information remains confidential within {settings.brandName}.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-charcoal-900 dark:text-gray-100">4. Contacting Us Regarding Your Data</h2>
            <p>
              For any questions regarding your privacy or to update your saved contact details, please email us at <strong className="text-[#A07D38] dark:text-gold-400">{settings.email}</strong> or message us on WhatsApp at <strong className="text-[#A07D38] dark:text-gold-400">{settings.whatsapp}</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
