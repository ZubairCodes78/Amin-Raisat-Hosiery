'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ChevronRight, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <span className="font-semibold text-gray-900">Privacy Policy</span>
        </div>

        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block">
            Customer Data Security
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 mt-1">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
            How {settings.brandName} protects your personal and order information.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-950">1. Information We Collect</h2>
            <p>
              When you place an order on our store, we collect only the essential details required to process and deliver your package: customer full name, contact phone/WhatsApp number, delivery address, city, province, and optional order notes.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-950">2. How We Use Your Information</h2>
            <p>Your details are used strictly for:</p>
            <ul className="pl-4 list-disc space-y-1">
              <li>Packaging and dispatching your parcel via authorized courier partners in Pakistan.</li>
              <li>Sending SMS or WhatsApp order confirmations and tracking updates.</li>
              <li>Customer service communication regarding sizing, exchange, or delivery updates.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-950">3. No Third-Party Sharing or Spam</h2>
            <p>
              We do not sell, rent, or lease your contact information to any third-party advertisers. Your information remains confidential within {settings.brandName}.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-gray-950">4. Contacting Us Regarding Your Data</h2>
            <p>
              For any questions regarding your privacy or to update your saved contact details, please email us at <strong>{settings.email}</strong> or message us on WhatsApp at <strong>{settings.whatsapp}</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
