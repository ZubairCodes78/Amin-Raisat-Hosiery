'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { CheckCircle2, ArrowRight, Home } from 'lucide-react';
import { createOrderReceiptWhatsAppMessage } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export default function OrderConfirmationPage() {
  const params = useParams();
  const orderId = params?.orderId as string;
  const { orders, settings } = useStore();

  const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="text-2xl font-bold text-gray-950">Looking for Order...</h1>
        <p className="text-xs text-gray-500">
          If you just placed an order, please wait a moment or return to homepage.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-gray-950 text-white text-xs font-semibold py-2.5 px-5 rounded-lg"
        >
          <Home className="w-4 h-4" /> Go to Homepage
        </Link>
      </div>
    );
  }

  const whatsappUrl = createOrderReceiptWhatsAppMessage(order);

  return (
    <div className="py-12 bg-gray-50/50 min-h-[85vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Success Header */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-xs text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-3 py-1 rounded border border-emerald-200">
              Order Placed Successfully
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 mt-3">
              Thank You, {order.customerName}!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 font-normal">
              Your order has been recorded. We will contact you at <strong>{order.customerPhone}</strong> for dispatch confirmation.
            </p>
          </div>

          <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 max-w-sm mx-auto flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Order Number:</span>
            <span className="text-sm font-bold text-gray-950 font-mono tracking-wider">
              #{order.orderNumber}
            </span>
          </div>

          {/* WhatsApp Direct Notification CTA with Official WhatsAppIcon */}
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs py-3 px-6 rounded-lg shadow-sm transition-colors w-full sm:w-auto"
            >
              <WhatsAppIcon size={16} className="text-white fill-current" />
              <span>Share Order Confirmation on WhatsApp ({settings.whatsapp})</span>
            </a>
          </div>
        </div>

        {/* Order Details & Summary Card */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
          <h2 className="text-base font-bold text-gray-950 border-b border-gray-100 pb-3">
            Order Invoice &amp; Delivery Details
          </h2>

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-700">
            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
              <span className="font-bold text-gray-950 block text-xs uppercase tracking-wider">
                Delivery Address
              </span>
              <p className="font-semibold text-gray-950">{order.customerName}</p>
              <p>{order.address}</p>
              <p>{order.city}, {order.province}</p>
              <p className="pt-1 text-gray-700 font-mono font-medium">📞 {order.customerPhone}</p>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 space-y-1">
              <span className="font-bold text-gray-950 block text-xs uppercase tracking-wider">
                Payment &amp; Status
              </span>
              <p>
                Method:{' '}
                <strong className="text-gray-950 capitalize">
                  {order.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Direct Bank Transfer'}
                </strong>
              </p>
              <p>
                Order Status:{' '}
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  {order.status}
                </span>
              </p>
              <p className="text-[11px] text-gray-500 pt-1">
                Date: {new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Ordered Items List */}
          <div>
            <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wider mb-3">
              Ordered Items
            </h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-gray-950">{item.productName}</h4>
                    <p className="text-[11px] text-gray-500">
                      Quality: <strong>{item.quality}</strong> • Style: <strong>{item.sleeve}</strong> • Size: <strong>{item.size}</strong>
                    </p>
                    <p className="text-[11px] text-gray-700 font-medium mt-0.5">
                      {item.quantity} piece{item.quantity > 1 ? 's' : ''} x Rs. {item.unitPrice}
                    </p>
                  </div>
                  <div className="font-bold text-gray-950 text-xs">
                    Rs. {item.totalPrice}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-950">Rs. {order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="font-semibold text-gray-950">
                {order.deliveryFee === 0 ? 'FREE Delivery' : `Rs. ${order.deliveryFee}`}
              </span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold text-gray-950">
              <span>Total Payable</span>
              <span>Rs. {order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Back navigation */}
        <div className="text-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-900 hover:text-black transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
