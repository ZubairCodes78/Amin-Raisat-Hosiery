'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ChevronRight, ShieldCheck, Truck, Phone } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export default function AboutPage() {
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
          <span className="font-semibold text-gray-200">About Us</span>
        </div>

        {/* Header */}
        <div className="border-b border-dark-border pb-6 mb-8">
          <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest block">
            Our Story &amp; Values
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 mt-1 tracking-tight">
            About {settings.brandName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
            Crafting genuine 100% fine combed cotton hosiery essentials and everyday innerwear in Pakistan.
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-8 text-xs sm:text-sm text-gray-300 leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-100">
              Founded on Craftsmanship and Comfort
            </h2>
            <p>
              Started by <strong>Muhammad Amin</strong>, {settings.brandName} was created with a straightforward mission: to provide authentic, high quality pure cotton hosiery and innerwear made specifically for the warm Pakistani climate.
            </p>
            <p>
              We believe that everyday essentials should never compromise on comfort. That is why our products are manufactured from 100% fine combed cotton yarn — offering natural breathability, gentle softness on the skin, and dependable sweat absorption throughout the day.
            </p>
          </section>

          <section className="p-6 sm:p-8 bg-dark-surface rounded-2xl border border-dark-border shadow-card space-y-4">
            <h3 className="text-base font-bold text-gold-400">Our Quality Principles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <h4 className="font-bold text-gray-100 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-gold-400" />
                  100% Combed Cotton
                </h4>
                <p className="text-xs text-gray-400">
                  Long-staple combed cotton fabric that resists collar stretching, pilling, and shape distortion after washing.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-gray-100 text-xs flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-gold-400" />
                  Separate Quality Listings
                </h4>
                <p className="text-xs text-gray-400">
                  Offering distinct High Quality (anti-sag taped collar and seams) and Standard Quality (folded seams) options.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-gray-100 text-xs flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  Free Delivery on 3+ Pieces
                </h4>
                <p className="text-xs text-gray-400">
                  Minimum order is 3 pieces with automatic 100% Free Nationwide Delivery across all Pakistan cities.
                </p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-gray-100 text-xs flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-gold-400" />
                  Direct Owner Support
                </h4>
                <p className="text-xs text-gray-400">
                  Direct personal communication on WhatsApp for sizing advice, bulk inquiries, and post-delivery assistance.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-100">
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
              className="py-3 px-6 bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs rounded-xl shadow-glow-gold transition-colors"
            >
              Explore Our Collection
            </Link>
            <a
              href={`https://wa.me/92${settings.whatsapp.replace(/^0/, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-6 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-glow-whatsapp"
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
