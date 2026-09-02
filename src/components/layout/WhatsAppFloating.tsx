'use client';

import React from 'react';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { WHATSAPP_URL, WHATSAPP_NUMBER, DISPLAY_WHATSAPP_NUMBER, getWhatsAppUrl } from '@/lib/whatsapp';

export const WhatsAppFloating: React.FC = () => {
  const { settings } = useStore();
  const { isDrawerOpen } = useCart();

  // Hide when disabled in Admin settings or when Cart Drawer is open to prevent overlap
  if (settings.isWhatsAppFloatingEnabled === false || isDrawerOpen) {
    return null;
  }

  // Exact target URL: https://wa.me/923088666075 (or derived from site settings if custom)
  const targetUrl = getWhatsAppUrl(settings?.whatsapp);
  const displayPhone = settings?.whatsapp || DISPLAY_WHATSAPP_NUMBER;

  return (
    <aside
      aria-label="Floating WhatsApp Contact"
      className="fixed bottom-6 right-4 sm:right-6 z-30 flex flex-col items-end pointer-events-auto select-none"
    >
      <a
        href={targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="global-floating-whatsapp-btn"
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs py-3 px-3.5 sm:px-4 rounded-full shadow-glow-whatsapp animate-pulse-subtle transition-all active:scale-95 hover:shadow-xl group"
        aria-label={`Order on WhatsApp (${displayPhone})`}
        title={`Order on WhatsApp (${displayPhone})`}
      >
        <WhatsAppIcon
          size={20}
          className="text-white fill-current group-hover:scale-105 transition-transform flex-shrink-0"
        />
        <span className="hidden sm:inline font-semibold">WhatsApp Order</span>
      </a>
    </aside>
  );
};
