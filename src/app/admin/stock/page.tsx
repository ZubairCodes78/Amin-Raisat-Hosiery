'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ProductVariant } from '@/types';
import {
  Save,
  AlertTriangle,
  Check,
  Search,
  Package,
  Plus,
  X,
  Edit2,
  XCircle,
  Eye,
  Boxes,
  CheckCircle,
} from 'lucide-react';

export default function AdminStockPage() {
  const { products, categories, subcategories, updateProductVariants, isLoading } = useStore();

  // Working state for all products: { [productId]: ProductVariant[] }
  const [stockMap, setStockMap] = useState<{ [productId: string]: ProductVariant[] }>({});
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

  // Save single product stock
  const handleSaveProductStock = async (productId: string) => {
    const variants = stockMap[productId];
    if (!variants) return;
    setIsSaving(true);
    try {
      await updateProductVariants(productId, variants);
      const prodName = products.find((p) => p.id === productId)?.name || 'Product';
      setSaveSuccessMsg(`Stock levels for "${prodName}" updated live!`);
      setTimeout(() => setSaveSuccessMsg(''), 3000);
    } catch (err) {
      setSaveSuccessMsg('Unable to save stock numbers. Please try again.');
      setTimeout(() => setSaveSuccessMsg(''), 3000);
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

  // Filter products
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

  const activeDetailProduct = useMemo(() => {
    if (!activeDetailProductId) return null;
    return products.find((p) => p.id === activeDetailProductId) || null;
  }, [activeDetailProductId, products]);

  const activeProductVariants = useMemo(() => {
    if (!activeDetailProduct) return [];
    return stockMap[activeDetailProduct.id] || activeDetailProduct.variants || [];
  }, [activeDetailProduct, stockMap]);

  return (
    <div className="space-y-6 max-w-7xl text-[#F1F0EC]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#17191D] p-6 rounded-2xl border border-[#30343A] shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#F1F0EC]">
              Inventory &amp; Stock Matrix
            </h1>
            <span className="text-xs font-bold bg-[#1D2025] text-[#C9A96A] border border-[#30343A] px-2.5 py-0.5 rounded-lg">
              {catalogSummary.totalStockUnits.toLocaleString()} Pcs Total
            </span>
          </div>
          <p className="text-xs text-[#85888E] mt-1">
            Real-time catalog inventory telemetry. Select any garment listing to inspect and adjust individual variant stock.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] text-xs font-bold h-10 px-4 rounded-xl shadow-xs transition-all active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Garment</span>
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-[#17191D] text-[#F1F0EC] border border-[#3FB982]/40 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <Check className="w-4 h-4 text-[#3FB982]" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#17191D] p-4 rounded-2xl border border-[#30343A] shadow-card">
          <span className="text-[10px] font-bold text-[#85888E] uppercase tracking-wider block">
            Total Garments
          </span>
          <div className="text-lg sm:text-xl font-bold text-[#C9A96A] mt-1">
            {catalogSummary.totalProductsCount}
          </div>
          <span className="text-[10px] text-[#85888E] mt-0.5 block">Live Listings</span>
        </div>

        <div className="bg-[#17191D] p-4 rounded-2xl border border-[#30343A] shadow-card">
          <span className="text-[10px] font-bold text-[#85888E] uppercase tracking-wider block">
            Total Variants
          </span>
          <div className="text-lg sm:text-xl font-bold text-[#F1F0EC] mt-1">
            {catalogSummary.totalVariantsCount}
          </div>
          <span className="text-[10px] text-[#85888E] mt-0.5 block">Size &amp; Sleeve Tiers</span>
        </div>

        <div className="bg-[#17191D] p-4 rounded-2xl border border-[#30343A] shadow-card">
          <span className="text-[10px] font-bold text-[#85888E] uppercase tracking-wider block">
            Units In Stock
          </span>
          <div className="text-lg sm:text-xl font-bold text-[#3FB982] mt-1">
            {catalogSummary.totalStockUnits.toLocaleString()}
          </div>
          <span className="text-[10px] text-[#85888E] mt-0.5 block">Available Pieces</span>
        </div>

        <div className="bg-[#17191D] p-4 rounded-2xl border border-[#30343A] shadow-card">
          <span className="text-[10px] font-bold text-[#85888E] uppercase tracking-wider block">
            Low Stock (&le; 10)
          </span>
          <div className={`text-lg sm:text-xl font-bold mt-1 ${catalogSummary.lowStockCount > 0 ? 'text-[#D6A84F]' : 'text-[#3FB982]'}`}>
            {catalogSummary.lowStockCount}
          </div>
          <span className="text-[10px] text-[#85888E] mt-0.5 block">Need Replenishment</span>
        </div>

        <div className="bg-[#17191D] p-4 rounded-2xl border border-[#30343A] shadow-card col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-[#85888E] uppercase tracking-wider block">
            Out of Stock
          </span>
          <div className={`text-lg sm:text-xl font-bold mt-1 ${catalogSummary.outOfStockCount > 0 ? 'text-[#D96B6B]' : 'text-[#F1F0EC]'}`}>
            {catalogSummary.outOfStockCount}
          </div>
          <span className="text-[10px] text-[#85888E] mt-0.5 block">0 Units Remaining</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-[#17191D] p-4 rounded-2xl border border-[#30343A] shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-[#85888E] uppercase mb-1">
              Category
            </label>
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                setSelectedCategoryId(e.target.value);
                setSelectedSubcatId('all');
              }}
              className="w-full px-3 py-2 text-xs bg-[#1D2025] border border-[#343840] rounded-xl text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#85888E] uppercase mb-1">
              Subcategory
            </label>
            <select
              value={selectedSubcatId}
              onChange={(e) => setSelectedSubcatId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-[#1D2025] border border-[#343840] rounded-xl text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
            >
              <option value="all">All Subcategories</option>
              {availableSubcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#85888E] uppercase mb-1">
              Stock Status
            </label>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs bg-[#1D2025] border border-[#343840] rounded-xl text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="in-stock">In Stock (&gt; 10)</option>
              <option value="low-stock">Low Stock (&le; 10)</option>
              <option value="out-of-stock">Out of Stock (0)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#85888E] uppercase mb-1">
              Search Garment
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Product name, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-[#1D2025] border border-[#343840] rounded-xl text-[#F1F0EC] placeholder-[#85888E] focus:border-[#C9A96A] focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-[#85888E] absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Inventory Overview List */}
      {filteredProducts.length === 0 ? (
        <div className="bg-[#17191D] rounded-2xl p-12 text-center border border-[#30343A] space-y-3 shadow-card">
          <Package className="w-10 h-10 text-[#85888E] mx-auto" />
          <h3 className="font-bold text-base text-[#F1F0EC]">No products match your filter</h3>
          <p className="text-xs text-[#85888E] max-w-sm mx-auto">
            Try adjusting your search criteria or add new garments from the Product Manager.
          </p>
        </div>
      ) : (
        <div className="bg-[#17191D] rounded-2xl border border-[#30343A] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#1D2025] text-[#C9A96A] uppercase font-bold text-[10px] border-b border-[#30343A]">
                <tr>
                  <th className="p-3.5">Product &amp; Category</th>
                  <th className="p-3.5 text-center">Total In Stock</th>
                  <th className="p-3.5 text-center">Variants Count</th>
                  <th className="p-3.5">Price Range</th>
                  <th className="p-3.5">Stock Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272A2F] font-medium text-[#B4B5BA]">
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
                      className="hover:bg-[#1D2025]/60 transition-colors"
                    >
                      {/* Product & Category */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-14 bg-[#202329] rounded-xl overflow-hidden border border-[#30343A] flex-shrink-0 p-0.5">
                            <Image
                              src={primaryImage}
                              alt={product.name}
                              fill
                              sizes="56px"
                              className="object-contain object-center"
                            />
                          </div>

                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C9A96A] block">
                              {category?.name || 'Category'} {subcategory ? `• ${subcategory.name}` : ''}
                            </span>
                            <h3 className="font-bold text-sm text-[#F1F0EC] leading-snug">
                              {product.name}
                            </h3>
                            <p className="text-[11px] text-[#85888E] line-clamp-1">{product.subtitle}</p>
                          </div>
                        </div>
                      </td>

                      {/* Total In Stock */}
                      <td className="p-3.5 text-center">
                        <span className="font-bold text-sm text-[#C9A96A]">
                          {totalStock.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-[#85888E] block">Pieces</span>
                      </td>

                      {/* Variants Count */}
                      <td className="p-3.5 text-center">
                        <span className="font-bold text-xs bg-[#202329] border border-[#30343A] text-[#B4B5BA] px-2 py-0.5 rounded-md">
                          {variants.length} Variants
                        </span>
                      </td>

                      {/* Price Range */}
                      <td className="p-3.5">
                        <span className="font-bold text-xs text-[#F1F0EC]">
                          {minPrice === maxPrice ? `Rs. ${minPrice}` : `Rs. ${minPrice} – Rs. ${maxPrice}`}
                        </span>
                      </td>

                      {/* Stock Status */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          {totalStock <= 0 ? (
                            <span className="inline-flex items-center gap-1 text-[#D96B6B] font-bold text-[10px] bg-[#D96B6B]/15 border border-[#D96B6B]/30 px-2 py-0.5 rounded-md">
                              <XCircle className="w-3 h-3 text-[#D96B6B]" /> Out of Stock
                            </span>
                          ) : lowStockVarsCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[#D6A84F] font-bold text-[10px] bg-[#D6A84F]/15 border border-[#D6A84F]/30 px-2 py-0.5 rounded-md">
                              <AlertTriangle className="w-3 h-3 text-[#D6A84F]" /> {lowStockVarsCount} Low
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[#3FB982] font-semibold text-[10px] bg-[#3FB982]/15 border border-[#3FB982]/30 px-2 py-0.5 rounded-md">
                              <Check className="w-3 h-3 text-[#3FB982]" /> In Stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setActiveDetailProductId(product.id)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#202329] hover:bg-[#272A2F] text-[#F1F0EC] hover:text-[#C9A96A] border border-[#30343A] rounded-xl text-xs font-semibold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#C9A96A]" />
                          <span>View Matrix</span>
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

      {/* Variant Details Modal */}
      {activeDetailProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#101114]/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-[#17191D] rounded-2xl w-full max-w-5xl shadow-elevation border border-[#30343A] overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 sm:p-6 border-b border-[#30343A] bg-[#1D2025] flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-14 h-16 sm:w-16 sm:h-20 bg-[#202329] rounded-xl overflow-hidden border border-[#30343A] flex-shrink-0 p-1">
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
                  <h2 className="text-lg sm:text-xl font-bold text-[#F1F0EC]">
                    {activeDetailProduct.name}
                  </h2>
                  <p className="text-xs text-[#85888E]">
                    Total Stock: <strong className="text-[#C9A96A]">{activeProductVariants.reduce((sum, v) => sum + (v.stock || 0), 0)} pcs</strong>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveDetailProductId(null)}
                className="p-1.5 text-[#85888E] hover:text-[#F1F0EC] rounded-lg hover:bg-[#202329] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="border border-[#30343A] rounded-xl overflow-hidden shadow-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#1D2025] text-[#C9A96A] uppercase font-bold text-[10px] border-b border-[#30343A]">
                      <tr>
                        <th className="p-3">Style</th>
                        <th className="p-3 text-center">Size</th>
                        <th className="p-3">SKU</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Available Stock</th>
                        <th className="p-3">Quick Adjust</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#272A2F] font-medium text-[#B4B5BA]">
                      {activeProductVariants.map((variant) => {
                        const isLow = variant.stock > 0 && variant.stock <= 10;
                        const isOut = variant.stock <= 0;

                        return (
                          <tr
                            key={variant.id}
                            className={`hover:bg-[#1D2025]/60 transition-colors ${
                              isOut ? 'bg-[#D96B6B]/10' : isLow ? 'bg-[#D6A84F]/10' : ''
                            }`}
                          >
                            <td className="p-3 text-[#F1F0EC] font-semibold">{variant.sleeve}</td>
                            <td className="p-3 text-center">
                              <span className="font-bold bg-[#202329] text-[#C9A96A] border border-[#30343A] px-2 py-0.5 rounded-md text-xs">
                                {variant.size}
                              </span>
                            </td>
                            <td className="p-3 text-[#85888E] font-mono text-[11px]">
                              {variant.sku || '—'}
                            </td>
                            <td className="p-3 font-bold text-[#C9A96A]">Rs. {variant.price}</td>
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
                                className="w-20 sm:w-24 px-2.5 py-1.5 text-xs font-bold rounded-xl border bg-[#1D2025] border-[#343840] text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickAdjust(activeDetailProduct.id, variant.id, -5)
                                  }
                                  className="px-2 py-1 bg-[#202329] hover:bg-[#272A2F] text-[#B4B5BA] rounded-lg text-[11px] border border-[#30343A]"
                                >
                                  -5
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickAdjust(activeDetailProduct.id, variant.id, 10)
                                  }
                                  className="px-2 py-1 bg-[#202329] hover:bg-[#272A2F] text-[#B4B5BA] rounded-lg text-[11px] border border-[#30343A]"
                                >
                                  +10
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleQuickAdjust(activeDetailProduct.id, variant.id, 50)
                                  }
                                  className="px-2 py-1 bg-[#C9A96A] text-[#101114] font-bold rounded-lg text-[11px]"
                                >
                                  +50
                                </button>
                              </div>
                            </td>
                            <td className="p-3">
                              {isOut ? (
                                <span className="inline-flex items-center gap-1 text-[#D96B6B] font-bold text-[10px] bg-[#D96B6B]/15 border border-[#D96B6B]/30 px-2 py-0.5 rounded-md">
                                  <XCircle className="w-3 h-3" /> Out
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1 text-[#D6A84F] font-bold text-[10px] bg-[#D6A84F]/15 border border-[#D6A84F]/30 px-2 py-0.5 rounded-md">
                                  <AlertTriangle className="w-3 h-3" /> Low ({variant.stock})
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[#3FB982] font-semibold text-[10px] bg-[#3FB982]/15 border border-[#3FB982]/30 px-2 py-0.5 rounded-md">
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

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-[#30343A] bg-[#1D2025] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveDetailProductId(null)}
                className="px-4 py-2 text-xs font-semibold text-[#85888E] hover:text-[#F1F0EC] rounded-xl"
              >
                Close
              </button>

              <button
                type="button"
                onClick={() => handleSaveProductStock(activeDetailProduct.id)}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Stock Levels'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
