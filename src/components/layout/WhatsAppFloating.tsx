'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export const WhatsAppFloating: React.FC = () => {
  const { settings } = useStore();
  const { isDrawerOpen } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  // Hide when disabled in Admin settings or when Cart Drawer is open
  if (settings.isWhatsAppFloatingEnabled === false || isDrawerOpen) {
    return null;
  }

  const cleanNumber = '92' + settings.whatsapp.replace(/^0/, '');
  const directLink = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    'Assalam-o-Alaikum Amin Raisat Hosiery, I have a question regarding Men’s Vest.'
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Quick message popup */}
      {isOpen && (
        <div className="mb-3 w-72 bg-white rounded-xl shadow-xl border border-gray-200 p-4 transition-all">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#25D366] text-white flex items-center justify-center">
                <WhatsAppIcon size={14} className="text-white fill-current" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">{settings.brandName}</p>
                <p className="text-[10px] text-gray-500 font-medium">WhatsApp Support</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-700 p-1 rounded"
              aria-label="Close message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-xs text-gray-600 my-3 leading-relaxed">
            Need help choosing your size or placing an order? Contact Muhammad Amin directly on WhatsApp.
          </p>

          <a
            href={directLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full text-center bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs py-2 px-3 rounded-lg transition-colors"
          >
            <WhatsAppIcon size={14} className="text-white fill-current" />
            <span>Chat on WhatsApp ({settings.whatsapp})</span>
          </a>
        </div>
      )}

      {/* Main Floating WhatsApp Button with subtle gentle pulse & soft glow */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-medium text-xs py-3 px-4 rounded-full shadow-glow-whatsapp animate-pulse-subtle transition-all active:scale-95 hover:shadow-xl group"
        aria-label="Order on WhatsApp"
      >
        <WhatsAppIcon size={20} className="text-white fill-current group-hover:scale-105 transition-transform" />
        <span className="hidden sm:inline font-semibold">WhatsApp Order</span>
      </button>
    </div>
  );
};
