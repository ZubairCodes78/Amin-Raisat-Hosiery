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

// Helper to guarantee authentic variant thumbnail resolution
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

  const minOrderQty = settings.shipping.minOrderQty; // 2
  const isMinOrderMet = totalQuantity >= minOrderQty;
  const whatsappUrl = createCartWhatsAppMessage(items, subtotal, deliveryFee, totalAmount, settings.whatsapp);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out animate-in slide-in-from-right">
          {/* Drawer Header */}
          <div className="p-4 sm:p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-950 text-white rounded-lg">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-gray-950 text-base">Your Cart</h3>
                <p className="text-xs text-gray-500 font-medium">
                  {totalQuantity} {totalQuantity === 1 ? 'piece' : 'pieces'} selected
                </p>
              </div>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-200 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Delivery Progressive Bar */}
          <div className="p-3.5 bg-gray-900 text-white border-b border-gray-800">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-gray-300" />
                {isFreeDeliveryUnlocked ? (
                  <span className="text-emerald-400 font-bold">
                    ✓ 100% FREE DELIVERY UNLOCKED!
                  </span>
                ) : (
                  <span>
                    Add <strong>{piecesNeededForFreeDelivery} more piece{piecesNeededForFreeDelivery > 1 ? 's' : ''}</strong> for Free Delivery
                  </span>
                )}
              </span>
              <span className="text-[11px] font-bold text-gray-400">
                {Math.min(totalQuantity, settings.shipping.freeDeliveryThreshold)}/{settings.shipping.freeDeliveryThreshold} pcs
              </span>
            </div>
            {/* Progress Track */}
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isFreeDeliveryUnlocked ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
                style={{ width: `${Math.min(100, (totalQuantity / settings.shipping.freeDeliveryThreshold) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 mt-1">
              <span>Below {settings.shipping.freeDeliveryThreshold} pcs: Rs. {settings.shipping.baseDeliveryCharge}</span>
              <span>{settings.shipping.freeDeliveryThreshold}+ pcs: Free Delivery</span>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-gray-100">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-3">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-gray-950 text-base">Your cart is empty</h4>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Browse our combed cotton essentials and select your size and options.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    onClick={closeDrawer}
                    className="inline-flex items-center gap-2 bg-gray-950 hover:bg-black text-white font-semibold text-xs py-2.5 px-5 rounded-lg transition-colors"
                  >
                    Browse Shop Now
                  </Link>
                </div>
              </div>
            ) : (
              items.map((item) => {
                const itemImg = getCartItemImage(item);
                return (
                  <div key={item.id} className="pt-3.5 first:pt-0 flex gap-3 items-center">
                    {/* Thumbnail on the LEFT side */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-lg overflow-hidden relative flex-shrink-0 border border-gray-200 p-1">
                      <Image
                        src={itemImg}
                        alt={`${item.productName} - ${item.quality} ${item.sleeve}`}
                        fill
                        sizes="64px"
                        className="object-contain object-center"
                      />
                    </div>

                    {/* Details beside the thumbnail */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs sm:text-sm text-gray-950 truncate leading-snug">
                            {item.productName}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-gray-400 hover:text-rose-600 transition-colors p-0.5"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Variant Badges */}
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <span className="text-[10px] font-semibold bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded">
                            {item.quality}
                          </span>
                          <span className="text-[10px] font-semibold bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded">
                            {item.sleeve}
                          </span>
                          <span className="text-[10px] font-bold bg-gray-950 text-white px-1.5 py-0.5 rounded">
                            Size {item.size}
                          </span>
                        </div>
                      </div>

                      {/* Quantity & Unit Price */}
                      <div className="flex items-center justify-between mt-2 pt-0.5">
                        <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-xs"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-gray-950">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-xs"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-xs sm:text-sm font-bold text-gray-950">
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
            <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 space-y-3">
              {/* Min order validation warning */}
              {!isMinOrderMet && (
                <div className="p-2 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs">
                  <strong>Notice:</strong> Minimum order is {minOrderQty} pieces. Please add {minOrderQty - totalQuantity} more piece to checkout.
                </div>
              )}

              {/* Price Calculation breakdown */}
              <div className="space-y-1 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span>Subtotal ({totalQuantity} pcs)</span>
                  <span className="font-semibold text-gray-950">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Fee</span>
                  <span className="font-semibold text-gray-950">
                    {deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee}`}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold text-gray-950">
                  <span>Total Amount</span>
                  <span>Rs. {totalAmount}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-bold text-xs text-white transition-all duration-200 ${
                    isMinOrderMet
                      ? 'bg-gray-950 hover:bg-black hover:shadow-glow-primary active:scale-[0.99]'
                      : 'bg-gray-400 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <span>Proceed to Guest Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-semibold text-xs bg-[#25D366] hover:bg-[#1EBE5D] text-white transition-colors shadow-xs"
                >
                  <WhatsAppIcon size={16} className="text-white fill-current" />
                  <span>Order Directly on WhatsApp</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
