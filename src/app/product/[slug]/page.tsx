'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductGallery } from '@/components/product/ProductGallery';
import { VariantSelector } from '@/components/product/VariantSelector';
import { QualityComparison } from '@/components/product/QualityComparison';
import { ProductReviews } from '@/components/product/ProductReviews';
import { SleeveType, ProductSize } from '@/types';
import { ChevronRight, Star, ChevronDown, ChevronUp } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { products, categories, subcategories, settings, isLoading } = useStore();

  const product = products.find((p) => p.slug === slug || p.id === slug) || products[0];

  // Variant Selections State
  const [selectedSleeve, setSelectedSleeve] = useState<SleeveType>(() => {
    return product?.variants?.[0]?.sleeve || 'Sleeveless';
  });
  const [selectedSize, setSelectedSize] = useState<ProductSize>('L');

  // Accordion Sections State
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    description: true,
    qualityComparison: false,
    care: false,
    shipping: false,
    returns: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-dark-bg">
        <div className="w-9 h-9 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center bg-dark-bg">
        <h1 className="text-2xl font-bold text-gray-100">Product Not Found</h1>
        <p className="text-xs text-gray-400 mt-2">The product you requested does not exist or has been moved.</p>
        <Link
          href="/shop"
          className="mt-6 inline-block bg-gold-500 text-black text-xs font-bold py-3 px-6 rounded-xl shadow-glow-gold"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId || c.slug === product.categoryId);
  const subcategory = subcategories.find((s) => s.id === product.subcategoryId || s.slug === product.subcategoryId);

  const reviewsCount = product.reviews?.length || 0;
  const avgRating =
    reviewsCount > 0
      ? (product.reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1)
      : null;

  return (
    <div className="min-h-screen py-10 bg-dark-bg text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-400 mb-8 flex-wrap">
          <Link href="/" className="hover:text-gold-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <Link href="/shop" className="hover:text-gold-400 transition-colors">
            Shop
          </Link>
          {category && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-600" />
              <Link href={`/category/${category.slug}`} className="hover:text-gold-400 capitalize transition-colors">
                {category.name}&apos;s Collection
              </Link>
            </>
          )}
          {subcategory && (
            <>
              <ChevronRight className="w-3 h-3 text-gray-600" />
              <Link
                href={`/category/${category?.slug || 'men'}/${subcategory.slug}`}
                className="hover:text-gold-400 capitalize transition-colors"
              >
                {subcategory.name}
              </Link>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-semibold text-gray-200 truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Dynamic Variant Media Gallery */}
          <div className="lg:col-span-6">
            <ProductGallery
              media={product.media}
              productName={product.name}
              selectedSleeve={selectedSleeve}
            />
          </div>

          {/* Right Column: Details & Variant Selection */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest block">
                {category ? category.name : 'Men'} &gt; {subcategory ? subcategory.name : 'Vests'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-100 mt-1 tracking-tight leading-tight">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-300 mt-2 font-normal leading-relaxed">
                {product.subtitle}
              </p>

              {/* Rating Summary */}
              <div className="flex items-center gap-3 mt-3.5 pt-3.5 border-t border-dark-border">
                {reviewsCount > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-gold-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= Math.round(Number(avgRating)) ? 'fill-current' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-100">{avgRating}</span>
                    <span className="text-xs text-gray-400">({reviewsCount} reviews)</span>
                  </div>
                ) : (
                  <span className="text-xs text-gold-400 font-medium">★ Authentic Combed Cotton Quality</span>
                )}
                <span className="text-gray-600">•</span>
                <span className="text-xs font-semibold text-gray-300">Made in Pakistan</span>
              </div>
            </div>

            {/* Reactive Variant Selector (Sleeve, Size, Price, Delivery Rule, Add to Cart, WhatsApp) */}
            <VariantSelector
              product={product}
              selectedSleeve={selectedSleeve}
              setSelectedSleeve={setSelectedSleeve}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
            />

            {/* Clean Accordion Sections */}
            <div className="border-t border-dark-border divide-y divide-dark-border pt-2 text-xs">
              {/* 1. Description & Key Features */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleSection('description')}
                  className="w-full flex items-center justify-between font-bold text-gray-200 text-left py-1 hover:text-gold-400 transition-colors"
                >
                  <span>Product Description &amp; Features</span>
                  {openSections.description ? <ChevronUp className="w-4 h-4 text-gold-400" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.description && (
                  <div className="pt-2 text-gray-300 space-y-2.5 font-normal leading-relaxed">
                    <p>{product.description}</p>
                    {product.features && product.features.length > 0 && (
                      <ul className="space-y-1.5 pl-4 list-disc text-gray-300">
                        {product.features.map((feat, idx) => (
                          <li key={idx}>{feat}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Quality Comparison Breakdown */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleSection('qualityComparison')}
                  className="w-full flex items-center justify-between font-bold text-gray-200 text-left py-1 hover:text-gold-400 transition-colors"
                >
                  <span>Quality &amp; Construction Guide (High vs Standard)</span>
                  {openSections.qualityComparison ? <ChevronUp className="w-4 h-4 text-gold-400" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.qualityComparison && (
                  <div className="pt-3">
                    <QualityComparison />
                  </div>
                )}
              </div>

              {/* 3. Care Instructions */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleSection('care')}
                  className="w-full flex items-center justify-between font-bold text-gray-200 text-left py-1 hover:text-gold-400 transition-colors"
                >
                  <span>Fabric Care Instructions</span>
                  {openSections.care ? <ChevronUp className="w-4 h-4 text-gold-400" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.care && (
                  <div className="pt-2 text-gray-300 font-normal">
                    <ul className="space-y-1.5 pl-4 list-disc">
                      {product.careInstructions.map((care, idx) => (
                        <li key={idx}>{care}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 4. Shipping & Delivery Terms */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleSection('shipping')}
                  className="w-full flex items-center justify-between font-bold text-gray-200 text-left py-1 hover:text-gold-400 transition-colors"
                >
                  <span>Nationwide Pakistan Shipping</span>
                  {openSections.shipping ? <ChevronUp className="w-4 h-4 text-gold-400" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.shipping && (
                  <div className="pt-2 text-gray-300 space-y-1.5 font-normal leading-relaxed">
                    <p>{product.shippingInfo}</p>
                    <p className="font-semibold text-gray-200">
                      • Minimum order: {settings.shipping.minOrderQty} pieces
                    </p>
                    <p className="font-semibold text-emerald-400">
                      • 3 or more pieces: 100% FREE DELIVERY across all Pakistan cities
                    </p>
                    <p>• Cash on Delivery (COD) and Direct Bank Transfer available.</p>
                  </div>
                )}
              </div>

              {/* 5. Exchange & Return Policy */}
              <div className="py-3.5">
                <button
                  onClick={() => toggleSection('returns')}
                  className="w-full flex items-center justify-between font-bold text-gray-200 text-left py-1 hover:text-gold-400 transition-colors"
                >
                  <span>Exchange &amp; Return Policy (7 Days)</span>
                  {openSections.returns ? <ChevronUp className="w-4 h-4 text-gold-400" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.returns && (
                  <div className="pt-2 text-gray-300 font-normal leading-relaxed">
                    <p>
                      {product.returnPolicy ||
                        'We offer a 7-day hassle-free exchange policy for any manufacturing defect or sizing mismatch. Product must remain unwashed and unworn.'}
                    </p>
                    <p className="mt-1 font-semibold text-gold-400">
                      To initiate an exchange, message us directly on WhatsApp ({settings.whatsapp}).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Reviews Section */}
        <ProductReviews
          productId={product.id}
          productName={product.name}
          reviews={product.reviews}
        />
      </div>
    </div>
  );
}
