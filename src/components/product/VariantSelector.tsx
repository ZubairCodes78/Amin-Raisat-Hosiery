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
    <div className="space-y-6 select-none text-[#F1F0EC]">
      {/* Price & Stock Display Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#17191D] border border-[#30343A] flex items-center justify-between shadow-card">
        <div>
          <div className="flex items-baseline gap-2 whitespace-nowrap">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#C9A96A] tracking-tight">
              Rs. {price}
            </span>
            {comparePrice && (
              <span className="text-xs text-[#85888E] line-through font-normal">
                Rs. {comparePrice}
              </span>
            )}
            <span className="text-xs text-[#85888E] font-normal">/ piece</span>
          </div>
          <p className="text-xs text-[#B4B5BA] mt-1 font-medium whitespace-nowrap">
            Total for {quantity} pcs: <strong className="text-[#C9A96A] font-bold">Rs. {totalPrice}</strong>
          </p>
        </div>

        {/* Stock & SKU alert */}
        <div className="text-right">
          {stock <= 0 ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#D96B6B]/20 text-[#D96B6B] px-3 py-1 rounded-xl border border-[#D96B6B]/40 whitespace-nowrap">
              <ShieldAlert className="w-3.5 h-3.5" /> Out of Stock
            </span>
          ) : (
            <p className="text-xs font-medium text-[#85888E] whitespace-nowrap">
              SKU: <span className="font-mono text-[#F1F0EC] font-semibold">{currentVariant?.sku || 'ARH-SKU'}</span>
            </p>
          )}
        </div>
      </div>

      {/* STEP 1: Dynamic Sleeve / Style Selector (If multiple exist) */}
      {availableSleeves.length > 1 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#B4B5BA] flex items-center justify-between">
            <span>1. Select Sleeve Style</span>
            <span className="text-[#C9A96A] font-semibold text-[11px] whitespace-nowrap">
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
                      ? 'border-[#C9A96A] bg-[#C9A96A]/10 text-[#C9A96A] shadow-xs'
                      : 'border-[#30343A] bg-[#1D2025] text-[#B4B5BA] hover:border-[#3E434B]'
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
            <label className="text-xs font-bold uppercase tracking-wider text-[#B4B5BA]">
              {availableSleeves.length > 1 ? '2.' : '1.'} Select Size (Fit)
            </label>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-xs font-medium text-[#C9A96A] hover:underline flex items-center gap-1"
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
                      ? 'border-[#C9A96A] bg-[#C9A96A] text-[#101114] font-extrabold shadow-xs scale-105'
                      : isOutOfStock
                      ? 'border-[#30343A] bg-[#17191D] text-[#85888E] line-through opacity-60 cursor-not-allowed'
                      : 'border-[#30343A] bg-[#1D2025] text-[#F1F0EC] hover:border-[#3E434B]'
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
      <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-[#17191D] border border-[#30343A] shadow-card">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#F1F0EC] block">
              Quantity (Pieces)
            </label>
            <span className="text-[11px] text-[#85888E] font-normal">
              Minimum order: {minOrder} pieces
            </span>
          </div>

          <div className="flex items-center border border-[#30343A] rounded-xl bg-[#1D2025] overflow-hidden shadow-xs">
            <button
              type="button"
              disabled={quantity <= minOrder}
              onClick={() => setQuantity((prev) => Math.max(minOrder, prev - 1))}
              className="px-3.5 py-2 text-[#F1F0EC] hover:bg-[#202329] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-sm"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-12 text-center text-xs font-extrabold text-[#C9A96A]">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= maxOrder}
              onClick={() => setQuantity((prev) => Math.min(maxOrder, prev + 1))}
              className="px-3.5 py-2 text-[#F1F0EC] hover:bg-[#202329] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-sm"
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
              ? 'bg-[#3FB982]/15 border border-[#3FB982]/30 text-[#3FB982] font-medium'
              : 'bg-[#D6A84F]/15 border border-[#D6A84F]/30 text-[#D6A84F] font-normal'
          }`}
        >
          <Truck className="w-4 h-4 flex-shrink-0 text-[#C9A96A]" />
          {isFreeDeliveryForThis ? (
            <span>
              <strong className="text-[#3FB982]">Free Delivery Unlocked</strong> on this {quantity}-piece order across Pakistan!
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
              ? 'bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] active:scale-[0.99]'
              : 'bg-[#1D2025] text-[#85888E] border border-[#30343A] cursor-not-allowed'
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
            className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-[#17191D] hover:bg-[#1D2025] text-[#F1F0EC] border border-[#30343A] transition-colors flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-[#C9A96A]" />
            <span>Add to Cart</span>
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

      {/* Toast Notification */}
      {isAddedToast && (
        <div className="p-3.5 bg-[#17191D] border border-[#C9A96A]/40 text-[#F1F0EC] text-xs font-semibold rounded-xl shadow-elevation flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-[#3FB982]" />
          <span>Added {quantity} x {product.name} ({selectedSize}) to cart!</span>
        </div>
      )}

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-[#101114]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#17191D] rounded-2xl p-6 max-w-lg w-full shadow-elevation border border-[#30343A]">
            <div className="flex items-center justify-between pb-3 border-b border-[#30343A]">
              <h4 className="font-bold text-[#F1F0EC] text-base">
                Men&apos;s Vest Size Guide (Chest in Inches)
              </h4>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-1 text-[#85888E] hover:text-[#F1F0EC] rounded"
                aria-label="Close size guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#1D2025] text-[#C9A96A] uppercase font-bold border-b border-[#30343A]">
                  <tr>
                    <th className="p-2.5 rounded-l">Size</th>
                    <th className="p-2.5">Chest (Inches)</th>
                    <th className="p-2.5">Length (Inches)</th>
                    <th className="p-2.5 rounded-r">Fit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30343A] text-[#B4B5BA]">
                  <tr>
                    <td className="p-2.5 font-bold text-[#F1F0EC]">S</td>
                    <td className="p-2.5">34 - 36&quot;</td>
                    <td className="p-2.5">27&quot;</td>
                    <td className="p-2.5 text-[#85888E]">Slim Fit</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#F1F0EC]">M</td>
                    <td className="p-2.5">38 - 40&quot;</td>
                    <td className="p-2.5">28&quot;</td>
                    <td className="p-2.5 text-[#85888E]">Regular Fit</td>
                  </tr>
                  <tr className="bg-[#1D2025]/50">
                    <td className="p-2.5 font-bold text-[#C9A96A]">L</td>
                    <td className="p-2.5 font-semibold text-[#C9A96A]">42 - 44&quot;</td>
                    <td className="p-2.5 text-[#C9A96A]">29&quot;</td>
                    <td className="p-2.5 font-semibold text-[#C9A96A]">Most Popular</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#F1F0EC]">XL</td>
                    <td className="p-2.5">46 - 48&quot;</td>
                    <td className="p-2.5">30&quot;</td>
                    <td className="p-2.5 text-[#85888E]">Relaxed Fit</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-[#F1F0EC]">XXL</td>
                    <td className="p-2.5">50 - 52&quot;</td>
                    <td className="p-2.5">31&quot;</td>
                    <td className="p-2.5 text-[#85888E]">Comfort Fit</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full py-3 bg-[#C9A96A] text-[#101114] font-bold text-xs rounded-xl hover:bg-[#D8BD88] transition-colors"
            >
              Close Size Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
