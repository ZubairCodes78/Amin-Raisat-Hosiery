'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SleeveType, ProductSize, Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag, Truck, Check, HelpCircle, X, ShieldAlert, Zap } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { createProductWhatsAppMessage } from '@/lib/whatsapp';

interface VariantSelectorProps {
  product: Product;
  selectedSleeve: SleeveType;
  setSelectedSleeve: (s: SleeveType) => void;
  selectedSize: ProductSize;
  setSelectedSize: (size: ProductSize) => void;
}

const SIZES: ProductSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  product,
  selectedSleeve,
  setSelectedSleeve,
  selectedSize,
  setSelectedSize,
}) => {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();
  const { settings } = useStore();
  const [quantity, setQuantity] = useState(3); // default minimum order is 3 pieces
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isAddedToast, setIsAddedToast] = useState(false);

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

  const price = currentVariant ? currentVariant.price : 480;
  const comparePrice = currentVariant?.salePrice ? currentVariant.salePrice : undefined;
  const stock = currentVariant ? currentVariant.stock : 50;
  const isAvailable = currentVariant ? currentVariant.isAvailable && stock > 0 : true;

  const minOrder = settings.shipping.minOrderQty || 3;
  const maxOrder = Math.min(settings.shipping.maxOrderQty || 12, stock || 12);
  const freeDeliveryThreshold = settings.shipping.freeDeliveryThreshold || 3;

  const totalPrice = price * quantity;
  const isFreeDeliveryForThis = quantity >= freeDeliveryThreshold;

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
      unitPrice: price,
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
      unitPrice: price,
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
    price,
    totalPrice,
    settings.whatsapp
  );

  return (
    <div className="space-y-6 select-none">
      {/* Price & Stock Display Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-dark-surface border border-dark-border flex items-center justify-between shadow-card">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-gold-400 tracking-tight">
              Rs. {price}
            </span>
            {comparePrice && (
              <span className="text-xs text-gray-500 line-through font-normal">
                Rs. {comparePrice}
              </span>
            )}
            <span className="text-xs text-gray-400 font-normal">/ piece</span>
          </div>
          <p className="text-xs text-gray-300 mt-1 font-medium">
            Total for {quantity} pcs: <strong className="text-gold-400 font-bold">Rs. {totalPrice}</strong>
          </p>
        </div>

        {/* Stock & SKU alert */}
        <div className="text-right">
          {stock <= 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-rose-950/60 text-rose-300 px-2.5 py-1 rounded-lg border border-rose-800/60">
              <ShieldAlert className="w-3.5 h-3.5" /> Out of Stock
            </span>
          ) : (
            <p className="text-xs font-medium text-gray-400">
              SKU: <span className="font-mono text-gray-200 font-semibold">{currentVariant?.sku || 'ARH-SKU'}</span>
            </p>
          )}
        </div>
      </div>

      {/* STEP 1: Dynamic Sleeve / Style Selector (If multiple exist) */}
      {availableSleeves.length > 1 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center justify-between">
            <span>1. Select Sleeve Style</span>
            <span className="text-gold-400 font-semibold text-[11px]">
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
                  className={`p-3 rounded-xl border-2 text-center font-bold text-xs transition-all ${
                    isSelected
                      ? 'border-gold-500 bg-gold-500/10 text-gold-400 shadow-glow-gold'
                      : 'border-dark-border bg-dark-card text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {sl}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Dynamic Size Selector */}
      {availableSizes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
              {availableSleeves.length > 1 ? '2.' : '1.'} Select Size (Fit)
            </label>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-xs font-medium text-gold-400 hover:underline flex items-center gap-1"
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
                  className={`py-2.5 px-4 rounded-xl border-2 font-bold text-xs transition-all flex flex-col items-center justify-center min-w-[54px] ${
                    isSelected
                      ? 'border-gold-500 bg-gold-500 text-black font-extrabold shadow-glow-gold'
                      : isOutOfStock
                      ? 'border-dark-border bg-dark-surface text-gray-600 line-through opacity-60 cursor-not-allowed'
                      : 'border-dark-border bg-dark-card text-gray-200 hover:border-dark-border-light'
                  }`}
                >
                  <span>{s}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Quantity Counter & Delivery Rules */}
      <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-dark-surface border border-dark-border shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-200 block">
              Quantity (Pieces)
            </label>
            <span className="text-[11px] text-gray-400 font-normal">
              Minimum order: {minOrder} pieces
            </span>
          </div>

          <div className="flex items-center border border-dark-border rounded-xl bg-dark-card overflow-hidden shadow-sm">
            <button
              type="button"
              disabled={quantity <= minOrder}
              onClick={() => setQuantity((prev) => Math.max(minOrder, prev - 1))}
              className="px-3.5 py-2 text-gray-300 hover:bg-dark-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-sm"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-12 text-center text-xs font-extrabold text-gold-400">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= maxOrder}
              onClick={() => setQuantity((prev) => Math.min(maxOrder, prev + 1))}
              className="px-3.5 py-2 text-gray-300 hover:bg-dark-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-sm"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Free Delivery Progress Alert */}
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2.5 ${
            isFreeDeliveryForThis
              ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-medium'
              : 'bg-amber-950/50 border border-amber-800/50 text-amber-300 font-normal'
          }`}
        >
          <Truck className="w-4 h-4 flex-shrink-0 text-gold-400" />
          {isFreeDeliveryForThis ? (
            <span>
              <strong className="text-emerald-400">Free Delivery Unlocked</strong> on this {quantity}-piece order across Pakistan!
            </span>
          ) : (
            <span>
              Add <strong>{Math.max(1, freeDeliveryThreshold - quantity)} more piece</strong> for <strong>100% Free Nationwide Delivery</strong>.
            </span>
          )}
        </div>
      </div>

      {/* CTA BUTTONS (BUY NOW as Primary, Add to Cart as Secondary) */}
      <div className="space-y-3 pt-2">
        {/* PRIMARY CTA: BUY NOW */}
        <button
          type="button"
          disabled={!isAvailable}
          onClick={handleBuyNow}
          className={`w-full py-4 px-6 rounded-xl font-extrabold text-xs transition-all duration-200 flex items-center justify-center gap-2 shadow-elevation ${
            isAvailable
              ? 'bg-gold-500 hover:bg-gold-400 text-black shadow-glow-gold active:scale-[0.99]'
              : 'bg-dark-card text-gray-500 border border-dark-border cursor-not-allowed'
          }`}
        >
          <Zap className="w-4 h-4 fill-current stroke-[2.5]" />
          <span>{isAvailable ? `BUY NOW • Rs. ${totalPrice} (FREE DELIVERY)` : 'Out of Stock'}</span>
        </button>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Secondary Add to Cart */}
          <button
            type="button"
            disabled={!isAvailable}
            onClick={handleAddToCart}
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-dark-surface hover:bg-dark-hover text-gray-200 border border-dark-border transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-gold-400" />
            <span>Add to Cart</span>
          </button>

          {/* WhatsApp Order */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#1EBE5D] hover:shadow-glow-whatsapp text-white shadow-xs transition-all flex items-center justify-center gap-2"
          >
            <WhatsAppIcon size={16} className="text-white fill-current" />
            <span>Order on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Toast Notification */}
      {isAddedToast && (
        <div className="p-3.5 bg-dark-card border border-gold-500/40 text-gray-100 text-xs font-semibold rounded-xl shadow-elevation flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Added {quantity} x {product.name} ({selectedSize}) to cart!</span>
        </div>
      )}

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-surface rounded-2xl p-6 max-w-lg w-full shadow-elevation border border-dark-border">
            <div className="flex items-center justify-between pb-3 border-b border-dark-border">
              <h4 className="font-bold text-gray-100 text-base">
                Men&apos;s Vest Size Guide (Chest in Inches)
              </h4>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-100 rounded"
                aria-label="Close size guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-dark-card text-gold-400 uppercase font-bold border-b border-dark-border">
                  <tr>
                    <th className="p-2.5 rounded-l">Size</th>
                    <th className="p-2.5">Chest (Inches)</th>
                    <th className="p-2.5">Length (Inches)</th>
                    <th className="p-2.5 rounded-r">Fit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border text-gray-300">
                  <tr>
                    <td className="p-2.5 font-bold text-white">S</td>
                    <td className="p-2.5">34 - 36&quot;</td>
                    <td className="p-2.5">27&quot;</td>
                    <td className="p-2.5 text-gray-400">Slim Fit</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">M</td>
                    <td className="p-2.5">38 - 40&quot;</td>
                    <td className="p-2.5">28&quot;</td>
                    <td className="p-2.5 text-gray-400">Regular Fit</td>
                  </tr>
                  <tr className="bg-dark-card/50">
                    <td className="p-2.5 font-bold text-gold-400">L</td>
                    <td className="p-2.5 font-semibold text-gold-400">42 - 44&quot;</td>
                    <td className="p-2.5 text-gold-400">29&quot;</td>
                    <td className="p-2.5 font-semibold text-gold-400">Most Popular</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">XL</td>
                    <td className="p-2.5">46 - 48&quot;</td>
                    <td className="p-2.5">30&quot;</td>
                    <td className="p-2.5 text-gray-400">Relaxed Fit</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-white">XXL</td>
                    <td className="p-2.5">50 - 52&quot;</td>
                    <td className="p-2.5">31&quot;</td>
                    <td className="p-2.5 text-gray-400">Comfort Fit</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full py-3 bg-gold-500 text-black font-bold text-xs rounded-xl hover:bg-gold-400 transition-colors shadow-glow-gold"
            >
              Close Size Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
