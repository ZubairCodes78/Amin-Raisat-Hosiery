'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { createCartWhatsAppMessage } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    totalQuantity,
    subtotal,
    deliveryFee,
    totalAmount,
    isFreeDeliveryUnlocked,
    piecesNeededForFreeDelivery,
  } = useCart();
  const { settings } = useStore();

  const minOrderQty = settings.shipping.minOrderQty; // 2
  const isMinOrderMet = totalQuantity >= minOrderQty;
  const whatsappUrl = createCartWhatsAppMessage(items, subtotal, deliveryFee, totalAmount, settings.whatsapp);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-950">Your Cart is Empty</h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          Explore our fine combed cotton essentials and select your size and options.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-gray-950 hover:bg-black text-white font-semibold text-xs py-3 px-6 rounded-lg transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Shop</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-gray-50/50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 mb-8">
          Shopping Cart ({totalQuantity} {totalQuantity === 1 ? 'piece' : 'pieces'})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items List (Left Col) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Delivery Bar */}
            <div className="p-3.5 bg-gray-900 text-white rounded-xl shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-gray-300" />
                  {isFreeDeliveryUnlocked ? (
                    <span className="text-emerald-400 font-bold">
                      ✓ 100% FREE DELIVERY UNLOCKED ({settings.shipping.freeDeliveryThreshold}+ Pieces)
                    </span>
                  ) : (
                    <span>
                      Add <strong>{piecesNeededForFreeDelivery} more piece{piecesNeededForFreeDelivery > 1 ? 's' : ''}</strong> for Free Delivery
                    </span>
                  )}
                </span>
                <span className="text-xs font-bold text-gray-400">
                  {Math.min(totalQuantity, settings.shipping.freeDeliveryThreshold)}/{settings.shipping.freeDeliveryThreshold} pcs
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isFreeDeliveryUnlocked ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(100, (totalQuantity / settings.shipping.freeDeliveryThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Item rows */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-xs divide-y divide-gray-100 overflow-hidden">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-lg overflow-hidden relative flex-shrink-0 border border-gray-200 p-1">
                    <Image
                      src={
                        item.image ||
                        (item.quality === 'High Quality'
                          ? item.sleeve === 'Full Sleeve'
                            ? '/images/products/full sleeve high.jpeg'
                            : '/images/products/sleevless high.jpeg'
                          : '/images/products/sleevless low.jpeg')
                      }
                      alt={item.productName}
                      fill
                      sizes="80px"
                      className="object-contain object-center"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-gray-950">
                        {item.productName}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                        {item.quality}
                      </span>
                      <span className="text-[10px] font-semibold bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                        {item.sleeve}
                      </span>
                      <span className="text-[10px] font-bold bg-gray-950 text-white px-2 py-0.5 rounded">
                        Size {item.size}
                      </span>
                    </div>

                    <div className="pt-1 text-xs text-gray-500">
                      Unit price: Rs. {item.unitPrice}
                    </div>
                  </div>

                  {/* Quantity & Item Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-gray-100">
                    <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gray-950">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <div className="text-sm font-bold text-gray-950">
                        Rs. {item.unitPrice * item.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary (Right Col) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-xs space-y-4 sticky top-24">
              <h2 className="text-sm font-bold text-gray-950 border-b border-gray-100 pb-3">
                Order Summary
              </h2>

              {!isMinOrderMet && (
                <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs">
                  <strong>Notice:</strong> Minimum order is {minOrderQty} pieces. Add at least {minOrderQty - totalQuantity} more piece to proceed.
                </div>
              )}

              <div className="space-y-1.5 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal ({totalQuantity} pieces)</span>
                  <span className="font-semibold text-gray-950">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-950">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 font-bold">FREE ({settings.shipping.freeDeliveryThreshold}+ pcs)</span>
                    ) : (
                      `Rs. ${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-950">
                  <span>Total Amount</span>
                  <span>Rs. {totalAmount}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  href="/checkout"
                  className={`w-full py-3.5 px-4 rounded-lg font-bold text-xs text-white transition-colors flex items-center justify-center gap-2 ${
                    isMinOrderMet
                      ? 'bg-gray-950 hover:bg-black'
                      : 'bg-gray-400 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <span>Proceed to Guest Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-lg font-semibold text-xs bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <WhatsAppIcon size={16} className="text-white fill-current" />
                  <span>Order via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
