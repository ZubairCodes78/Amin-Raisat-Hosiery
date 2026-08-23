'use client';

import React from 'react';
import { Truck, ShieldCheck, PhoneCall, CheckCircle } from 'lucide-react';
import { useStore } from '@/context/StoreContext';

export const AnnouncementMarquee: React.FC = () => {
  const { settings } = useStore();

  if (settings.isAnnouncementEnabled === false) {
    return null;
  }

  const freeThreshold = settings.shipping?.freeDeliveryThreshold ?? 3;

  const messages = [
    {
      icon: Truck,
      text: `FREE DELIVERY ON ${freeThreshold}+ PIECES ACROSS PAKISTAN`,
    },
    {
      icon: ShieldCheck,
      text: '100% Pure Combed Cotton — Breathable Rib Weave & Anti-Sag Seams',
    },
    {
      icon: CheckCircle,
      text: 'Cash on Delivery (COD) & Direct Bank Transfer Available Across Pakistan',
    },
    {
      icon: PhoneCall,
      text: `WhatsApp Orders & Inquiries: ${settings.whatsapp}`,
    },
  ];

  return (
    <div className="bg-[#0b0b10] text-gray-200 text-[11px] font-medium py-2.5 overflow-hidden border-b border-dark-border relative z-30 select-none">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-12 items-center cursor-default">
        {[...messages, ...messages, ...messages].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-2.5 flex-shrink-0 text-gray-300">
              <Icon className="w-3.5 h-3.5 text-gold-500 flex-shrink-0" />
              <span className="tracking-wide uppercase font-semibold text-[10.5px]">{item.text}</span>
              <span className="text-dark-border-light ml-4 font-bold">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
