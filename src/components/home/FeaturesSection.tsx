'use client';

import React from 'react';
import { Truck, ShieldCheck, PhoneCall } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const FeaturesSection: React.FC = () => {
  const { settings } = useStore();

  return (
    <section className="py-14 bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">
            Quality Assurance
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
            Built with Trust &amp; True Cotton Craftsmanship
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1.5 font-normal">
            Pure combed cotton hosiery essentials engineered for long-lasting wear and daily comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 card-hover-lift flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Clear Delivery Terms</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                Minimum order is {settings.shipping.minOrderQty} pieces (Rs. {settings.shipping.baseDeliveryCharge} delivery). Orders of <strong>{settings.shipping.freeDeliveryThreshold} or more pieces</strong> unlock <strong>100% FREE DELIVERY</strong> across Pakistan.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-900">
              <span>Free at {settings.shipping.freeDeliveryThreshold}+ Pieces</span>
              <span>Cash on Delivery</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 card-hover-lift flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">100% Combed Cotton</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                Soft against the skin, sweat-absorbent, and designed to maintain its shape wash after wash with reinforced anti-sag collar taping.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-900">
              <span>Anti-Sag Neck Seams</span>
              <span>Natural Breathability</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 card-hover-lift flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-900 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Direct Owner Assistance</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                Contact Muhammad Amin directly via WhatsApp or phone for immediate help with sizing, bulk queries, and order tracking.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-900">
              <span>Phone: {settings.phone}</span>
              <span>WhatsApp Ready</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
