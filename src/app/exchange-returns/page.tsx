'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export default function ExchangeReturnsPage() {
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
          <span className="font-semibold text-gray-900">Exchange &amp; Returns</span>
        </div>

        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block">
            Customer Satisfaction Guarantee
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 mt-1">
            Exchange &amp; Returns Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
            Hassle-free 7-day exchange process for our customers across Pakistan.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <h2 className="font-bold text-gray-950 text-base flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-gray-900" />
              {settings.exchangeReturnDays ?? 7}-Day Sizing &amp; Defect Exchange
            </h2>
            <p>
              At {settings.brandName}, customer satisfaction is our highest priority. If you ordered the wrong size or discovered a manufacturing flaw, we offer a straightforward exchange within <strong>{settings.exchangeReturnDays ?? 7} calendar days</strong> of receiving your parcel.
            </p>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-gray-950 text-sm">Exchange Conditions</h3>
            <ul className="space-y-1.5 pl-4 list-disc text-gray-700">
              <li>The garment must be <strong>unwashed</strong> and <strong>unworn</strong> (except for brief sizing fit trial).</li>
              <li>Original tags and packaging should be retained where possible.</li>
              <li>Exchange requests must be submitted within {settings.exchangeReturnDays ?? 7} days of package delivery.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-gray-950 text-sm">How to Request an Exchange</h3>
            <ol className="space-y-2 pl-4 list-decimal text-gray-700">
              <li>
                Take a quick photo of the item and message our official WhatsApp support at <strong>{settings.whatsapp}</strong> with your <strong>Order Number</strong>.
              </li>
              <li>
                Let Muhammad Amin know your desired replacement size or construction option.
              </li>
              <li>
                We will promptly arrange the replacement dispatch to your address.
              </li>
            </ol>
          </section>

          {/* CTA with Official WhatsAppIcon */}
          <div className="pt-4">
            <a
              href={`https://wa.me/92${settings.whatsapp.replace(/^0/, '')}?text=${encodeURIComponent(
                'Assalam-o-Alaikum Amin Raisat Hosiery, I would like to request an exchange for my order.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 py-3 px-6 bg-[#25D366] text-white font-semibold rounded-lg text-xs hover:bg-[#1EBE5D] transition-colors shadow-xs"
            >
              <WhatsAppIcon size={16} className="text-white fill-current" />
              <span>Initiate Exchange on WhatsApp ({settings.whatsapp})</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
