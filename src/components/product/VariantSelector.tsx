'use client';

import React, { useState } from 'react';
import { QualityType, SleeveType, ProductSize, Product, ProductVariant } from '@/types';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag, Truck, Check, HelpCircle, X, ShieldAlert } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { createProductWhatsAppMessage } from '@/lib/whatsapp';

interface VariantSelectorProps {
  product: Product;
  selectedQuality: QualityType;
  setSelectedQuality: (q: QualityType) => void;
  selectedSleeve: SleeveType;
  setSelectedSleeve: (s: SleeveType) => void;
  selectedSize: ProductSize;
  setSelectedSize: (size: ProductSize) => void;
}

const SIZES: ProductSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  product,
  selectedQuality,
  setSelectedQuality,
  selectedSleeve,
  setSelectedSleeve,
  selectedSize,
  setSelectedSize,
}) => {
  const { addItem } = useCart();
  const { settings } = useStore();
  const [quantity, setQuantity] = useState(2); // default minimum order is 2 pieces
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
  const [isAddedToast, setIsAddedToast] = useState(false);

  const availableQualities = React.useMemo(() => {
    return Array.from(new Set(product.variants.map((v) => v.quality).filter(Boolean)));
  }, [product.variants]);

  // Filter available sleeves specifically for the selected quality tier
  const availableSleeves = React.useMemo(() => {
    const matchingVariants = product.variants.filter((v) => v.quality === selectedQuality);
    const sleeves = Array.from(new Set(matchingVariants.map((v) => v.sleeve).filter(Boolean)));
    return sleeves.length > 0 ? sleeves : Array.from(new Set(product.variants.map((v) => v.sleeve).filter(Boolean)));
  }, [product.variants, selectedQuality]);

  const availableSizes = React.useMemo(() => {
    const matchingVariants = product.variants.filter(
      (v) => v.quality === selectedQuality && v.sleeve === selectedSleeve
    );
    const sizes = Array.from(new Set(matchingVariants.map((v) => v.size).filter(Boolean)));
    return sizes.length > 0 ? sizes : Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)));
  }, [product.variants, selectedQuality, selectedSleeve]);

  // If current sleeve is not available in the newly selected quality, auto-switch
  React.useEffect(() => {
    if (availableSleeves.length > 0 && !availableSleeves.includes(selectedSleeve)) {
      setSelectedSleeve(availableSleeves[0]);
    }
  }, [availableSleeves, selectedSleeve, setSelectedSleeve]);

  // If current size is not available in the newly selected quality/sleeve, auto-switch
  React.useEffect(() => {
    if (availableSizes.length > 0 && !availableSizes.includes(selectedSize)) {
      setSelectedSize(availableSizes[0]);
    }
  }, [availableSizes, selectedSize, setSelectedSize]);

  // Find exact matching variant
  const currentVariant: ProductVariant | undefined = product.variants.find(
    (v) =>
      v.quality === selectedQuality &&
      v.sleeve === selectedSleeve &&
      v.size === selectedSize
  ) || product.variants.find((v) => v.quality === selectedQuality) || product.variants[0];

  const price = currentVariant ? currentVariant.price : 480;
  const comparePrice = currentVariant?.salePrice ? currentVariant.salePrice : undefined;
  const stock = currentVariant ? currentVariant.stock : 50;
  const isAvailable = currentVariant ? currentVariant.isAvailable && stock > 0 : true;

  const minOrder = settings.shipping.minOrderQty;
  const maxOrder = Math.min(settings.shipping.maxOrderQty, stock || 12);

  const totalPrice = price * quantity;
  const isFreeDeliveryForThis = quantity >= settings.shipping.freeDeliveryThreshold;

  const handleAddToCart = () => {
    if (!isAvailable) return;

    const variantMediaUrl =
      product.media?.find(
        (m) =>
          (!m.variantQuality || m.variantQuality === 'All' || m.variantQuality === selectedQuality) &&
          (!m.variantSleeve || m.variantSleeve === 'All' || m.variantSleeve === selectedSleeve)
      )?.url ||
      product.media?.[0]?.url ||
      '/images/products/sleevless high.jpeg';

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      quality: selectedQuality,
      sleeve: selectedSleeve,
      size: selectedSize,
      unitPrice: price,
      quantity: quantity,
      image: variantMediaUrl,
    });

    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2500);
  };

  const whatsappUrl = createProductWhatsAppMessage(
    product.name,
    selectedQuality,
    selectedSleeve,
    selectedSize,
    quantity,
    price,
    totalPrice,
    settings.whatsapp
  );

  return (
    <div className="space-y-6">
      {/* Price & Stock Display Header */}
      <div className="p-4 sm:p-5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-gray-950 tracking-tight">
              Rs. {price}
            </span>
            {comparePrice && (
              <span className="text-xs text-gray-400 line-through font-normal">
                Rs. {comparePrice}
              </span>
            )}
            <span className="text-xs text-gray-500 font-normal">/ piece</span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            Total for {quantity} pcs: <strong className="text-gray-950 font-bold">Rs. {totalPrice}</strong>
          </p>
        </div>

        {/* SKU and stock alert */}
        <div className="text-right">
          {stock <= 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold bg-red-50 text-red-700 px-2.5 py-1 rounded border border-red-200">
              <ShieldAlert className="w-3.5 h-3.5" /> Out of Stock
            </span>
          ) : (
            <p className="text-xs font-medium text-gray-500">
              SKU: <span className="font-mono text-gray-800 font-semibold">{currentVariant?.sku || 'ARH-SKU'}</span>
            </p>
          )}
        </div>
      </div>

      {/* STEP 1: Dynamic Quality Selector */}
      {availableQualities.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center justify-between">
            <span>1. Select Construction Quality</span>
            <span className="text-gray-900 font-semibold lowercase text-[11px]">
              {selectedQuality}
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {availableQualities.map((q) => {
              const isSelected = selectedQuality === q;
              return (
                <button
                  key={q}
                  type="button"
                  onClick={() => setSelectedQuality(q)}
                  className={`p-3 sm:p-3.5 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-gray-950 bg-gray-950 text-white shadow-xs'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm">{q}</span>
                    {isSelected && <span className="text-xs font-bold">✓</span>}
                  </div>
                  <p className={`text-[11px] mt-1 line-clamp-1 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                    {q.toLowerCase().includes('high')
                      ? 'Reinforced taped seams & soft feel'
                      : q.toLowerCase().includes('low')
                      ? '100% pure cotton daily wear'
                      : 'Premium combed cotton yarn'}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Dynamic Sleeve/Style Selector */}
      {availableSleeves.length > 0 && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center justify-between">
            <span>2. Select Style / Variant</span>
            <span className="text-gray-900 font-semibold lowercase text-[11px]">
              {selectedSleeve}
            </span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {availableSleeves.map((sl) => {
              const isSelected = selectedSleeve === sl;
              return (
                <button
                  key={sl}
                  type="button"
                  onClick={() => setSelectedSleeve(sl)}
                  className={`p-2.5 sm:p-3 rounded-xl border-2 text-center font-bold text-xs transition-all ${
                    isSelected
                      ? 'border-gray-950 bg-gray-950 text-white shadow-xs'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-gray-300'
                  }`}
                >
                  {sl}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Dynamic Size Selector */}
      {availableSizes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
              3. Select Size (Fit)
            </label>
            <button
              type="button"
              onClick={() => setIsSizeGuideOpen(true)}
              className="text-xs font-medium text-gray-600 hover:text-black underline flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Size Guide
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableSizes.map((s) => {
              const isSelected = selectedSize === s;
              const sizeVar = product.variants.find(
                (v) => v.quality === selectedQuality && v.sleeve === selectedSleeve && v.size === s
              );
              const sizeStock = sizeVar ? sizeVar.stock : 1;
              const isOutOfStock = sizeStock <= 0;

              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedSize(s)}
                  className={`py-2 px-3.5 sm:px-4 rounded-lg border-2 font-bold text-xs transition-all flex flex-col items-center justify-center min-w-[48px] ${
                    isSelected
                      ? 'border-gray-950 bg-gray-950 text-white shadow-xs'
                      : isOutOfStock
                      ? 'border-gray-200 bg-gray-100 text-gray-400 line-through opacity-70'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <span>{s}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: Quantity Counter & Delivery Rules */}
      <div className="space-y-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-900 block">
              Quantity (Pieces)
            </label>
            <span className="text-[11px] text-gray-500 font-normal">
              Min: 2 pcs | Max: 12 pcs
            </span>
          </div>

          <div className="flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
            <button
              type="button"
              disabled={quantity <= minOrder}
              onClick={() => setQuantity((prev) => Math.max(minOrder, prev - 1))}
              className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-sm"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="w-10 text-center text-xs font-bold text-gray-950">
              {quantity}
            </span>
            <button
              type="button"
              disabled={quantity >= maxOrder}
              onClick={() => setQuantity((prev) => Math.min(maxOrder, prev + 1))}
              className="px-3 py-1.5 text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-sm"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Free Delivery Progress Alert */}
        <div
          className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
            isFreeDeliveryForThis
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium'
              : 'bg-amber-50 border border-amber-200 text-amber-900 font-normal'
          }`}
        >
          <Truck className="w-4 h-4 flex-shrink-0" />
          {isFreeDeliveryForThis ? (
            <span>
              <strong>Free Delivery Unlocked</strong> for this order!
            </span>
          ) : (
            <span>
              Add <strong>{Math.max(1, settings.shipping.freeDeliveryThreshold - quantity)} more piece{Math.max(1, settings.shipping.freeDeliveryThreshold - quantity) > 1 ? 's' : ''}</strong> for <strong>Free Delivery</strong> (Delivery below {settings.shipping.freeDeliveryThreshold} pcs is Rs.{' '}
              {settings.shipping.baseDeliveryCharge}).
            </span>
          )}
        </div>
      </div>

      {/* CTA BUTTONS */}
      <div className="space-y-2.5 pt-1">
        <button
          type="button"
          disabled={!isAvailable}
          onClick={handleAddToCart}
          className={`w-full py-3.5 px-6 rounded-lg font-bold text-xs text-white transition-all duration-200 flex items-center justify-center gap-2 ${
            isAvailable
              ? 'bg-gray-950 hover:bg-black hover:shadow-glow-primary shadow-sm active:scale-[0.99]'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>{isAvailable ? `Add ${quantity} Pieces to Cart • Rs. ${totalPrice}` : 'Out of Stock'}</span>
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-6 rounded-lg font-semibold text-xs bg-[#25D366] hover:bg-[#1EBE5D] hover:shadow-glow-whatsapp text-white shadow-sm transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.99]"
        >
          <WhatsAppIcon size={16} className="text-white fill-current" />
          <span>Order via WhatsApp ({selectedQuality} • {selectedSize})</span>
        </a>
      </div>

      {/* Toast Notification */}
      {isAddedToast && (
        <div className="p-3 bg-gray-900 text-white text-xs font-semibold rounded-lg shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Added {quantity} x Men&apos;s Vest to your cart!</span>
        </div>
      )}

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h4 className="font-bold text-gray-950 text-base">
                Men&apos;s Vest Size Guide (Chest in Inches)
              </h4>
              <button
                onClick={() => setIsSizeGuideOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-900 rounded"
                aria-label="Close size guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4">
              <table className="w-full text-xs text-left">
                <thead className="bg-gray-100 text-gray-900 uppercase font-bold">
                  <tr>
                    <th className="p-2.5 rounded-l">Size</th>
                    <th className="p-2.5">Chest (Inches)</th>
                    <th className="p-2.5">Length (Inches)</th>
                    <th className="p-2.5 rounded-r">Fit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="p-2.5 font-bold">S</td>
                    <td className="p-2.5">34 - 36&quot;</td>
                    <td className="p-2.5">27&quot;</td>
                    <td className="p-2.5 text-gray-600">Slim Fit</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">M</td>
                    <td className="p-2.5">38 - 40&quot;</td>
                    <td className="p-2.5">28&quot;</td>
                    <td className="p-2.5 text-gray-600">Regular Fit</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="p-2.5 font-bold">L</td>
                    <td className="p-2.5 font-semibold">42 - 44&quot;</td>
                    <td className="p-2.5">29&quot;</td>
                    <td className="p-2.5 font-semibold">Most Popular</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">XL</td>
                    <td className="p-2.5">46 - 48&quot;</td>
                    <td className="p-2.5">30&quot;</td>
                    <td className="p-2.5 text-gray-600">Relaxed Fit</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold">XXL</td>
                    <td className="p-2.5">50 - 52&quot;</td>
                    <td className="p-2.5">31&quot;</td>
                    <td className="p-2.5 text-gray-600">Comfort Fit</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setIsSizeGuideOpen(false)}
              className="w-full py-2.5 bg-gray-950 text-white rounded-lg font-bold text-xs hover:bg-black"
            >
              Close Size Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
