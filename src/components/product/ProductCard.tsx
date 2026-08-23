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
}

const AVAILABLE_SIZES: ProductSize[] = ['S', 'M', 'L', 'XL', 'XXL'];

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
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

  const price = currentVariant ? currentVariant.price : 480;
  const comparePrice = currentVariant?.salePrice ? currentVariant.price + 120 : undefined;
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

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      quality: currentVariant?.quality || 'High Quality',
      sleeve: selectedSleeve,
      size: selectedSize,
      unitPrice: price,
      quantity: 3, // Minimum 3 pieces
      image: currentPhoto,
    });
    router.push('/checkout');
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAvailable) return;

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      quality: currentVariant?.quality || 'High Quality',
      sleeve: selectedSleeve,
      size: selectedSize,
      unitPrice: price,
      quantity: 3, // Minimum 3 pieces
      image: currentPhoto,
    });
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      openDrawer();
    }, 600);
  };

  return (
    <div className="group bg-dark-surface rounded-2xl border border-dark-border overflow-hidden flex flex-col justify-between shadow-card hover:border-dark-border-light hover:shadow-elevation transition-all duration-300 relative w-full h-full">
      <div>
        {/* 1. Medium, Balanced Product Image Area */}
        <div className="relative w-full h-64 sm:h-72 bg-[#1D2025] p-4 flex items-center justify-center overflow-hidden border-b border-dark-border">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            <span className="bg-[#17191D]/90 backdrop-blur-xs text-[#C9A96A] border border-dark-border text-[10px] font-semibold px-2.5 py-0.5 rounded-md shadow-2xs uppercase tracking-wider">
              100% Combed Cotton
            </span>
            {stock <= 10 && stock > 0 && (
              <span className="bg-rose-950/80 text-rose-300 border border-rose-800/60 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                Only {stock} left
              </span>
            )}
          </div>

          <Link
            href={`/product/${product.slug}`}
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

        {/* 2. Balanced Product Details Area */}
        <div className="p-4 sm:p-5 space-y-3">
          <div>
            <span className="text-[10px] font-bold text-gold-500/80 uppercase tracking-widest">
              {categoryLabel}
            </span>
            <h3 className="text-base font-bold text-gray-100 mt-1 group-hover:text-gold-400 transition-colors leading-snug line-clamp-2">
              <Link href={`/product/${product.slug}`}>{product.name}</Link>
            </h3>
            <p className="text-xs text-gray-400 line-clamp-2 mt-1 font-normal leading-relaxed">
              {product.subtitle}
            </p>
          </div>

          {/* Sleeve Style Selector (Only shown if product has more than 1 sleeve option) */}
          {availableSleeves.length > 1 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-gray-400">Style:</span>
                <span className="text-gray-300 font-medium">{selectedSleeve}</span>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {availableSleeves.map((sl) => (
                  <button
                    key={sl}
                    type="button"
                    onClick={() => setSelectedSleeve(sl as SleeveType)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all ${
                      selectedSleeve === sl
                        ? 'border-gold-500 bg-gold-500/10 text-gold-400 shadow-xs'
                        : 'border-dark-border text-gray-400 hover:border-gray-500 bg-dark-card'
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
              <span className="font-semibold text-gray-400">Size:</span>
              <span className="text-gray-300 font-medium">Fit {selectedSize}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {AVAILABLE_SIZES.map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setSelectedSize(sz)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${
                    selectedSize === sz
                      ? 'bg-gold-500 text-black font-extrabold shadow-glow-gold scale-105'
                      : 'bg-dark-card text-gray-300 hover:bg-dark-hover border border-dark-border'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Card Footer: Price & Primary BUY NOW Action */}
      <div className="p-4 sm:p-5 pt-0 mt-auto">
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-dark-border">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-gold-400">Rs. {price}</span>
              {comparePrice && (
                <span className="text-xs text-gray-500 line-through font-normal">
                  Rs. {comparePrice}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded inline-block mt-0.5">
              Free Delivery on 3+ pcs
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Secondary Add to Cart */}
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!isAvailable}
              className="p-2.5 bg-dark-card hover:bg-dark-hover text-gray-200 hover:text-white rounded-lg border border-dark-border transition-colors shadow-xs"
              title="Add to Cart"
              aria-label="Add to cart"
            >
              {justAdded ? <Check className="w-4 h-4 text-emerald-400" /> : <ShoppingBag className="w-4 h-4" />}
            </button>

            {/* Primary BUY NOW Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={!isAvailable}
              className={`py-2.5 px-3.5 sm:px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                !isAvailable
                  ? 'bg-dark-card text-gray-500 border border-dark-border cursor-not-allowed'
                  : 'bg-gold-500 hover:bg-gold-400 text-black shadow-glow-gold'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{isAvailable ? 'BUY NOW' : 'Sold Out'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
