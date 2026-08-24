'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { CheckCircle2, ArrowRight, Home, Sparkles } from 'lucide-react';
import { createOrderReceiptWhatsAppMessage } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const { orders, settings } = useStore();

  const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4 bg-light-bg dark:bg-[#101114] text-charcoal-900 dark:text-[#F1F0EC] min-h-[70vh] flex flex-col items-center justify-center transition-colors duration-200">
        <h1 className="text-2xl font-bold text-charcoal-900 dark:text-[#F1F0EC]">Looking for Order...</h1>
        <p className="text-xs text-charcoal-500 dark:text-[#85888E]">
          If you just placed an order, please wait a moment or return to homepage.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-champagne-500 hover:bg-champagne-400 text-black text-xs font-bold py-3 px-6 rounded-xl shadow-xs"
        >
          <Home className="w-4 h-4" /> Go to Storefront
        </Link>
      </div>
    );
  }

  const whatsappUrl = createOrderReceiptWhatsAppMessage(order);

  return (
    <div className="py-12 bg-light-bg dark:bg-[#101114] min-h-[85vh] text-charcoal-900 dark:text-[#F1F0EC] transition-colors duration-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Header */}
        <div className="bg-white dark:bg-[#17191D] rounded-2xl p-8 border border-light-border dark:border-[#30343A] shadow-sm dark:shadow-card text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-300 dark:border-emerald-800/60">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-800/60">
                Order Confirmed
              </span>
              {order.isWholesale && (
                <span className="text-[10px] font-extrabold bg-[#C9A96A]/20 text-[#A07D38] dark:text-[#C9A96A] border border-[#C9A96A]/40 px-2.5 py-1 rounded-full uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Wholesale B2B
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-[#F1F0EC] mt-3 tracking-tight">
              Thank You, {order.customerName}!
            </h1>
            <p className="text-xs sm:text-sm text-charcoal-600 dark:text-gray-400 mt-1 font-normal">
              Your {order.isWholesale ? 'wholesale ' : ''}order has been recorded. We will contact you at <strong className="text-[#A07D38] dark:text-[#C9A96A]">{order.customerPhone}</strong> for dispatch confirmation.
            </p>
          </div>

          <div className="p-3.5 bg-light-elevated dark:bg-[#1D2025] rounded-xl border border-light-border dark:border-[#30343A] max-w-sm mx-auto flex items-center justify-between">
            <span className="text-xs text-charcoal-500 dark:text-gray-400 font-medium">Order Number:</span>
            <span className="text-sm font-bold text-[#A07D38] dark:text-[#C9A96A] font-mono tracking-wider">
              #{order.orderNumber}
            </span>
          </div>

          {/* WhatsApp Direct Notification CTA */}
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-xs transition-all w-full sm:w-auto"
            >
              <WhatsAppIcon size={16} className="text-white fill-current" />
              <span>Share Confirmation on WhatsApp ({settings.whatsapp})</span>
            </a>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-white dark:bg-[#17191D] rounded-2xl p-6 sm:p-8 border border-light-border dark:border-[#30343A] shadow-sm dark:shadow-card space-y-6">
          <h2 className="text-base font-bold text-charcoal-900 dark:text-[#F1F0EC] border-b border-light-border dark:border-[#30343A] pb-3">
            Order Invoice &amp; Delivery Details
          </h2>

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-charcoal-700 dark:text-gray-300">
            <div className="p-4 rounded-xl bg-light-elevated dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] space-y-1">
              <span className="font-bold text-[#A07D38] dark:text-[#C9A96A] block text-xs uppercase tracking-wider">
                Delivery Address
              </span>
              <p className="font-semibold text-charcoal-900 dark:text-[#F1F0EC]">{order.customerName}</p>
              <p>{order.address}</p>
              <p>{order.city}, {order.province}</p>
              <p className="pt-1 text-charcoal-900 dark:text-gray-300 font-mono font-medium">📞 {order.customerPhone}</p>
            </div>

            <div className="p-4 rounded-xl bg-light-elevated dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] space-y-1">
              <span className="font-bold text-[#A07D38] dark:text-[#C9A96A] block text-xs uppercase tracking-wider">
                Payment &amp; Status
              </span>
              <p>
                Method:{' '}
                <strong className="text-charcoal-900 dark:text-[#F1F0EC] capitalize">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Direct Bank Transfer'}
                </strong>
              </p>
              <p>
                Order Status:{' '}
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-white dark:bg-[#17191D] text-charcoal-900 dark:text-gray-200 border border-light-border dark:border-[#30343A]">
                  {order.status}
                </span>
              </p>
              <p className="text-[11px] text-charcoal-500 dark:text-gray-400 pt-1">
                Date: {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Ordered Items List */}
          <div>
            <h3 className="text-xs font-bold text-charcoal-900 dark:text-gray-200 uppercase tracking-wider mb-3">
              Ordered Garments
            </h3>
            <div className="border border-light-border dark:border-[#30343A] rounded-xl overflow-hidden divide-y divide-light-border dark:divide-[#30343A]">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-xs bg-light-elevated dark:bg-[#1D2025]">
                  <div>
                    <h4 className="font-bold text-charcoal-900 dark:text-[#F1F0EC]">{item.productName}</h4>
                    <p className="text-[11px] text-charcoal-500 dark:text-gray-400">
                      Quality: <strong>{item.quality}</strong> • Style: <strong>{item.sleeve}</strong> • Size: <strong>{item.size}</strong>
                    </p>
                    <p className="text-[11px] text-[#A07D38] dark:text-[#C9A96A] font-medium mt-0.5">
                      {item.quantity} piece{item.quantity > 1 ? 's' : ''} x Rs. {item.unitPrice}
                    </p>
                  </div>
                  <div className="font-bold text-[#A07D38] dark:text-[#C9A96A] text-xs">
                    Rs. {item.totalPrice}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-light-border dark:border-[#30343A] pt-3 space-y-1.5 text-xs text-charcoal-700 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-charcoal-900 dark:text-[#F1F0EC]">Rs. {order.subtotal}</span>
            </div>
            {order.wholesaleDiscount && order.wholesaleDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                <span>Wholesale Savings</span>
                <span>- Rs. {order.wholesaleDiscount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold">
                {order.deliveryFee === 0 ? (
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">FREE Delivery</span>
                ) : (
                  `Rs. ${order.deliveryFee}`
                )}
              </span>
            </div>
            <div className="border-t border-light-border dark:border-[#30343A] pt-2 flex justify-between text-base font-bold text-[#A07D38] dark:text-[#C9A96A]">
              <span>Total Payable</span>
              <span>Rs. {order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Back navigation */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A07D38] dark:text-[#C9A96A] hover:text-[#B48E47] dark:hover:text-[#D8BD88] transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
