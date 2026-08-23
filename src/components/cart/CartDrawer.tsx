'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { createCartWhatsAppMessage } from '@/lib/whatsapp';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { CartItem } from '@/types';

// Guarantee authentic thumbnail resolution
function getCartItemImage(item: CartItem): string {
  if (item.image && item.image.trim() !== '') return item.image;
  if (item.quality === 'High Quality') {
    if (item.sleeve === 'Full Sleeve') return '/images/products/full sleeve high.jpeg';
    return '/images/products/sleevless high.jpeg';
  }
  return '/images/products/sleevless low.jpeg';
}

export const CartDrawer: React.FC = () => {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
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

  if (!isDrawerOpen) return null;

  const minOrderQty = settings.shipping.minOrderQty || 3;
  const isMinOrderMet = totalQuantity >= minOrderQty;
  const freeThreshold = settings.shipping.freeDeliveryThreshold || 3;
  const whatsappUrl = createCartWhatsAppMessage(items, subtotal, deliveryFee, totalAmount, settings.whatsapp);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-dark-surface border-l border-dark-border shadow-elevation flex flex-col transition-transform duration-300 ease-out animate-in slide-in-from-right text-gray-100">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-dark-border flex items-center justify-between bg-dark-card">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gold-500 text-black rounded-xl shadow-glow-gold">
                <ShoppingBag className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-bold text-gray-100 text-base">Your Cart</h3>
                <p className="text-xs text-gray-400 font-medium">
                  {totalQuantity} {totalQuantity === 1 ? 'piece' : 'pieces'} selected
                </p>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-gray-400 hover:text-gray-100 rounded-lg hover:bg-dark-hover transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Progressive Bar */}
          <div className="p-4 bg-dark-bg border-b border-dark-border">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-gold-400" />
                {isFreeDeliveryUnlocked ? (
                  <span className="text-emerald-400 font-bold">
                    ✓ 100% FREE DELIVERY UNLOCKED!
                  </span>
                ) : (
                  <span className="text-gray-300">
                    Add <strong className="text-gold-400">{piecesNeededForFreeDelivery} more piece</strong> for Free Delivery
                  </span>
                )}
              </span>
              <span className="text-[11px] font-bold text-gray-400">
                {Math.min(totalQuantity, freeThreshold)}/{freeThreshold} pcs
              </span>
            </div>
            {/* Progress Track */}
            <div className="w-full bg-dark-card border border-dark-border rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeDeliveryUnlocked ? 'bg-emerald-400' : 'bg-gold-500 shadow-glow-gold'
                }`}
                style={{ width: `${Math.min(100, (totalQuantity / freeThreshold) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 font-medium">
              <span>Min order: {minOrderQty} pieces</span>
              <span className="text-gold-400">{freeThreshold}+ pcs: Free Delivery</span>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-dark-border">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 bg-dark-card rounded-full flex items-center justify-center mx-auto text-gray-500 border border-dark-border">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-200 text-base">Your cart is empty</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  Browse our combed cotton essentials and select your size and options.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    onClick={closeDrawer}
                    className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs py-2.5 px-5 rounded-xl shadow-glow-gold transition-colors"
                  >
                    Browse Catalog
                  </Link>
                </div>
              </div>
            ) : (
              items.map((item) => {
                const itemImg = getCartItemImage(item);
                return (
                  <div key={item.id} className="pt-3.5 first:pt-0 flex gap-3.5 items-center">
                    {/* Thumbnail on the LEFT */}
                    <div className="w-16 h-16 sm:w-18 sm:h-18 bg-dark-card rounded-xl overflow-hidden relative flex-shrink-0 border border-dark-border p-1">
                      <Image
                        src={itemImg}
                        alt={`${item.productName} - ${item.quality} ${item.sleeve}`}
                        fill
                        sizes="72px"
                        className="object-contain object-center"
                      />
                    </div>

                    {/* Details beside thumbnail */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-gray-100 truncate leading-snug">
                            {item.productName}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-rose-400 transition-colors p-0.5"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Variant Badges */}
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <span className="text-[10px] font-semibold bg-dark-card border border-dark-border text-gray-300 px-1.5 py-0.2 rounded">
                            {item.quality}
                          </span>
                          <span className="text-[10px] font-semibold bg-dark-card border border-dark-border text-gray-300 px-1.5 py-0.2 rounded">
                            {item.sleeve}
                          </span>
                          <span className="text-[10px] font-bold bg-gold-500 text-black px-1.5 py-0.2 rounded">
                            Size {item.size}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between mt-2 pt-0.5">
                        <div className="flex items-center border border-dark-border rounded-lg bg-dark-card overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-gray-300 hover:bg-dark-hover transition-colors font-bold text-xs"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-gold-400">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-gray-300 hover:bg-dark-hover transition-colors font-bold text-xs"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-bold text-gold-400">
                            Rs. {item.unitPrice * item.quantity}
                          </div>
                          <div className="text-[10px] text-gray-500">
                            (Rs. {item.unitPrice} each)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-dark-card border-t border-dark-border space-y-3">
              {/* Min order validation warning */}
              {!isMinOrderMet && (
                <div className="p-2.5 bg-amber-950/50 border border-amber-800/60 text-amber-300 rounded-xl text-xs">
                  <strong>Notice:</strong> Minimum order is {minOrderQty} pieces. Please add {minOrderQty - totalQuantity} more piece to checkout.
                </div>
              )}

              {/* Price Calculation */}
              <div className="space-y-1.5 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal ({totalQuantity} pcs)</span>
                  <span className="font-semibold text-gray-100">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-bold">FREE DELIVERY</span>
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

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-xs transition-all duration-200 shadow-elevation ${
                    isMinOrderMet
                      ? 'bg-gold-500 hover:bg-gold-400 text-black shadow-glow-gold active:scale-[0.99]'
                      : 'bg-dark-surface text-gray-500 border border-dark-border cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#1EBE5D] hover:shadow-glow-whatsapp text-white transition-all shadow-xs"
                >
                  <WhatsAppIcon size={16} className="text-white fill-current" />
                  <span>Order on WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
