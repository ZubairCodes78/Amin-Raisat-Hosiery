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
  const baseCharge = settings.shipping?.baseDeliveryCharge ?? 200;

  const messages = settings.announcementText && settings.announcementText.trim().length > 0
    ? [
        { icon: Truck, text: settings.announcementText },
        { icon: ShieldCheck, text: '100% Pure Combed Cotton — Breathable Rib Weave & Anti-Sag Seams' },
        { icon: CheckCircle, text: `Cash on Delivery (COD) & Direct Bank Transfer Available` },
        { icon: PhoneCall, text: `WhatsApp Order & Inquiries: ${settings.whatsapp}` },
      ]
    : [
        {
          icon: Truck,
          text: `FREE DELIVERY nationwide on orders of ${freeThreshold}+ pieces (Rs. ${baseCharge} delivery below ${freeThreshold} pcs)`,
        },
        {
          icon: ShieldCheck,
          text: '100% Pure Combed Cotton — Breathable Rib Weave & Anti-Sag Neck Seams',
        },
        {
          icon: CheckCircle,
          text: 'Cash on Delivery (COD) & Direct Bank Transfer Available Across Pakistan',
        },
        {
          icon: PhoneCall,
          text: `WhatsApp Order & Inquiries: ${settings.whatsapp}`,
        },
      ];

  return (
    <div className="bg-gray-950 text-white text-[11px] font-medium py-2 overflow-hidden border-b border-gray-800 relative z-30 select-none">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] gap-12 items-center cursor-default">
        {[...messages, ...messages, ...messages].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="flex items-center gap-2 flex-shrink-0 text-gray-300">
              <Icon className="w-3.5 h-3.5 text-[#EAB308] flex-shrink-0" />
              <span>{item.text}</span>
              <span className="text-gray-600 ml-4">•</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
