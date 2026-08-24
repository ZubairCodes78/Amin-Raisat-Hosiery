'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product, ProductSize, SleeveType } from '@/types';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag, Zap, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isWholesaleView?: boolean;
}

const AVAILABLE_SIZES: ProductSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

export const ProductCard: React.FC<ProductCardProps> = ({ product, isWholesaleView = false }) => {
  const router = useRouter();
  const { addItem, openDrawer } = useCart();
  const { categories } = useStore();

  const [selectedSleeve, setSelectedSleeve] = useState<SleeveType>(() => {
    return product.variants?.[0]?.sleeve || 'Sleeveless';
  });
  const [selectedSize, setSelectedSize] = useState<ProductSize>('L');
  const [justAdded, setJustAdded] = useState(false);

  // Dynamic category name
  const productCategory = useMemo(() => {
    return categories.find(
      (c) =>
        c.id === product.categoryId ||
        c.slug === product.categoryId ||
        (c.slug === 'men' && (!product.categoryId || product.categoryId === 'cat-men'))
    );
  }, [categories, product.categoryId]);

  const categoryLabel = productCategory?.name
    ? `${productCategory.name}'s Collection`
    : 'Cotton Essentials';

  // Compute available sleeves for this specific product listing
  const availableSleeves = useMemo(() => {
    const sleeves = Array.from(new Set(product.variants.map((v) => v.sleeve).filter(Boolean)));
    return sleeves.length > 0 ? sleeves : ['Sleeveless'];
  }, [product.variants]);

  // Compute matched variant
  const currentVariant =
    product.variants.find(
      (v) => v.sleeve === selectedSleeve && v.size === selectedSize
    ) ||
    product.variants.find((v) => v.sleeve === selectedSleeve) ||
    product.variants[0];

  const retailPrice = currentVariant ? (currentVariant.salePrice || currentVariant.price) : 480;
  const wholesalePrice = currentVariant?.wholesalePrice || Math.round(retailPrice * 0.82);
  const price = isWholesaleView ? wholesalePrice : retailPrice;
  const comparePrice = isWholesaleView ? retailPrice : (currentVariant?.salePrice ? currentVariant.price + 120 : undefined);
  const unitSavings = retailPrice - wholesalePrice;
  const stock = currentVariant ? currentVariant.stock : 50;
  const isAvailable = currentVariant ? currentVariant.isAvailable && stock > 0 : true;

  // Media photos list
  const photoMedia = product.media.filter((m) => m.type === 'photo');

  // Resolve matching photo for chosen sleeve
  const currentPhoto = useMemo(() => {
    const match = product.media.find(
      (m) => !m.variantSleeve || m.variantSleeve === 'All' || m.variantSleeve === selectedSleeve
    );
    return match?.url || photoMedia[0]?.url || '/images/products/sleevless high.jpeg';
  }, [product.media, photoMedia, selectedSleeve]);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAvailable) return;

    const qty = isWholesaleView ? (product.wholesaleMinQty || 12) : 3;

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      quality: currentVariant?.quality || 'High Quality',
      sleeve: selectedSleeve,
      size: selectedSize,
      unitPrice: price,
      regularPrice: retailPrice,
      wholesalePrice: wholesalePrice,
      isWholesale: isWholesaleView,
      quantity: qty,
      image: currentPhoto,
    });
    router.push('/checkout');
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAvailable) return;

    const qty = isWholesaleView ? (product.wholesaleMinQty || 12) : 3;

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      quality: currentVariant?.quality || 'High Quality',
      sleeve: selectedSleeve,
      size: selectedSize,
      unitPrice: price,
      regularPrice: retailPrice,
      wholesalePrice: wholesalePrice,
      isWholesale: isWholesaleView,
      quantity: qty,
      image: currentPhoto,
    });
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      openDrawer();
    }, 600);
  };

  const detailUrl = isWholesaleView ? `/product/${product.slug}?wholesale=true` : `/product/${product.slug}`;

  return (
    <div className="group bg-white dark:bg-[#17191D] rounded-2xl border border-light-border dark:border-[#30343A] overflow-hidden flex flex-col justify-between shadow-sm dark:shadow-card hover:border-[#C9A96A]/60 dark:hover:border-[#3E434B] hover:shadow-md dark:hover:shadow-elevation transition-all duration-300 relative w-full h-full text-charcoal-900 dark:text-[#F1F0EC]">
      <div className="flex-1 flex flex-col">
        {/* 1. Product Image Area */}
        <div className="relative w-full h-60 sm:h-68 bg-light-elevated dark:bg-[#1D2025] p-4 flex items-center justify-center overflow-hidden border-b border-light-border dark:border-[#30343A]">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {isWholesaleView ? (
              <span className="bg-champagne-500 text-charcoal-950 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shadow-xs uppercase tracking-wider whitespace-nowrap">
                Wholesale (Min {product.wholesaleMinQty || 12} pcs)
              </span>
            ) : (
              <span className="bg-white/90 dark:bg-[#17191D]/90 backdrop-blur-xs text-[#A07D38] dark:text-[#C9A96A] border border-light-border dark:border-[#30343A] text-[10px] font-semibold px-2.5 py-0.5 rounded-md shadow-2xs uppercase tracking-wider whitespace-nowrap">
                100% Combed Cotton
              </span>
            )}
            {stock <= 10 && stock > 0 && (
              <span className="bg-[#D96B6B]/20 text-[#D96B6B] border border-[#D96B6B]/40 text-[10px] font-semibold px-2.5 py-0.5 rounded-md whitespace-nowrap">
                Only {stock} left
              </span>
            )}
          </div>

          <Link
            href={detailUrl}
            className="relative w-full h-full flex items-center justify-center cursor-pointer group"
          >
            <Image
              src={currentPhoto}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain object-center w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
              priority={false}
            />
          </Link>
        </div>

        {/* 2. Product Details Area */}
        <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[#A07D38] dark:text-[#C9A96A] block whitespace-nowrap">
              {categoryLabel}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-charcoal-900 dark:text-[#F1F0EC] mt-1 group-hover:text-[#C9A96A] transition-colors leading-snug line-clamp-2">
              <Link href={detailUrl}>{product.name}</Link>
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-[#85888E] line-clamp-2 mt-1 font-normal leading-relaxed">
              {product.subtitle}
            </p>
          </div>

          {/* Sleeve Style Selector */}
          {availableSleeves.length > 1 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-charcoal-500 dark:text-[#85888E]">Style:</span>
                <span className="text-charcoal-700 dark:text-[#B4B5BA] font-medium whitespace-nowrap">{selectedSleeve}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {availableSleeves.map((sl) => (
                  <button
                    key={sl}
                    type="button"
                    onClick={() => setSelectedSleeve(sl as SleeveType)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap ${
                      selectedSleeve === sl
                        ? 'border-[#C9A96A] bg-[#C9A96A]/15 text-[#A07D38] dark:text-[#C9A96A] shadow-xs font-bold'
                        : 'border-light-border dark:border-[#30343A] text-charcoal-600 dark:text-[#85888E] hover:border-light-border dark:hover:border-[#3E434B] bg-light-elevated dark:bg-[#1D2025]'
                    }`}
                  >
                    {sl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Pills */}
          <div className="space-y-1.5 mt-auto pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-charcoal-500 dark:text-[#B8B3A8]">Size:</span>
              <span className="text-charcoal-700 dark:text-[#B8B3A8] font-medium whitespace-nowrap">Fit {selectedSize}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {AVAILABLE_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                    selectedSize === sz
                      ? 'bg-champagne-500 text-charcoal-950 font-extrabold shadow-xs scale-105'
                      : 'bg-light-elevated dark:bg-[#22211E] text-charcoal-700 dark:text-[#B8B3A8] hover:bg-light-hover dark:hover:bg-[#2A2925] border border-light-border dark:border-[#34322D]'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Card Footer: Price & Responsive Action Buttons */}
      <div className="p-4 sm:p-5 pt-3 border-t border-light-border dark:border-[#30343A] space-y-3">
        {/* Price Row & Badges */}
        <div className="flex items-baseline justify-between gap-2 flex-wrap">
          <div className="flex items-baseline gap-1.5 whitespace-nowrap">
            <span className="text-lg sm:text-xl font-extrabold text-[#A07D38] dark:text-[#C9A96A]">
              Rs. {price}
            </span>
            <span className="text-[10px] text-charcoal-500 dark:text-gray-400">/ piece</span>
            {comparePrice && (
              <span className="text-xs text-charcoal-400 dark:text-[#85888E] line-through font-normal">
                Rs. {comparePrice}
              </span>
            )}
          </div>
          {isWholesaleView ? (
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 px-2 py-0.5 rounded-md whitespace-nowrap">
              Save Rs. {unitSavings}/pc
            </span>
          ) : (
            <span className="text-[10.5px] font-semibold text-emerald-700 dark:text-[#3FB982] bg-emerald-50 dark:bg-[#3FB982]/15 border border-emerald-200 dark:border-[#3FB982]/30 px-2 py-0.5 rounded-md whitespace-nowrap">
              Free Delivery 3+ pcs
            </span>
          )}
        </div>

        {/* Action Row */}
        <div className="w-full flex items-center gap-2">
          {/* Quick Add Button */}
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!isAvailable}
            className="w-11 h-11 flex-shrink-0 flex items-center justify-center rounded-xl bg-light-elevated dark:bg-[#1D2025] hover:bg-light-hover dark:hover:bg-[#202329] text-charcoal-900 dark:text-[#F1F0EC] border border-light-border dark:border-[#30343A] transition-colors shadow-xs active:scale-95 disabled:opacity-50"
            title={isWholesaleView ? `Add ${product.wholesaleMinQty || 12} pcs wholesale pack to Cart` : "Add 3 pcs to Cart"}
            aria-label="Add to cart"
          >
            {justAdded ? (
              <Check className="w-[18px] h-[18px] text-emerald-600 dark:text-[#3FB982] stroke-[2.5]" />
            ) : (
              <ShoppingBag className="w-[18px] h-[18px]" />
            )}
          </button>

          {/* Primary BUY NOW / ORDER WHOLESALE Button */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!isAvailable}
            className={`flex-1 min-w-0 h-11 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-[0.98] ${
              !isAvailable
                ? 'bg-light-hover dark:bg-[#1D2025] text-charcoal-400 dark:text-[#85888E] border border-light-border dark:border-[#30343A] cursor-not-allowed'
                : 'bg-champagne-500 hover:bg-champagne-400 text-[#101114]'
            }`}
          >
            <Zap className="w-4 h-4 fill-current flex-shrink-0" />
            <span className="truncate">
              {isAvailable
                ? isWholesaleView
                  ? `BUY PACK (${product.wholesaleMinQty || 12} PCS)`
                  : 'BUY NOW'
                : 'Sold Out'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
