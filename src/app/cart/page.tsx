'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck } from 'lucide-react';
import { createCartWhatsAppMessage } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { CartItem } from '@/types';

function getCartItemImage(item: CartItem): string {
  if (item.image && item.image.trim() !== '') return item.image;
  if (item.quality === 'High Quality') {
    if (item.sleeve === 'Full Sleeve') return '/images/products/full sleeve high.jpeg';
    return '/images/products/sleevless high.jpeg';
  }
  return '/images/products/sleevless low.jpeg';
}

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

  const minOrderQty = settings.shipping.minOrderQty || 3;
  const isMinOrderMet = totalQuantity >= minOrderQty;
  const freeThreshold = settings.shipping.freeDeliveryThreshold || 3;
  const whatsappUrl = createCartWhatsAppMessage(items, subtotal, deliveryFee, totalAmount, settings.whatsapp);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4 bg-dark-bg text-gray-100 min-h-[75vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-dark-surface rounded-2xl flex items-center justify-center mx-auto text-gold-400 border border-dark-border shadow-card">
          <ShoppingBag className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">Your Cart is Empty</h1>
        <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
          Explore our fine combed cotton essentials and select your size and options.
        </p>
        <div className="pt-2">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs py-3 px-6 rounded-xl shadow-glow-gold transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Explore Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-dark-bg min-h-[85vh] text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-100 mb-8 tracking-tight">
          Shopping Cart ({totalQuantity} {totalQuantity === 1 ? 'piece' : 'pieces'})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items List (Left Col) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Free Delivery Bar */}
            <div className="p-4 bg-dark-surface rounded-2xl border border-dark-border shadow-card">
              <div className="flex items-center justify-between text-xs font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-gold-400" />
                  {isFreeDeliveryUnlocked ? (
                    <span className="text-emerald-400 font-bold">
                      ✓ 100% FREE DELIVERY UNLOCKED ({freeThreshold}+ Pieces)
                    </span>
                  ) : (
                    <span className="text-gray-300">
                      Add <strong className="text-gold-400">{piecesNeededForFreeDelivery} more piece</strong> for Free Delivery
                    </span>
                  )}
                </span>
                <span className="text-xs font-bold text-gray-400">
                  {Math.min(totalQuantity, freeThreshold)}/{freeThreshold} pcs
                </span>
              </div>
              <div className="w-full bg-dark-card border border-dark-border rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isFreeDeliveryUnlocked ? 'bg-emerald-400' : 'bg-gold-500 shadow-glow-gold'
                  }`}
                  style={{ width: `${Math.min(100, (totalQuantity / freeThreshold) * 100)}%` }}
                />
              </div>
            </div>

            {/* Item rows */}
            <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-card divide-y divide-dark-border overflow-hidden">
              {items.map((item) => (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-dark-card rounded-xl overflow-hidden relative flex-shrink-0 border border-dark-border p-1">
                    <Image
                      src={getCartItemImage(item)}
                      alt={item.productName}
                      fill
                      sizes="80px"
                      className="object-contain object-center"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-gray-100">
                        {item.productName}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-rose-400 transition-colors p-1"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      <span className="text-[10px] font-semibold bg-dark-card border border-dark-border text-gray-300 px-2 py-0.5 rounded">
                        {item.quality}
                      </span>
                      <span className="text-[10px] font-semibold bg-dark-card border border-dark-border text-gray-300 px-2 py-0.5 rounded">
                        {item.sleeve}
                      </span>
                      <span className="text-[10px] font-bold bg-gold-500 text-black px-2 py-0.5 rounded">
                        Size {item.size}
                      </span>
                    </div>

                    <div className="pt-1 text-xs text-gray-400">
                      Unit price: Rs. {item.unitPrice}
                    </div>
                  </div>

                  {/* Quantity & Item Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-dark-border">
                    <div className="flex items-center border border-dark-border rounded-lg bg-dark-card overflow-hidden">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-gray-300 hover:bg-dark-hover transition-colors font-bold text-xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-gold-400">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-gray-300 hover:bg-dark-hover transition-colors font-bold text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <div className="text-sm font-bold text-gold-400">
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
            <div className="bg-dark-surface rounded-2xl p-6 border border-dark-border shadow-card space-y-4 sticky top-24">
              <h2 className="text-sm font-bold text-gray-100 border-b border-dark-border pb-3">
                Order Summary
              </h2>

              {!isMinOrderMet && (
                <div className="p-2.5 bg-amber-950/50 border border-amber-800/60 text-amber-300 rounded-xl text-xs">
                  <strong>Notice:</strong> Minimum order is {minOrderQty} pieces. Add at least {minOrderQty - totalQuantity} more piece to proceed.
                </div>
              )}

              <div className="space-y-1.5 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal ({totalQuantity} pieces)</span>
                  <span className="font-semibold text-gray-100">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-bold">FREE ({freeThreshold}+ pcs)</span>
                    ) : (
                      `Rs. ${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="border-t border-dark-border pt-2 flex justify-between text-base font-bold text-gold-400">
                  <span>Total Amount</span>
                  <span>Rs. {totalAmount}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <Link
                  href="/checkout"
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-elevation ${
                    isMinOrderMet
                      ? 'bg-gold-500 hover:bg-gold-400 text-black shadow-glow-gold active:scale-[0.99]'
                      : 'bg-dark-card text-gray-500 border border-dark-border cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#1EBE5D] hover:shadow-glow-whatsapp text-white shadow-xs transition-all flex items-center justify-center gap-2"
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
