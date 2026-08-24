'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Truck, Sparkles, AlertCircle } from 'lucide-react';
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
    regularSubtotal,
    wholesaleSubtotal,
    totalSavings,
    deliveryFee,
    totalAmount,
    isFreeDeliveryUnlocked,
    piecesNeededForFreeDelivery,
    hasWholesaleItems,
    wholesaleQuantity,
    isWholesaleMinimumMet,
    wholesalePiecesNeeded,
    wholesaleMinQty,
  } = useCart();
  const { settings } = useStore();

  const minRetailQty = settings.shipping.minOrderQty || 3;
  const isRetailMinMet = totalQuantity >= minRetailQty;
  const canProceed = hasWholesaleItems ? isWholesaleMinimumMet : isRetailMinMet;
  const freeThreshold = settings.shipping.freeDeliveryThreshold || 3;
  const whatsappUrl = createCartWhatsAppMessage(items, subtotal, deliveryFee, totalAmount, settings.whatsapp);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center space-y-4 bg-light-bg dark:bg-dark-bg text-charcoal-900 dark:text-gray-100 min-h-[75vh] flex flex-col items-center justify-center transition-colors duration-200">
        <div className="w-16 h-16 bg-white dark:bg-dark-surface rounded-2xl flex items-center justify-center mx-auto text-[#A07D38] dark:text-[#C9A96A] border border-light-border dark:border-dark-border shadow-sm">
          <ShoppingBag className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-charcoal-900 dark:text-gray-100">Your Cart is Empty</h1>
        <p className="text-xs sm:text-sm text-charcoal-500 dark:text-gray-400 max-w-md mx-auto">
          Explore our fine combed cotton essentials and select your size and options.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-champagne-500 hover:bg-champagne-400 text-black font-bold text-xs py-3 px-6 rounded-xl shadow-xs transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Retail Catalog</span>
          </Link>
          <Link
            href="/wholesale"
            className="inline-flex items-center gap-2 bg-white dark:bg-dark-card hover:bg-light-hover dark:hover:bg-dark-hover text-charcoal-900 dark:text-gray-100 border border-light-border dark:border-dark-border font-bold text-xs py-3 px-6 rounded-xl transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#A07D38] dark:text-[#C9A96A]" />
            <span>Wholesale Store</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 bg-light-bg dark:bg-dark-bg min-h-[85vh] text-charcoal-900 dark:text-gray-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-gray-100 tracking-tight">
            Shopping Cart ({totalQuantity} {totalQuantity === 1 ? 'piece' : 'pieces'})
          </h1>
          {hasWholesaleItems && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-champagne-100 dark:bg-[#1D2025] text-[#A07D38] dark:text-[#C9A96A] border border-[#C9A96A]/40 rounded-xl text-xs font-bold w-fit">
              <Sparkles className="w-4 h-4" />
              <span>Wholesale Bulk Order Active</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Items List (Left Col) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Wholesale or Free Delivery Bar */}
            {hasWholesaleItems ? (
              <div className="p-4 bg-champagne-50/80 dark:bg-dark-surface rounded-2xl border border-champagne-200 dark:border-dark-border shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="flex items-center gap-1.5 text-[#A07D38] dark:text-champagne-400">
                    <Sparkles className="w-4 h-4" />
                    {isWholesaleMinimumMet ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        ✓ Wholesale Minimum Met ({wholesaleQuantity} pcs) — Free Nationwide Delivery
                      </span>
                    ) : (
                      <span className="text-amber-800 dark:text-amber-300 font-bold">
                        Add {wholesalePiecesNeeded} more piece{wholesalePiecesNeeded > 1 ? 's' : ''} to meet Wholesale Minimum ({wholesaleMinQty} pcs)
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-bold text-charcoal-600 dark:text-gray-400">
                    {wholesaleQuantity}/{wholesaleMinQty} pcs
                  </span>
                </div>
                <div className="w-full bg-light-border dark:bg-dark-card rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isWholesaleMinimumMet ? 'bg-emerald-500' : 'bg-champagne-500'
                    }`}
                    style={{ width: `${Math.min(100, (wholesaleQuantity / wholesaleMinQty) * 100)}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-sm">
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#A07D38] dark:text-gold-400" />
                    {isFreeDeliveryUnlocked ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                        ✓ 100% FREE DELIVERY UNLOCKED ({freeThreshold}+ Pieces)
                      </span>
                    ) : (
                      <span className="text-charcoal-700 dark:text-gray-300">
                        Add <strong className="text-[#A07D38] dark:text-gold-400">{piecesNeededForFreeDelivery} more piece</strong> for Free Delivery
                      </span>
                    )}
                  </span>
                  <span className="text-xs font-bold text-charcoal-500 dark:text-gray-400">
                    {Math.min(totalQuantity, freeThreshold)}/{freeThreshold} pcs
                  </span>
                </div>
                <div className="w-full bg-light-border dark:bg-dark-card rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isFreeDeliveryUnlocked ? 'bg-emerald-500' : 'bg-champagne-500'
                    }`}
                    style={{ width: `${Math.min(100, (totalQuantity / freeThreshold) * 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Item rows */}
            <div className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-sm dark:shadow-card divide-y divide-light-border dark:divide-dark-border overflow-hidden">
              {items.map((item) => {
                const isWholesale = Boolean(item.isWholesale);
                const regPrice = item.regularPrice || item.unitPrice;
                const unitSaving = isWholesale && regPrice > item.unitPrice ? regPrice - item.unitPrice : 0;

                return (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-light-elevated dark:bg-dark-card rounded-xl overflow-hidden relative flex-shrink-0 border border-light-border dark:border-dark-border p-1">
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
                        <h3 className="font-bold text-sm text-charcoal-900 dark:text-gray-100">
                          {item.productName}
                        </h3>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-charcoal-400 dark:text-gray-400 hover:text-rose-500 transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {isWholesale && (
                          <span className="text-[10px] font-extrabold bg-[#C9A96A]/20 text-[#A07D38] dark:text-[#C9A96A] border border-[#C9A96A]/40 px-2 py-0.5 rounded uppercase tracking-wider">
                            Wholesale
                          </span>
                        )}
                        <span className="text-[10px] font-semibold bg-light-elevated dark:bg-dark-card border border-light-border dark:border-dark-border text-charcoal-700 dark:text-gray-300 px-2 py-0.5 rounded">
                          {item.quality}
                        </span>
                        <span className="text-[10px] font-semibold bg-light-elevated dark:bg-dark-card border border-light-border dark:border-dark-border text-charcoal-700 dark:text-gray-300 px-2 py-0.5 rounded">
                          {item.sleeve}
                        </span>
                        <span className="text-[10px] font-bold bg-champagne-500 text-black px-2 py-0.5 rounded">
                          Size {item.size}
                        </span>
                      </div>

                      <div className="pt-1 text-xs text-charcoal-500 dark:text-gray-400 flex items-center gap-2">
                        <span>Unit price: <strong>Rs. {item.unitPrice}</strong></span>
                        {isWholesale && regPrice > item.unitPrice && (
                          <span className="line-through text-charcoal-400">Rs. {regPrice}</span>
                        )}
                        {unitSaving > 0 && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                            (Save Rs. {unitSaving}/pc)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Item Total */}
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-light-border dark:border-dark-border">
                      <div className="flex items-center border border-light-border dark:border-dark-border rounded-lg bg-light-elevated dark:bg-dark-card overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-charcoal-700 dark:text-gray-300 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors font-bold text-xs"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-charcoal-900 dark:text-gold-400">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-charcoal-700 dark:text-gray-300 hover:bg-light-hover dark:hover:bg-dark-hover transition-colors font-bold text-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right min-w-[90px]">
                        <div className="text-sm font-bold text-[#A07D38] dark:text-gold-400">
                          Rs. {item.unitPrice * item.quantity}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary (Right Col) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 border border-light-border dark:border-dark-border shadow-sm dark:shadow-card space-y-4 sticky top-24">
              <h2 className="text-sm font-bold text-charcoal-900 dark:text-gray-100 border-b border-light-border dark:border-dark-border pb-3">
                Order Summary
              </h2>

              {/* Wholesale Minimum Alert */}
              {hasWholesaleItems && !isWholesaleMinimumMet && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <strong>Wholesale Minimum:</strong> Wholesale orders require a minimum of {wholesaleMinQty} pieces. Please add {wholesalePiecesNeeded} more piece{wholesalePiecesNeeded > 1 ? 's' : ''} to checkout.
                  </div>
                </div>
              )}

              {/* Retail Minimum Alert */}
              {!hasWholesaleItems && !isRetailMinMet && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <div>
                    <strong>Notice:</strong> Minimum order is {minRetailQty} pieces. Add at least {minRetailQty - totalQuantity} more piece to proceed.
                  </div>
                </div>
              )}

              {totalSavings > 0 && (
                <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                  <span>Wholesale Discount</span>
                  <span>- Rs. {totalSavings}</span>
                </div>
              )}

              <div className="space-y-2 text-xs text-charcoal-600 dark:text-gray-300">
                <div className="flex justify-between">
                  <span>Subtotal ({totalQuantity} pieces)</span>
                  <span className="font-semibold text-charcoal-900 dark:text-gray-100">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">FREE DELIVERY</span>
                    ) : (
                      `Rs. ${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="border-t border-light-border dark:border-dark-border pt-2 flex justify-between text-base font-bold text-[#A07D38] dark:text-gold-400">
                  <span>Total Amount</span>
                  <span>Rs. {totalAmount}</span>
                </div>
              </div>

              <div className="pt-2 space-y-2.5">
                <Link
                  href="/checkout"
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                    canProceed
                      ? 'bg-champagne-500 hover:bg-champagne-400 text-black active:scale-[0.99]'
                      : 'bg-light-hover dark:bg-dark-card text-charcoal-400 dark:text-gray-500 border border-light-border dark:border-dark-border cursor-not-allowed pointer-events-none'
                  }`}
                >
                  <span>Proceed to {hasWholesaleItems ? 'Wholesale ' : ''}Checkout</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-xs transition-all flex items-center justify-center gap-2"
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
