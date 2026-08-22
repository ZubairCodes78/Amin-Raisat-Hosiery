'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product, ProductSize, QualityType, SleeveType } from '@/types';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { ShoppingBag, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

const AVAILABLE_SIZES: ProductSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { categories } = useStore();
  const [selectedQuality, setSelectedQuality] = useState<QualityType>('High Quality');
  const [selectedSleeve, setSelectedSleeve] = useState<SleeveType>('Sleeveless');
  const [selectedSize, setSelectedSize] = useState<ProductSize>('L');
  const [justAdded, setJustAdded] = useState(false);

  // Dynamic category name
  const productCategory = useMemo(() => {
    return categories.find(
      (c) =>
        c.id === product.categoryId ||
        c.slug === product.categoryId ||
        (c.slug === 'men' && (!product.categoryId || product.categoryId === 'cat-men')) ||
        (c.slug === 'women' && product.categoryId === 'cat-women') ||
        (c.slug === 'kids' && product.categoryId === 'cat-kids')
    );
  }, [categories, product.categoryId]);

  const categoryLabel = productCategory?.name
    ? `${productCategory.name}'s Collection`
    : 'Cotton Essentials';

  // Compute available qualities & sleeves for this product
  const availableQualities = useMemo(() => {
    return Array.from(new Set(product.variants.map((v) => v.quality).filter(Boolean)));
  }, [product.variants]);

  const availableSleeves = useMemo(() => {
    const matching = product.variants.filter((v) => v.quality === selectedQuality);
    const sleeves = Array.from(new Set(matching.map((v) => v.sleeve).filter(Boolean)));
    return sleeves.length > 0 ? sleeves : ['Sleeveless'];
  }, [product.variants, selectedQuality]);

  // Compute matched variant
  const currentVariant =
    product.variants.find(
      (v) =>
        v.quality === selectedQuality &&
        v.sleeve === selectedSleeve &&
        v.size === selectedSize
    ) ||
    product.variants.find((v) => v.quality === selectedQuality) ||
    product.variants[0];

  const price = currentVariant ? currentVariant.price : 480;
  const comparePrice = currentVariant?.salePrice ? currentVariant.price + 120 : undefined;
  const stock = currentVariant ? currentVariant.stock : 50;
  const isAvailable = currentVariant ? currentVariant.isAvailable && stock > 0 : true;

  // Media photos list
  const photoMedia = product.media.filter((m) => m.type === 'photo');

  // Dynamically resolve exact matching photo for chosen Quality + Sleeve
  const currentPhoto = useMemo(() => {
    const match = product.media.find(
      (m) =>
        (!m.variantQuality || m.variantQuality === 'All' || m.variantQuality === selectedQuality) &&
        (!m.variantSleeve || m.variantSleeve === 'All' || m.variantSleeve === selectedSleeve)
    );
    return match?.url || photoMedia[0]?.url || '/images/products/sleevless high.jpeg';
  }, [product.media, photoMedia, selectedQuality, selectedSleeve]);

  const handleQualityChange = (q: QualityType) => {
    setSelectedQuality(q);
    if (q === 'Low Quality' && selectedSleeve !== 'Sleeveless') {
      setSelectedSleeve('Sleeveless');
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      quality: selectedQuality,
      sleeve: selectedSleeve,
      size: selectedSize,
      unitPrice: price,
      quantity: 2, // minimum order pieces default
      image: currentPhoto,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200 relative w-full h-full">
      <div>
        {/* 1. Medium, Balanced Product Image Area */}
        <div className="relative w-full h-60 sm:h-64 bg-gray-50/80 p-4 flex items-center justify-center overflow-hidden border-b border-gray-100">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
            <span className="bg-gray-950/85 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-0.5 rounded shadow-xs">
              100% Combed Cotton
            </span>
            {stock <= 10 && stock > 0 && (
              <span className="bg-amber-100 text-amber-900 text-[11px] font-medium px-2.5 py-0.5 rounded border border-amber-300">
                Only {stock} left
              </span>
            )}
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="relative w-full h-full flex items-center justify-center cursor-pointer"
          >
            <Image
              src={currentPhoto}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain object-center w-full h-full transition-opacity duration-200"
              priority={false}
            />
          </Link>
        </div>

        {/* 2. Balanced Product Details Area */}
        <div className="p-4 sm:p-5 space-y-3.5">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              {categoryLabel}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-gray-950 mt-0.5 group-hover:text-black transition-colors leading-snug">
              <Link href={`/product/${product.slug}`}>{product.name}</Link>
            </h3>
            <p className="text-xs text-gray-600 line-clamp-2 mt-1 font-normal leading-relaxed">
              {product.subtitle}
            </p>
          </div>

          {/* Quality Selector */}
          {availableQualities.length > 1 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-gray-700">Quality:</span>
                <span className="text-gray-500">{selectedQuality}</span>
              </div>
              <div className="flex gap-1.5 p-1 bg-gray-100 rounded-lg">
                {availableQualities.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleQualityChange(q as QualityType)}
                    className={`flex-1 py-1.5 px-2 rounded-md text-xs font-semibold transition-all text-center ${
                      selectedQuality === q
                        ? 'bg-gray-950 text-white shadow-xs'
                        : 'text-gray-700 hover:text-black hover:bg-gray-200/60'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sleeve Style Selector */}
          {availableSleeves.length > 1 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-gray-700">Sleeve:</span>
                <span className="text-gray-500">{selectedSleeve}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {availableSleeves.map((sl) => (
                  <button
                    key={sl}
                    type="button"
                    onClick={() => setSelectedSleeve(sl as SleeveType)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold border transition-all ${
                      selectedSleeve === sl
                        ? 'border-gray-950 bg-gray-950 text-white shadow-xs'
                        : 'border-gray-200 text-gray-700 hover:border-gray-400 bg-white'
                    }`}
                  >
                    {sl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Pills */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-gray-700">Size:</span>
              <span className="text-gray-500">Size {selectedSize}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {AVAILABLE_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`w-8 h-8 rounded-md text-xs font-bold flex items-center justify-center transition-all ${
                    selectedSize === sz
                      ? 'bg-gray-950 text-white shadow-xs scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Card Footer: Price & Add to Cart Action */}
      <div className="p-4 sm:p-5 pt-0 mt-auto">
        <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-gray-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold text-gray-950">Rs. {price}</span>
              {comparePrice && (
                <span className="text-xs text-gray-400 line-through font-normal">
                  Rs. {comparePrice}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
              Min 2 pcs
            </span>
          </div>

          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!isAvailable}
            className={`py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : !isAvailable
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-950 hover:bg-black text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : !isAvailable ? (
              'Sold Out'
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
