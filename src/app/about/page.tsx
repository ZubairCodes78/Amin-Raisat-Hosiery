'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ChevronRight, ShieldCheck, Truck, Phone } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export default function AboutPage() {
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
          <span className="font-semibold text-gray-900">About Us</span>
        </div>

        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block">
            Our Story &amp; Values
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 mt-1">
            About {settings.brandName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
            Crafting genuine 100% fine combed cotton hosiery essentials and everyday innerwear in Pakistan.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-950">
              Founded on Craftsmanship and Comfort
            </h2>
            <p>
              Started approximately last year by <strong>Muhammad Amin</strong>, {settings.brandName} was created with a straightforward mission: to provide authentic, high quality pure cotton hosiery and innerwear made specifically for the warm Pakistani climate.
            </p>
            <p>
              We believe that everyday essentials should never compromise on comfort. That is why our products are manufactured from 100% fine combed cotton yarn — offering natural breathability, gentle softness on the skin, and dependable sweat absorption throughout the day.
            </p>
          </section>

          <section className="p-6 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
            <h3 className="text-base font-bold text-gray-950">Our Quality Principles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  100% Combed Cotton
                </h4>
                <p className="text-xs text-gray-600">
                  Long-staple combed cotton fabric that resists collar stretching, pilling, and shape distortion after washing.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Dual Construction Choices
                </h4>
                <p className="text-xs text-gray-600">
                  Offering both High Quality (anti-sag taped collar and shoulders) and Standard Quality (neat folded seams) options.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-blue-700" />
                  Honest Delivery Terms
                </h4>
                <p className="text-xs text-gray-600">
                  Minimum order of 2 pieces (Rs. 200 delivery) with automatic 100% Free Delivery unlocked on all orders of 3 or more pieces.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-purple-700" />
                  Direct Owner Support
                </h4>
                <p className="text-xs text-gray-600">
                  Direct personal communication on WhatsApp for sizing advice, bulk inquiries, and post-delivery assistance.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-950">
              Looking to the Future
            </h2>
            <p>
              While our initial flagship product is the Men’s Pure Cotton Vest, we are actively expanding our production to bring pure cotton boxers, briefs, t-shirts, trousers, as well as women&apos;s and kids&apos; hosiery collections.
            </p>
          </section>

          {/* CTA */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="py-3 px-6 bg-gray-950 text-white rounded-lg text-xs font-semibold hover:bg-black transition-colors"
            >
              Explore Our Collection
            </Link>
            <a
              href={`https://wa.me/92${settings.whatsapp.replace(/^0/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-6 bg-[#25D366] text-white rounded-lg text-xs font-semibold hover:bg-[#1EBE5D] transition-colors flex items-center gap-2 shadow-xs"
            >
              <WhatsAppIcon size={16} className="text-white fill-current" />
              <span>Contact on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
