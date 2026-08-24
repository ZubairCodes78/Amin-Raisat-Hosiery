'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SleeveType, ProductSize, Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag, Truck, Check, HelpCircle, X, ShieldAlert, Zap, Sparkles, TrendingDown, Layers } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { createProductWhatsAppMessage } from '@/lib/whatsapp';

interface VariantSelectorProps {
  product: Product;
  selectedSleeve: SleeveType;
  setSelectedSleeve: (s: SleeveType) => void;
  selectedSize: ProductSize;
  setSelectedSize: (size: ProductSize) => void;
  defaultWholesale?: boolean;
}

const SIZES: ProductSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

const WHOLESALE_PACK_OPTIONS = [
  { count: 12, label: '1 Dozen (12 pcs)' },
  { count: 24, label: '2 Dozen (24 pcs)' },
  { count: 36, label: '3 Dozen (36 pcs)' },
  { count: 48, label: '4 Dozen (48 pcs)' },
  { count: 60, label: '5 Dozen (60 pcs)' },
];

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  product,
  selectedSleeve,
  setSelectedSleeve,
  selectedSize,
  setSelectedSize,
  defaultWholesale = false,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isWholesaleFromQuery = searchParams.get('wholesale') === 'true';

  const { addItem, openDrawer } = useCart();
  const { settings } = useStore();

  const [isWholesaleMode, setIsWholesaleMode] = useState(defaultWholesale || isWholesaleFromQuery);
  const [quantity, setQuantity] = useState(isWholesaleMode ? (product.wholesaleMinQty || 12) : 3);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isAddedToast, setIsAddedToast] = useState(false);

  const wholesaleMin = product.wholesaleMinQty || 12;

  // Sync mode if query changes
  React.useEffect(() => {
    if (isWholesaleFromQuery && !isWholesaleMode) {
      setIsWholesaleMode(true);
      setQuantity((q) => Math.max(wholesaleMin, q));
    }
  }, [isWholesaleFromQuery, wholesaleMin, isWholesaleMode]);

  // Available sleeves specifically for this product
  const availableSleeves = React.useMemo(() => {
    const sleeves = Array.from(new Set(product.variants.map((v) => v.sleeve).filter(Boolean)));
    return sleeves.length > 0 ? sleeves : ['Sleeveless'];
  }, [product.variants]);

  const availableSizes = React.useMemo(() => {
    const matchingVariants = product.variants.filter((v) => v.sleeve === selectedSleeve);
    const sizes = Array.from(new Set(matchingVariants.map((v) => v.size).filter(Boolean)));
    return sizes.length > 0 ? sizes : SIZES;
  }, [product.variants, selectedSleeve]);

  // If current sleeve is not in available, auto-switch
  React.useEffect(() => {
    if (availableSleeves.length > 0 && !availableSleeves.includes(selectedSleeve)) {
      setSelectedSleeve(availableSleeves[0]);
    }
  }, [availableSleeves, selectedSleeve, setSelectedSleeve]);

  // If current size is not in available, auto-switch
  React.useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize, setSelectedSize]);

  // Find matching variant
  const currentVariant: ProductVariant | undefined =
    product.variants.find(
      (v) => v.sleeve === selectedSleeve && v.size === selectedSize
    ) ||
    product.variants.find((v) => v.sleeve === selectedSleeve) ||
    product.variants[0];

  const retailPrice = currentVariant ? (currentVariant.salePrice || currentVariant.price) : 480;
  const baseWholesalePrice = currentVariant?.wholesalePrice || Math.round(retailPrice * 0.82);

  // Compute effective price based on quantity tiers if in wholesale mode
  let effectiveUnitPrice = retailPrice;
  let activeTierLabel = '';

  if (isWholesaleMode) {
    effectiveUnitPrice = baseWholesalePrice;
    if (currentVariant?.wholesaleTiers && currentVariant.wholesaleTiers.length > 0) {
      for (const tier of currentVariant.wholesaleTiers) {
        if (quantity >= tier.minQty && (!tier.maxQty || quantity <= tier.maxQty)) {
          if (tier.price) {
            effectiveUnitPrice = Number(tier.price);
          } else if (tier.discountPercent) {
            effectiveUnitPrice = Math.round(retailPrice * (1 - tier.discountPercent / 100));
          }
          activeTierLabel = tier.label || '';
        }
      }
    }
  }

  const stock = currentVariant ? currentVariant.stock : 50;
  const isAvailable = currentVariant ? currentVariant.isAvailable && stock > 0 : true;

  const minOrder = isWholesaleMode ? wholesaleMin : (settings.shipping.minOrderQty || 3);
  const maxOrder = isWholesaleMode ? 5000 : Math.min(settings.shipping.maxOrderQty || 12, stock || 12);
  const freeDeliveryThreshold = settings.shipping.freeDeliveryThreshold || 3;

  const totalPrice = effectiveUnitPrice * quantity;
  const regularTotal = retailPrice * quantity;
  const unitSavings = Math.max(0, retailPrice - effectiveUnitPrice);
  const totalSavings = Math.max(0, regularTotal - totalPrice);
  const isFreeDeliveryForThis = isWholesaleMode || quantity >= freeDeliveryThreshold;

  const toggleOrderMode = (wholesale: boolean) => {
    setIsWholesaleMode(wholesale);
    if (wholesale) {
      setQuantity((prev) => Math.max(wholesaleMin, prev));
    } else {
      setQuantity((prev) => Math.min(12, Math.max(3, prev)));
    }
  };

  const getVariantMediaUrl = () => {
    const match = product.media?.find(
      (m) => !m.variantSleeve || m.variantSleeve === 'All' || m.variantSleeve === selectedSleeve
    );
    return match?.url || product.media?.[0]?.url || '/images/products/sleevless high.jpeg';
  };

  const handleBuyNow = () => {
    if (!isAvailable) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      quality: currentVariant?.quality || 'High Quality',
      sleeve: selectedSleeve,
      size: selectedSize,
      unitPrice: effectiveUnitPrice,
      regularPrice: retailPrice,
      wholesalePrice: baseWholesalePrice,
      isWholesale: isWholesaleMode,
      quantity,
      image: getVariantMediaUrl(),
    });

    router.push('/checkout');
  };

  const handleAddToCart = () => {
    if (!isAvailable) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      quality: currentVariant?.quality || 'High Quality',
      sleeve: selectedSleeve,
      size: selectedSize,
      unitPrice: effectiveUnitPrice,
      regularPrice: retailPrice,
      wholesalePrice: baseWholesalePrice,
      isWholesale: isWholesaleMode,
      quantity,
      image: getVariantMediaUrl(),
    });

    setIsAddedToast(true);
    setTimeout(() => {
      setIsAddedToast(false);
      openDrawer();
    }, 600);
  };

  const whatsappUrl = createProductWhatsAppMessage(
    product.name,
    currentVariant?.quality || 'High Quality',
    selectedSleeve,
    selectedSize,
    quantity,
    effectiveUnitPrice,
    totalPrice,
    settings.whatsapp
  );

  return (
    <div className="space-y-6 select-none text-charcoal-900 dark:text-[#F1F0EC]">
      {/* MODE TOGGLE: Retail (Min 3 pcs) vs Wholesale B2B (Min 12 pcs) */}
      <div className="p-1 bg-light-elevated dark:bg-[#17191D] border border-light-border dark:border-[#30343A] rounded-2xl flex items-center shadow-xs">
        <button
          type="button"
          onClick={() => toggleOrderMode(false)}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            !isWholesaleMode
              ? 'bg-white dark:bg-[#23262B] text-charcoal-900 dark:text-[#F1F0EC] shadow-sm border border-light-border dark:border-[#3E434B]'
              : 'text-charcoal-600 dark:text-[#85888E] hover:text-charcoal-900 dark:hover:text-[#F1F0EC]'
          }`}
        >
          <span>Retail Order</span>
          <span className="text-[10px] text-charcoal-400 dark:text-gray-400 font-normal">(Min 3 pcs)</span>
        </button>

        <button
          type="button"
          onClick={() => toggleOrderMode(true)}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            isWholesaleMode
              ? 'bg-champagne-500 text-black shadow-xs'
              : 'text-charcoal-600 dark:text-[#85888E] hover:text-charcoal-900 dark:hover:text-[#F1F0EC]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Wholesale Bulk</span>
          <span className="text-[10px] bg-black/15 text-black px-1.5 py-0.2 rounded font-extrabold">Min 12 pcs</span>
        </button>
      </div>

      {/* RETAIL VS WHOLESALE COMPARISON CARD */}
      <div className="p-4 sm:p-5 rounded-2xl bg-light-elevated dark:bg-[#17191D] border border-light-border dark:border-[#30343A] shadow-sm dark:shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-2 whitespace-nowrap">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#A07D38] dark:text-[#C9A96A] tracking-tight">
                Rs. {effectiveUnitPrice}
              </span>
              {isWholesaleMode && (
                <span className="text-xs text-charcoal-400 dark:text-[#85888E] line-through font-normal">
                  Rs. {retailPrice}
                </span>
              )}
              <span className="text-xs text-charcoal-500 dark:text-[#85888E] font-normal">/ piece</span>
            </div>
            <p className="text-xs text-charcoal-600 dark:text-[#B4B5BA] mt-1 font-medium whitespace-nowrap">
              Total for {quantity} pcs: <strong className="text-[#A07D38] dark:text-[#C9A96A] font-bold">Rs. {totalPrice}</strong>
            </p>
          </div>

          <div className="text-right">
            {stock <= 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#D96B6B]/20 text-[#D96B6B] px-3 py-1 rounded-xl border border-[#D96B6B]/40 whitespace-nowrap">
                <ShieldAlert className="w-3.5 h-3.5" /> Out of Stock
              </span>
            ) : (
              <div>
                <p className="text-xs font-medium text-charcoal-500 dark:text-[#85888E] whitespace-nowrap">
                  SKU: <span className="font-mono text-charcoal-900 dark:text-[#F1F0EC] font-semibold">{currentVariant?.sku || 'ARH-SKU'}</span>
                </p>
                {isWholesaleMode && (
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-full inline-block mt-1">
                    Save Rs. {unitSavings}/pc ({Math.round((unitSavings / retailPrice) * 100)}% OFF)
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Wholesale comparison pill box */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-light-border dark:border-[#30343A] text-center text-xs">
          <div className="p-2 rounded-xl bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A]">
            <span className="text-[10px] text-charcoal-500 dark:text-gray-400 block font-medium">Retail</span>
            <strong className="text-charcoal-900 dark:text-gray-100 font-bold">Rs. {retailPrice}</strong>
          </div>
          <div className="p-2 rounded-xl bg-champagne-50 dark:bg-[#202329] border border-champagne-200 dark:border-[#3E434B]">
            <span className="text-[10px] text-[#A07D38] dark:text-[#C9A96A] block font-semibold">Wholesale</span>
            <strong className="text-[#A07D38] dark:text-[#C9A96A] font-extrabold">Rs. {baseWholesalePrice}</strong>
          </div>
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50">
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-semibold">Your Savings</span>
            <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">Rs. {unitSavings}/pc</strong>
          </div>
        </div>
      </div>

      {/* STEP 1: Sleeve / Style Selector */}
      {availableSleeves.length > 1 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-[#B4B5BA] flex items-center justify-between">
            <span>1. Select Sleeve Style</span>
            <span className="text-[#A07D38] dark:text-[#C9A96A] font-semibold text-[11px] whitespace-nowrap">
              {selectedSleeve}
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {availableSleeves.map((sl) => {
              const isSelected = selectedSleeve === sl;
              return (
                <button
                  key={sl}
                  type="button"
                  onClick={() => setSelectedSleeve(sl)}
                  className={`p-3 rounded-xl border text-center font-bold text-xs transition-all whitespace-nowrap ${
                    isSelected
                      ? 'border-[#C9A96A] bg-champagne-50 dark:bg-[#C9A96A]/10 text-[#A07D38] dark:text-[#C9A96A] shadow-xs'
                      : 'border-light-border dark:border-[#30343A] bg-white dark:bg-[#1D2025] text-charcoal-700 dark:text-[#B4B5BA] hover:border-[#C9A96A]/40'
                  }`}
                >
                  {sl}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Size Selector */}
      {availableSizes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-[#B4B5BA]">
              {availableSleeves.length > 1 ? '2.' : '1.'} Select Size (Fit)
            </label>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-xs font-medium text-[#A07D38] dark:text-[#C9A96A] hover:underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Size Guide
            </button>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {availableSizes.map((s) => {
              const isSelected = selectedSize === s;
              const sizeVar = product.variants.find(
                (v) => v.sleeve === selectedSleeve && v.size === s
              );
              const sizeStock = sizeVar ? sizeVar.stock : 1;
              const isOutOfStock = sizeStock <= 0;

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`py-2.5 px-4 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center min-w-[54px] ${
                    isSelected
                      ? 'border-[#C9A96A] bg-champagne-500 text-[#101114] font-extrabold shadow-xs scale-105'
                      : isOutOfStock
                      ? 'border-light-border dark:border-[#30343A] bg-light-elevated dark:bg-[#17191D] text-charcoal-400 dark:text-[#85888E] line-through opacity-60 cursor-not-allowed'
                      : 'border-light-border dark:border-[#30343A] bg-white dark:bg-[#1D2025] text-charcoal-900 dark:text-[#F1F0EC] hover:border-[#C9A96A]/40'
                  }`}
                >
                  <span>{s}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* WHOLESALE QUICK PACK SELECTOR (When in wholesale mode) */}
      {isWholesaleMode && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-charcoal-700 dark:text-[#B4B5BA] flex items-center justify-between">
            <span>Quick Pack Selection (Dozens)</span>
            <span className="text-[11px] text-[#A07D38] dark:text-[#C9A96A] font-semibold">
              {quantity} pieces selected
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {WHOLESALE_PACK_OPTIONS.map((pack) => {
              const isSelected = quantity === pack.count;
              return (
                <button
                  key={pack.count}
                  type="button"
                  onClick={() => setQuantity(pack.count)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                    isSelected
                      ? 'border-[#C9A96A] bg-[#C9A96A] text-black shadow-xs font-extrabold'
                      : 'border-light-border dark:border-[#30343A] bg-white dark:bg-[#1D2025] text-charcoal-700 dark:text-[#B4B5BA] hover:border-[#C9A96A]/40'
                  }`}
                >
                  {pack.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Quantity Counter & Rules */}
      <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-light-elevated dark:bg-[#17191D] border border-light-border dark:border-[#30343A] shadow-sm dark:shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-charcoal-900 dark:text-[#F1F0EC] block">
              Quantity (Pieces)
            </label>
            <span className="text-[11px] text-charcoal-500 dark:text-[#85888E] font-normal">
              Minimum {isWholesaleMode ? 'wholesale' : 'retail'}: {minOrder} pieces
            </span>
          </div>

          <div className="flex items-center border border-light-border dark:border-[#30343A] rounded-xl bg-white dark:bg-[#1D2025] overflow-hidden shadow-xs">
            <button
              type="button"
              disabled={quantity <= minOrder}
              onClick={() => setQuantity((prev) => Math.max(minOrder, prev - (isWholesaleMode ? 6 : 1)))}
              className="px-3.5 py-2 text-charcoal-900 dark:text-[#F1F0EC] hover:bg-light-hover dark:hover:bg-[#202329] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-sm"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-14 text-center text-xs font-extrabold text-[#A07D38] dark:text-[#C9A96A]">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= maxOrder}
              onClick={() => setQuantity((prev) => Math.min(maxOrder, prev + (isWholesaleMode ? 6 : 1)))}
              className="px-3.5 py-2 text-charcoal-900 dark:text-[#F1F0EC] hover:bg-light-hover dark:hover:bg-[#202329] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-sm"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Savings & Free Delivery Progress */}
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between ${
            isFreeDeliveryForThis
              ? 'bg-emerald-50 dark:bg-[#3FB982]/15 border border-emerald-200 dark:border-[#3FB982]/30 text-emerald-800 dark:text-[#3FB982] font-medium'
              : 'bg-amber-50 dark:bg-[#D6A84F]/15 border border-amber-200 dark:border-[#D6A84F]/30 text-amber-800 dark:text-[#D6A84F] font-normal'
          }`}
        >
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 flex-shrink-0 text-[#A07D38] dark:text-[#C9A96A]" />
            <span>
              {isFreeDeliveryForThis ? (
                <span><strong>Free Delivery Unlocked</strong> on this {quantity}-piece order across Pakistan!</span>
              ) : (
                <span>Add <strong>{Math.max(1, freeDeliveryThreshold - quantity)} more piece</strong> for Free Delivery.</span>
              )}
            </span>
          </div>
          {totalSavings > 0 && (
            <span className="font-bold text-emerald-700 dark:text-emerald-300 whitespace-nowrap ml-2">
              Save Rs. {totalSavings}
            </span>
          )}
        </div>
      </div>

      {/* CTA BUTTONS */}
      <div className="space-y-3 pt-2">
        {/* PRIMARY CTA: BUY NOW */}
        <button
          type="button"
          disabled={!isAvailable}
          onClick={handleBuyNow}
          className={`w-full py-4 px-6 rounded-xl font-extrabold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-sm ${
            isAvailable
              ? 'bg-champagne-500 hover:bg-champagne-400 text-black active:scale-[0.99]'
              : 'bg-light-hover dark:bg-[#1D2025] text-charcoal-400 dark:text-[#85888E] border border-light-border dark:border-[#30343A] cursor-not-allowed'
          }`}
        >
          <Zap className="w-4 h-4 fill-current stroke-[2.5]" />
          <span>
            {isAvailable
              ? isWholesaleMode
                ? `ORDER WHOLESALE PACK (${quantity} PCS) • Rs. ${totalPrice}`
                : `BUY NOW • Rs. ${totalPrice} (FREE DELIVERY)`
              : 'Out of Stock'}
          </span>
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Secondary Add to Cart */}
          <button
            type="button"
            disabled={!isAvailable}
            onClick={handleAddToCart}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-white dark:bg-[#17191D] hover:bg-light-hover dark:hover:bg-[#1D2025] text-charcoal-900 dark:text-[#F1F0EC] border border-light-border dark:border-[#30343A] transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-[#A07D38] dark:text-[#C9A96A]" />
            <span>Add {isWholesaleMode ? 'Wholesale Pack ' : ''}to Cart</span>
          </button>

          {/* WhatsApp Order */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <WhatsAppIcon size={16} className="text-white fill-current" />
            <span>Order on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* SIZE GUIDE MODAL */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#17191D] border border-light-border dark:border-[#30343A] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-elevation">
            <div className="flex items-center justify-between border-b border-light-border dark:border-[#30343A] pb-3">
              <h3 className="font-bold text-base text-charcoal-900 dark:text-[#F1F0EC]">Size Guide (Inches)</h3>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-light-border dark:border-[#30343A] text-charcoal-500 dark:text-[#85888E]">
                    <th className="py-2">Size</th>
                    <th className="py-2">Chest (Inches)</th>
                    <th className="py-2">Length (Inches)</th>
                    <th className="py-2">Recommended Fit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-[#30343A] text-charcoal-900 dark:text-[#F1F0EC]">
                  <tr><td className="py-2 font-bold text-[#A07D38] dark:text-[#C9A96A]">S (36)</td><td>34&quot; - 36&quot;</td><td>27&quot;</td><td>Slim / Small</td></tr>
                  <tr><td className="py-2 font-bold text-[#A07D38] dark:text-[#C9A96A]">M (38)</td><td>37&quot; - 39&quot;</td><td>28&quot;</td><td>Regular Medium</td></tr>
                  <tr><td className="py-2 font-bold text-[#A07D38] dark:text-[#C9A96A]">L (40)</td><td>40&quot; - 42&quot;</td><td>29&quot;</td><td>Standard Large</td></tr>
                  <tr><td className="py-2 font-bold text-[#A07D38] dark:text-[#C9A96A]">XL (42)</td><td>43&quot; - 45&quot;</td><td>30&quot;</td><td>Extra Large</td></tr>
                  <tr><td className="py-2 font-bold text-[#A07D38] dark:text-[#C9A96A]">XXL (44)</td><td>46&quot; - 48&quot;</td><td>31&quot;</td><td>Plus Size</td></tr>
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-charcoal-500 dark:text-[#85888E]">
              * Measurements in standard inches. 100% fine combed cotton knit with gentle natural stretch.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
