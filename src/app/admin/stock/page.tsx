'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { Product, ProductVariant } from '@/types';
import {
  Boxes,
  Save,
  AlertTriangle,
  Check,
  Search,
  Package,
  Filter,
  ArrowRight,
  Plus,
  X,
  Edit2,
  ChevronRight,
  XCircle,
  Eye,
  SlidersHorizontal,
  ExternalLink,
} from 'lucide-react';

export default function AdminStockPage() {
  const { products, categories, subcategories, updateProductVariants } = useStore();

  // Working state for all products: { [productId]: ProductVariant[] }
  const [stockMap, setStockMap] = useState<{ [productId: string]: ProductVariant[] }>({});

  // Active product for the "Full Variant Details" modal/drawer
  const [activeDetailProductId, setActiveDetailProductId] = useState<string | null>(null);

  // Filters
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedSubcatId, setSelectedSubcatId] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Save state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Initialize stockMap when products load
  useEffect(() => {
    const map: { [productId: string]: ProductVariant[] } = {};
    for (const p of products) {
      map[p.id] = (p.variants || []).map((v) => ({ ...v }));
    }
    setStockMap(map);
  }, [products]);

  // Subcategories for selected category filter
  const availableSubcategories = useMemo(() => {
    if (selectedCategoryId === 'all') return subcategories;
    return subcategories.filter((s) => s.categoryId === selectedCategoryId);
  }, [selectedCategoryId, subcategories]);

  // Handle direct stock input change
  const handleStockChange = (productId: string, variantId: string, newStock: number) => {
    setStockMap((prev) => {
      const currentVariants = prev[productId] || [];
      const updated = currentVariants.map((v) =>
        v.id === variantId ? { ...v, stock: Math.max(0, newStock) } : v
      );
      return { ...prev, [productId]: updated };
    });
  };

  // Handle quick adjustment (+10, -5, +50)
  const handleQuickAdjust = (productId: string, variantId: string, amount: number) => {
    setStockMap((prev) => {
      const currentVariants = prev[productId] || [];
      const updated = currentVariants.map((v) =>
        v.id === variantId ? { ...v, stock: Math.max(0, v.stock + amount) } : v
      );
      return { ...prev, [productId]: updated };
    });
  };

  // Save single product stock (from within detail modal)
  const handleSaveProductStock = async (productId: string) => {
    const variants = stockMap[productId];
    if (!variants) return;
    setIsSaving(true);
    try {
      await updateProductVariants(productId, variants);
      const prodName = products.find((p) => p.id === productId)?.name || 'Product';
      setSaveSuccessMsg(`Stock numbers for "${prodName}" updated live!`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      alert('Failed to save stock numbers.');
    } finally {
      setIsSaving(false);
    }
  };

  // Live Catalog Global Summary
  const catalogSummary = useMemo(() => {
    let totalProductsCount = products.length;
    let totalVariantsCount = 0;
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    for (const p of products) {
      const vars = stockMap[p.id] || p.variants || [];
      totalVariantsCount += vars.length;
      for (const v of vars) {
        totalStockUnits += v.stock || 0;
        if (v.stock <= 0) {
          outOfStockCount++;
        } else if (v.stock <= 10) {
          lowStockCount++;
        }
      }
    }

    return {
      totalProductsCount,
      totalVariantsCount,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
    };
  }, [products, stockMap]);

  // Filter products for compact main list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategoryId !== 'all' && p.categoryId !== selectedCategoryId) return false;
      if (selectedSubcatId !== 'all' && p.subcategoryId !== selectedSubcatId) return false;

      const q = searchQuery.toLowerCase().trim();
      const vars = stockMap[p.id] || p.variants || [];
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.subtitle && p.subtitle.toLowerCase().includes(q)) ||
        vars.some(
          (v) =>
            v.quality.toLowerCase().includes(q) ||
            v.sleeve.toLowerCase().includes(q) ||
            v.size.toLowerCase().includes(q) ||
            (v.sku && v.sku.toLowerCase().includes(q))
        );

      if (!matchesSearch) return false;

      if (stockFilter === 'low-stock') {
        return vars.some((v) => v.stock > 0 && v.stock <= 10);
      }
      if (stockFilter === 'out-of-stock') {
        return vars.some((v) => v.stock <= 0);
      }
      if (stockFilter === 'in-stock') {
        return vars.some((v) => v.stock > 10);
      }

      return true;
    });
  }, [products, selectedCategoryId, selectedSubcatId, searchQuery, stockFilter, stockMap]);

  // Currently selected product for detail modal
  const activeDetailProduct = useMemo(() => {
    if (!activeDetailProductId) return null;
    return products.find((p) => p.id === activeDetailProductId) || null;
  }, [activeDetailProductId, products]);

  const activeProductVariants = useMemo(() => {
    if (!activeDetailProduct) return [];
    return stockMap[activeDetailProduct.id] || activeDetailProduct.variants || [];
  }, [activeDetailProduct, stockMap]);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-950">
            Inventory &amp; Stock Manager
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Compact catalog inventory overview. Select any garment to inspect and adjust individual size/variant stock.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 bg-gray-950 hover:bg-black text-white text-xs font-semibold h-10 px-4 rounded-lg shadow-xs transition-all active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-gray-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* 1. Compact Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Total Products
          </span>
          <div className="text-lg sm:text-xl font-bold text-gray-950 mt-0.5">
            {catalogSummary.totalProductsCount}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Catalog Garments</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Total Variants
          </span>
          <div className="text-lg sm:text-xl font-bold text-gray-950 mt-0.5">
            {catalogSummary.totalVariantsCount}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Size &amp; Quality Tiers</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Units In Stock
          </span>
          <div className="text-lg sm:text-xl font-bold text-gray-950 mt-0.5">
            {catalogSummary.totalStockUnits.toLocaleString()}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Available Pieces</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Low Stock (&le; 10)
          </span>
          <div className={`text-lg sm:text-xl font-bold mt-0.5 ${catalogSummary.lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {catalogSummary.lowStockCount}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Need Replenishment</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
            Out of Stock
          </span>
          <div className={`text-lg sm:text-xl font-bold mt-0.5 ${catalogSummary.outOfStockCount > 0 ? 'text-rose-600' : 'text-gray-950'}`}>
            {catalogSummary.outOfStockCount}
          </div>
          <span className="text-[10px] text-gray-400 mt-0.5 block">0 Units Left</span>
        </div>
      </div>

      {/* 2. Compact Filters Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-gray-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Category */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
              Category
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setSelectedSubcatId('all');
              }}
              className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:outline-none"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
              Subcategory
            </label>
            <select
              value={selectedSubcatId}
              onChange={(e) => setSelectedSubcatId(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:outline-none"
            >
              <option value="all">All Subcategories</option>
              {availableSubcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Level */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
              Stock Status
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="in-stock">Ready / In Stock (&gt; 10)</option>
              <option value="low-stock">Low Stock (&le; 10)</option>
              <option value="out-of-stock">Out of Stock (0)</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
              Search Garment
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Product name, SKU, quality..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:ring-1 focus:ring-black focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Compact Main Inventory Overview List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 space-y-3">
          <Package className="w-10 h-10 text-gray-400 mx-auto" />
          <h3 className="font-bold text-base text-gray-950">No products match your filter</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Try adjusting your search criteria or add new garments from the Product Manager.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCategoryId('all');
                setSelectedSubcatId('all');
                setStockFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-gray-950 hover:bg-black text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-900 uppercase font-bold text-[11px] border-b border-gray-200">
                <tr>
                  <th className="p-3.5">Product &amp; Category</th>
                  <th className="p-3.5 text-center">Total In Stock</th>
                  <th className="p-3.5 text-center">Variants Count</th>
                  <th className="p-3.5">Price Range</th>
                  <th className="p-3.5">Stock Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredProducts.map((product) => {
                  const category = categories.find((c) => c.id === product.categoryId);
                  const subcategory = subcategories.find((s) => s.id === product.subcategoryId);
                  const primaryImage =
                    product.media?.[0]?.url || '/images/products/sleevless high.jpeg';

                  const variants = stockMap[product.id] || product.variants || [];
                  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);
                  const prices = variants.map((v) => v.price).filter((pr) => !isNaN(pr));
                  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
                  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

                  const lowStockVarsCount = variants.filter((v) => v.stock > 0 && v.stock <= 10).length;
                  const outOfStockVarsCount = variants.filter((v) => v.stock <= 0).length;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Product & Category */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 p-0.5">
                            <Image
                              src={primaryImage}
                              alt={product.name}
                              fill
                              sizes="56px"
                              className="object-contain object-center"
                            />
                          </div>

                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                              {category?.name || 'Category'} {subcategory ? `• ${subcategory.name}` : ''}
                            </span>
                            <h3 className="font-bold text-sm text-gray-950 leading-snug">
                              {product.name}
                            </h3>
                            <p className="text-[11px] text-gray-500 line-clamp-1">{product.subtitle}</p>
                          </div>
                        </div>
                      </td>

                      {/* Total In Stock */}
                      <td className="p-3.5 text-center">
                        <span className="font-bold text-sm text-gray-950">
                          {totalStock.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-gray-400 block">Pieces Available</span>
                      </td>

                      {/* Variants Count */}
                      <td className="p-3.5 text-center">
                        <span className="font-bold text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded">
                          {variants.length} Variants
                        </span>
                      </td>

                      {/* Price Range */}
                      <td className="p-3.5">
                        <span className="font-bold text-xs text-gray-950">
                          {minPrice === maxPrice ? `Rs. ${minPrice}` : `Rs. ${minPrice} – Rs. ${maxPrice}`}
                        </span>
                      </td>

                      {/* Stock Status */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          {totalStock <= 0 ? (
                            <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[10px] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                              <XCircle className="w-3 h-3" /> Out of Stock
                            </span>
                          ) : lowStockVarsCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-amber-800 font-bold text-[10px] bg-amber-50 border border-amber-300 px-2 py-0.5 rounded">
                              <AlertTriangle className="w-3 h-3" /> {lowStockVarsCount} Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold text-[10px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              <Check className="w-3 h-3" /> In Stock
                            </span>
                          )}

                          {outOfStockVarsCount > 0 && totalStock > 0 && (
                            <span className="text-[10px] text-rose-600 font-medium block">
                              ({outOfStockVarsCount} sizes out of stock)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveDetailProductId(product.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-950 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-2xs transition-all active:scale-[0.99]"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FULL PRODUCT VARIANT DETAILS MODAL / DRAWER */}
      {/* ========================================================================= */}
      {activeDetailProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 bg-gray-50 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-16 sm:w-16 sm:h-20 bg-white rounded-xl overflow-hidden border border-gray-200 flex-shrink-0 p-1">
                  <Image
                    src={
                      activeDetailProduct.media?.[0]?.url ||
                      '/images/products/sleevless high.jpeg'
                    }
                    alt={activeDetailProduct.name}
                    fill
                    sizes="80px"
                    className="object-contain object-center"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-200 text-gray-800">
                      {categories.find((c) => c.id === activeDetailProduct.categoryId)?.name || 'Category'}
                      {activeDetailProduct.subcategoryId
                        ? ` • ${subcategories.find((s) => s.id === activeDetailProduct.subcategoryId)?.name || ''}`
                        : ''}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      Live Catalog Item
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-gray-950 mt-1">
                    {activeDetailProduct.name}
                  </h2>

                  <div className="flex items-center gap-3 text-xs text-gray-600 font-medium mt-1 flex-wrap">
                    <span>
                      <strong>Total Stock:</strong>{' '}
                      {activeProductVariants
                        .reduce((sum, v) => sum + (v.stock || 0), 0)
                        .toLocaleString()}{' '}
                      pcs
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Total Variants:</strong> {activeProductVariants.length}
                    </span>
                    <span>•</span>
                    <span>
                      <strong>Price Range:</strong>{' '}
                      {(() => {
                        const prs = activeProductVariants.map((v) => v.price).filter((p) => !isNaN(p));
                        const min = prs.length ? Math.min(...prs) : 0;
                        const max = prs.length ? Math.max(...prs) : 0;
                        return min === max ? `Rs. ${min}` : `Rs. ${min} – Rs. ${max}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveDetailProductId(null)}
                className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-200 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Complete Variant Stock Matrix */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-gray-950">
                    Complete Variant Inventory Table
                  </h3>
                  <p className="text-xs text-gray-500">
                    Directly modify stock units or use quick adjust buttons. Click &quot;Save Stock Changes&quot; to commit to Supabase.
                  </p>
                </div>

                <Link
                  href="/admin/products"
                  className="text-xs text-gray-600 hover:text-black font-semibold inline-flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit Product Settings</span>
                </Link>
              </div>

              <div className="border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-100 text-gray-900 uppercase font-bold text-[11px] border-b border-gray-200">
                      <tr>
                        <th className="p-3">Quality Tier</th>
                        <th className="p-3">Sleeve Style</th>
                        <th className="p-3 text-center">Size</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Available Stock</th>
                        <th className="p-3">Quick Adjust</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium">
                      {activeProductVariants.map((variant) => {
                        const isLow = variant.stock > 0 && variant.stock <= 10;
                        const isOut = variant.stock <= 0;

                        return (
                          <tr
                            key={variant.id}
                            className={`hover:bg-gray-50/70 transition-colors ${
                              isOut ? 'bg-rose-50/30' : isLow ? 'bg-amber-50/20' : ''
                            }`}
                          >
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                                  variant.quality.toLowerCase().includes('high')
                                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {variant.quality}
                              </span>
                            </td>
                            <td className="p-3 text-gray-900 font-semibold">{variant.sleeve}</td>
                            <td className="p-3 text-center">
                              <span className="font-bold bg-gray-950 text-white px-2 py-0.5 rounded text-xs">
                                {variant.size}
                              </span>
                            </td>
                            <td className="p-3 text-gray-500 font-mono text-[11px]">
                              {variant.sku || '—'}
                            </td>
                            <td className="p-3 font-bold text-gray-950">Rs. {variant.price}</td>
                            <td className="p-3">
                              <input
                                type="number"
                                min={0}
                                value={variant.stock}
                                onChange={(e) =>
                                  handleStockChange(
                                    activeDetailProduct.id,
                                    variant.id,
                                    Number(e.target.value)
                                  )
                                }
                                className={`w-20 sm:w-24 px-2.5 py-1.5 text-xs font-bold rounded-lg border focus:ring-1 focus:ring-black focus:outline-none ${
                                  isOut
                                    ? 'border-rose-400 text-rose-900 bg-rose-50'
                                    : isLow
                                    ? 'border-amber-400 text-amber-900 bg-amber-50'
                                    : 'border-gray-300 bg-white text-gray-950'
                                }`}
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickAdjust(activeDetailProduct.id, variant.id, -5)
                                  }
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded text-[11px] transition-colors"
                                  title="Reduce by 5"
                                >
                                  -5
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickAdjust(activeDetailProduct.id, variant.id, 10)
                                  }
                                  className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded text-[11px] transition-colors"
                                  title="Add 10 pieces"
                                >
                                  +10
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickAdjust(activeDetailProduct.id, variant.id, 50)
                                  }
                                  className="px-2 py-1 bg-gray-900 hover:bg-black text-white font-semibold rounded text-[11px] transition-colors"
                                  title="Add 50 pieces"
                                >
                                  +50
                                </button>
                              </div>
                            </td>
                            <td className="p-3">
                              {isOut ? (
                                <span className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                                  <XCircle className="w-3 h-3" /> Out of Stock
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1 text-amber-800 font-bold text-[11px] bg-amber-50 border border-amber-300 px-2 py-0.5 rounded">
                                  <AlertTriangle className="w-3 h-3" /> Low ({variant.stock})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-emerald-800 font-semibold text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                  <Check className="w-3 h-3" /> Ready ({variant.stock})
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveDetailProductId(null)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-black rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleSaveProductStock(activeDetailProduct.id)}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-950 hover:bg-black text-white text-xs font-semibold rounded-lg shadow-xs transition-all active:scale-[0.99] disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-emerald-400" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Stock Changes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
