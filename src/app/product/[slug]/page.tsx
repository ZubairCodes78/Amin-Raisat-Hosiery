'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { ProductGallery } from '@/components/product/ProductGallery';
import { VariantSelector } from '@/components/product/VariantSelector';
import { QualityComparison } from '@/components/product/QualityComparison';
import { ProductReviews } from '@/components/product/ProductReviews';
import { QualityType, SleeveType, ProductSize, Product } from '@/types';
import { ChevronRight, ShieldCheck, Truck, RefreshCw, Star, Info, ChevronDown, ChevronUp } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { products, categories, subcategories, settings, isLoading } = useStore();

  const product = products.find((p) => p.slug === slug || p.id === slug) || products[0];

  // Variant Selections State
  const [selectedQuality, setSelectedQuality] = useState<QualityType>('High Quality');
  const [selectedSleeve, setSelectedSleeve] = useState<SleeveType>('Sleeveless');
  const [selectedSize, setSelectedSize] = useState<ProductSize>('L');

  // Accordion Sections State
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    description: true,
    qualityComparison: true,
    care: false,
    shipping: false,
    returns: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-950">Product Not Found</h1>
        <p className="text-xs text-gray-500 mt-2">The product you requested does not exist.</p>
        <Link
          href="/"
          className="mt-6 inline-block bg-gray-950 text-white text-xs font-semibold py-2.5 px-5 rounded-lg"
        >
          Return to Store
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const subcategory = subcategories.find((s) => s.id === product.subcategoryId);

  const reviewsCount = product.reviews?.length || 0;
  const avgRating =
    reviewsCount > 0
      ? (product.reviews!.reduce((sum, r) => sum + r.rating, 0) / reviewsCount).toFixed(1)
      : null;

  return (
    <div className="min-h-screen py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-6 flex-wrap">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400" />
          {category && (
            <>
              <Link href={`/category/${category.slug}`} className="hover:text-gray-900 capitalize">
                {category.name}&apos;s Collection
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </>
          )}
          {subcategory && (
            <>
              <Link
                href={`/category/${category?.slug || 'men'}/${subcategory.slug}`}
                className="hover:text-gray-900 capitalize"
              >
                {subcategory.name}
              </Link>
              <ChevronRight className="w-3 h-3 text-gray-400" />
            </>
          )}
          <span className="font-semibold text-gray-950">{product.name}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Dynamic Variant Media Gallery */}
          <div className="lg:col-span-6">
            <ProductGallery
              media={product.media}
              productName={product.name}
              selectedQuality={selectedQuality}
              selectedSleeve={selectedSleeve}
            />
          </div>

          {/* Right Column: Details & Variant Selection */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block">
                {category ? category.name : 'Men'} &gt; {subcategory ? subcategory.name : 'Vests'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-950 mt-1">
                {product.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1.5 font-normal leading-relaxed">
                {product.subtitle}
              </p>

              {/* Rating Summary */}
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                {reviewsCount > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= Math.round(Number(avgRating)) ? 'fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-900">{avgRating}</span>
                    <span className="text-xs text-gray-500">({reviewsCount} reviews)</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">★ Authentic Combed Cotton Quality</span>
                )}
                <span className="text-gray-300">•</span>
                <span className="text-xs font-semibold text-gray-700">Made in Pakistan</span>
              </div>
            </div>

            {/* Reactive Variant Selector (Quality, Sleeve, Size, Price, Delivery Rule, Add to Cart, WhatsApp) */}
            <VariantSelector
              product={product}
              selectedQuality={selectedQuality}
              setSelectedQuality={setSelectedQuality}
              selectedSleeve={selectedSleeve}
              setSelectedSleeve={setSelectedSleeve}
              selectedSize={selectedSize}
              setSelectedSize={setSelectedSize}
            />

            {/* Clean Accordion Sections */}
            <div className="border-t border-gray-200 divide-y divide-gray-200 pt-2 text-xs">
              {/* 1. Description & Key Features */}
              <div className="py-3">
                <button
                  onClick={() => toggleSection('description')}
                  className="w-full flex items-center justify-between font-bold text-gray-950 text-left py-1"
                >
                  <span>Product Description &amp; Features</span>
                  {openSections.description ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.description && (
                  <div className="pt-2 text-gray-600 space-y-2.5 font-normal leading-relaxed">
                    <p>{product.description}</p>
                    {product.features && (
                      <ul className="space-y-1.5 pl-4 list-disc text-gray-700">
                        {product.features.map((feat, idx) => (
                          <li key={idx}>{feat}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* 2. Quality Comparison Breakdown */}
              <div className="py-3">
                <button
                  onClick={() => toggleSection('qualityComparison')}
                  className="w-full flex items-center justify-between font-bold text-gray-950 text-left py-1"
                >
                  <span>Quality Comparison (High vs Standard)</span>
                  {openSections.qualityComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.qualityComparison && (
                  <div className="pt-3">
                    <QualityComparison
                      selectedQuality={selectedQuality}
                      onSelectQuality={setSelectedQuality}
                    />
                  </div>
                )}
              </div>

              {/* 3. Care Instructions */}
              <div className="py-3">
                <button
                  onClick={() => toggleSection('care')}
                  className="w-full flex items-center justify-between font-bold text-gray-950 text-left py-1"
                >
                  <span>Fabric Care Instructions</span>
                  {openSections.care ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.care && (
                  <div className="pt-2 text-gray-600 font-normal">
                    <ul className="space-y-1.5 pl-4 list-disc">
                      {product.careInstructions.map((care, idx) => (
                        <li key={idx}>{care}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* 4. Shipping & Delivery Terms */}
              <div className="py-3">
                <button
                  onClick={() => toggleSection('shipping')}
                  className="w-full flex items-center justify-between font-bold text-gray-950 text-left py-1"
                >
                  <span>Nationwide Pakistan Shipping</span>
                  {openSections.shipping ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.shipping && (
                  <div className="pt-2 text-gray-600 space-y-1.5 font-normal leading-relaxed">
                    <p>{product.shippingInfo}</p>
                    <p className="font-semibold text-gray-900">
                      • 2 pieces: Rs. {settings.shipping.baseDeliveryCharge} delivery fee
                    </p>
                    <p className="font-semibold text-emerald-800">
                      • 3 or more pieces: 100% FREE DELIVERY nationwide
                    </p>
                    <p>• Cash on Delivery (COD) and Direct Bank Transfer available.</p>
                  </div>
                )}
              </div>

              {/* 5. Exchange & Return Policy */}
              <div className="py-3">
                <button
                  onClick={() => toggleSection('returns')}
                  className="w-full flex items-center justify-between font-bold text-gray-950 text-left py-1"
                >
                  <span>Exchange &amp; Return Policy</span>
                  {openSections.returns ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {openSections.returns && (
                  <div className="pt-2 text-gray-600 font-normal leading-relaxed">
                    <p>
                      {product.returnPolicy ||
                        'We offer a 7-day hassle-free exchange policy for any manufacturing defect or sizing mismatch. Product must remain unwashed and unworn.'}
                    </p>
                    <p className="mt-1 font-semibold text-gray-900">
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
