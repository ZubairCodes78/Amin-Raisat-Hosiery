'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, Truck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export const HeroSection: React.FC = () => {
  const { settings } = useStore();

  const whatsappDirect = `https://wa.me/92${settings.whatsapp.replace(/^0/, '')}?text=${encodeURIComponent(
    'Assalam-o-Alaikum Amin Raisat Hosiery, I want to inquire about Men’s Vest.'
  )}`;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-brand-50/50 py-12 sm:py-20 border-b border-brand-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Col */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 bg-brand-900 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm">
              <span className="w-2 h-2 rounded-full bg-gold-400" />
              <span>Flagship Release • Men&apos;s 100% Cotton Vest</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-brand-950 tracking-tight leading-[1.1]">
              Pure Cotton Comfort,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-700">
                Crafted for Every Day.
              </span>
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-brand-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Experience the breathability and softness of 100% fine combed cotton. Engineered specifically for Pakistani weather with dual construction choices: <strong>High Quality taped collar</strong> and <strong>Standard Quality folded seams</strong>.
            </p>

            {/* Key Bullet Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 max-w-lg mx-auto lg:mx-0 text-xs font-semibold text-brand-800">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Reinforced Anti-Sag Neck Seams</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Sleeveless &amp; Half Sleeves Styles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Sizes: Small (S) to Double XL (XXL)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Free Delivery on 3+ Pieces</span>
              </div>
            </div>

            {/* CTAs with Official WhatsAppIcon */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link
                href="/shop"
                className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-brand-950 hover:bg-brand-900 text-white font-black text-sm shadow-elevation hover:shadow-2xl transition-all flex items-center justify-center gap-3 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Explore Shop</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </Link>

              <a
                href={whatsappDirect}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto py-4 px-7 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5"
              >
                <WhatsAppIcon size={20} className="text-white fill-current" />
                <span>Order on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
