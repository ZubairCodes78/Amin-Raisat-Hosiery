'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ChevronRight, Truck, CheckCircle2 } from 'lucide-react';

export default function ShippingPolicyPage() {
  const { settings } = useStore();

  return (
    <div className="min-h-[85vh] py-12 bg-dark-bg text-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gold-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-semibold text-gray-200">Shipping Policy</span>
        </div>

        {/* Header */}
        <div className="border-b border-dark-border pb-6 mb-8">
          <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest block">
            Nationwide Delivery Details
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 mt-1 tracking-tight">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
            Transparent, honest delivery terms for all customers across Pakistan.
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-6 text-xs sm:text-sm text-gray-300 leading-relaxed">
          <div className="p-6 sm:p-8 bg-dark-surface rounded-2xl border border-dark-border shadow-card space-y-3">
            <h2 className="font-bold text-gold-400 text-base flex items-center gap-2">
              <Truck className="w-5 h-5" />
              Core Order &amp; Delivery Rules
            </h2>
            <ul className="space-y-2 text-xs text-gray-200">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Minimum Order Quantity:</strong> {settings.shipping.minOrderQty} pieces per order.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Free Delivery on {settings.shipping.freeDeliveryThreshold}+ Pieces:</strong> Orders containing {settings.shipping.freeDeliveryThreshold} or more pieces automatically qualify for <strong className="text-emerald-400">100% Free Delivery</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Maximum Order Quantity:</strong> {settings.shipping.maxOrderQty} pieces per retail web order (for larger wholesale inquiries, contact us on WhatsApp).
                </span>
              </li>
            </ul>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-gray-100 text-sm">Delivery Timelines</h3>
            <p>
              Orders are dispatched within 24–48 hours of confirmation. Major cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Gujranwala, Sialkot, Peshawar, etc.) typically arrive within 2 to 4 business days. Regional and remote destinations may take 3 to 6 business days.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-gray-100 text-sm">Payment Methods</h3>
            <p>
              We offer two secure payment options:
            </p>
            <ul className="pl-4 list-disc space-y-1">
              <li><strong>Cash on Delivery (COD):</strong> Pay the courier rider in cash upon receiving your parcel.</li>
              <li><strong>Direct Bank Transfer:</strong> Transfer the exact total amount to our bank account and share a screenshot of the receipt on WhatsApp with your Order Number.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-gray-100 text-sm">Order Tracking &amp; Inquiries</h3>
            <p>
              Once your parcel is booked with the courier service, we share your tracking number via SMS or WhatsApp ({settings.whatsapp}). For any questions regarding your shipment, feel free to message Muhammad Amin directly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
