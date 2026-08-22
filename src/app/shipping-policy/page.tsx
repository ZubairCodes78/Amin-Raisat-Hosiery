'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ChevronRight, Truck, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function ShippingPolicyPage() {
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
          <span className="font-semibold text-gray-900">Shipping Policy</span>
        </div>

        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block">
            Nationwide Delivery Details
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 mt-1">
            Shipping &amp; Delivery Policy
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
            Transparent, honest delivery terms for all customers across Pakistan.
          </p>
        </div>

        {/* Policy Content */}
        <div className="space-y-6 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <h2 className="font-bold text-gray-950 text-base flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-900" />
              Core Order &amp; Delivery Rules
            </h2>
            <ul className="space-y-2 text-xs text-gray-800">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Minimum Order Quantity:</strong> {settings.shipping.minOrderQty} pieces per order.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Delivery Charges (Below {settings.shipping.freeDeliveryThreshold} Pieces):</strong> Flat Rs. {settings.shipping.baseDeliveryCharge} across all cities and regions of Pakistan.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Free Delivery on {settings.shipping.freeDeliveryThreshold}+ Pieces:</strong> Orders containing {settings.shipping.freeDeliveryThreshold} or more pieces automatically qualify for <strong>100% Free Delivery</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Maximum Order Quantity:</strong> {settings.shipping.maxOrderQty} pieces per retail web order (for larger wholesale quantities, please contact us on WhatsApp).
                </span>
              </li>
            </ul>
          </div>

          <section className="space-y-2">
            <h3 className="font-bold text-gray-950 text-sm">Delivery Timelines</h3>
            <p>
              Orders are dispatched within 24–48 hours of confirmation. Major cities (Lahore, Karachi, Islamabad, Rawalpindi, Faisalabad, Multan, Gujranwala, Sialkot, Peshawar, etc.) typically arrive within 2 to 4 business days. Regional and remote destinations may take 3 to 6 business days.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-gray-950 text-sm">Payment Methods</h3>
            <p>
              We offer two secure payment options:
            </p>
            <ul className="pl-4 list-disc space-y-1">
              <li><strong>Cash on Delivery (COD):</strong> Pay the courier rider in cash upon receiving your parcel.</li>
              <li><strong>Direct Bank Transfer:</strong> Transfer the exact total amount to our Meezan Bank account and share a screenshot of the receipt on WhatsApp with your Order ID.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-bold text-gray-950 text-sm">Order Tracking &amp; Inquiries</h3>
            <p>
              Once your parcel is booked with the courier service, we will share your tracking number via SMS or WhatsApp ({settings.whatsapp}). For any questions regarding your shipment, feel free to message Muhammad Amin directly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
