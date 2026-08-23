'use client';

import React from 'react';
import { Truck, PackageCheck, RotateCcw } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const BenefitsStrip: React.FC = () => {
  const { settings } = useStore();
  const freeThreshold = settings.shipping?.freeDeliveryThreshold ?? 3;
  const returnDays = settings.exchangeReturnDays ?? 7;

  const benefits = [
    {
      id: 'free-delivery',
      icon: Truck,
      title: `FREE Delivery On ${freeThreshold}+ Pieces`,
      subtitle: 'Nationwide dispatch across Pakistan',
    },
    {
      id: 'branded-packaging',
      icon: PackageCheck,
      title: 'Deliver In Branded Flyers',
      subtitle: 'Secure & premium sealed packaging',
    },
    {
      id: 'easy-returns',
      icon: RotateCcw,
      title: 'Easy Returns & Exchange',
      subtitle: `${returnDays}-day hassle-free sizing guarantee`,
    },
  ];

  return (
    <section
      aria-label="Store Benefits"
      className="relative z-10 w-full bg-dark-surface border-y border-dark-border shadow-card"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-dark-border">
          {benefits.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className={`flex items-center gap-3.5 sm:gap-4 py-3 sm:py-2 ${
                  index === 0
                    ? 'md:pr-6'
                    : index === 1
                    ? 'md:px-6'
                    : 'md:pl-6'
                }`}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-dark-card border border-dark-border flex items-center justify-center flex-shrink-0 text-gold-400 shadow-xs">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-bold text-gray-100 uppercase tracking-wide truncate">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-400 font-normal truncate mt-0.5">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
