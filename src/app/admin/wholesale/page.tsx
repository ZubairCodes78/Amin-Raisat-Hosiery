'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Product, ProductVariant } from '@/types';
import {
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Package,
  DollarSign,
  TrendingUp,
  Sliders,
  RefreshCw,
  Eye,
  Plus,
  Trash2,
} from 'lucide-react';

export default function AdminWholesalePage() {
  const { settings, updateSettings, products, saveProduct, orders } = useStore();

  const [wholesaleSettings, setWholesaleSettings] = useState({
    isEnabled: settings.wholesale?.isEnabled ?? true,
    defaultMinQty: settings.wholesale?.defaultMinQty ?? settings.wholesale?.minQuantity ?? 12,
    minQuantity: settings.wholesale?.minQuantity ?? settings.wholesale?.defaultMinQty ?? 12,
    defaultDiscountPercent: settings.wholesale?.defaultDiscountPercent ?? 18,
    freeDeliveryForWholesale: settings.wholesale?.freeDeliveryForWholesale ?? true,
    inquiryWhatsApp: settings.wholesale?.inquiryWhatsApp || settings.whatsapp || '03018666075',
    termsAndNotes:
      settings.wholesale?.termsAndNotes ||
      'Wholesale orders require a minimum of 12 pieces (1 dozen). 100% Free Nationwide Delivery across Pakistan. Cash on delivery and direct bank transfer available.',
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // Local product variant wholesale pricing modifications
  const [editingProducts, setEditingProducts] = useState<Product[]>(products);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);

  // Sync products when store loads
  React.useEffect(() => {
    setEditingProducts(products);
  }, [products]);

  // Analytics Metrics
  const wholesaleOrders = orders.filter((o) => o.isWholesale);
  const totalWholesaleRevenue = wholesaleOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const avgWholesaleOrderValue =
    wholesaleOrders.length > 0 ? Math.round(totalWholesaleRevenue / wholesaleOrders.length) : 0;

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      await updateSettings({
        ...settings,
        wholesale: wholesaleSettings,
      });
      setSaveSuccessMsg('Global wholesale settings successfully updated!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
      setSaveErrorMsg(err?.message || 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleProductWholesale = async (prod: Product) => {
    const nextState = prod.isWholesaleEnabled === false ? true : false;
    const updatedProd: Product = {
      ...prod,
      isWholesaleEnabled: nextState,
    };

    setSavingProductId(prod.id);
    try {
      await saveProduct(updatedProd);
      setEditingProducts((prev) => prev.map((p) => (p.id === prod.id ? updatedProd : p)));
    } catch (err) {
      console.error('Failed to toggle product wholesale:', err);
    } finally {
      setSavingProductId(null);
    }
  };

  const handleVariantWholesalePriceChange = (
    productId: string,
    variantId: string,
    newPrice: number
  ) => {
    setEditingProducts((prev) =>
      prev.map((prod) => {
        if (prod.id !== productId) return prod;
        return {
          ...prod,
          variants: prod.variants.map((v) => {
            if (v.id !== variantId) return v;
            return {
              ...v,
              wholesalePrice: newPrice,
            };
          }),
        };
      })
    );
  };

  const handleSaveProductWholesalePricing = async (productId: string) => {
    const prod = editingProducts.find((p) => p.id === productId);
    if (!prod) return;

    setSavingProductId(productId);
    try {
      await saveProduct(prod);
      setSaveSuccessMsg(`Wholesale prices updated for "${prod.name}"!`);
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err: any) {
      console.error(err);
      setSaveErrorMsg(err?.message || 'Failed to update wholesale prices.');
    } finally {
      setSavingProductId(null);
    }
  };

  const handleApplyGlobalDiscountToProduct = (prod: Product) => {
    const discount = wholesaleSettings.defaultDiscountPercent || 18;
    const updatedVariants = prod.variants.map((v) => {
      const retail = v.salePrice || v.price;
      const calcWholesale = Math.round(retail * (1 - discount / 100));
      return {
        ...v,
        wholesalePrice: calcWholesale,
      };
    });

    const updatedProd = {
      ...prod,
      variants: updatedVariants,
      isWholesaleEnabled: true,
      wholesaleMinQty: wholesaleSettings.minQuantity,
    };

    setEditingProducts((prev) => prev.map((p) => (p.id === prod.id ? updatedProd : p)));
  };

  return (
    <div className="space-y-8 select-none">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-light-border dark:border-[#30343A] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-charcoal-900 dark:text-[#F1F0EC]">
              Wholesale &amp; B2B Commerce Manager
            </h1>
            <span className="bg-[#C9A96A] text-black text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
              B2B Portal
            </span>
          </div>
          <p className="text-xs text-charcoal-500 dark:text-[#85888E] mt-1">
            Configure factory wholesale rules, bulk tier pricing, minimum order quantities, and commercial settings.
          </p>
        </div>
      </div>

      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{saveSuccessMsg}</span>
        </div>
      )}

      {saveErrorMsg && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{saveErrorMsg}</span>
        </div>
      )}

      {/* 2. Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#17191D] border border-light-border dark:border-[#30343A] shadow-sm dark:shadow-card space-y-1">
          <div className="flex items-center justify-between text-charcoal-500 dark:text-[#85888E] text-xs font-semibold">
            <span>Wholesale Orders</span>
            <Package className="w-4 h-4 text-[#A07D38] dark:text-[#C9A96A]" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal-900 dark:text-[#F1F0EC]">{wholesaleOrders.length}</div>
          <p className="text-[11px] text-charcoal-400 dark:text-gray-400">Total B2B bulk orders placed</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17191D] border border-light-border dark:border-[#30343A] shadow-sm dark:shadow-card space-y-1">
          <div className="flex items-center justify-between text-charcoal-500 dark:text-[#85888E] text-xs font-semibold">
            <span>Wholesale Revenue</span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal-900 dark:text-[#F1F0EC]">Rs. {totalWholesaleRevenue.toLocaleString()}</div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400">Bulk gross merchandise value</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#17191D] border border-light-border dark:border-[#30343A] shadow-sm dark:shadow-card space-y-1">
          <div className="flex items-center justify-between text-charcoal-500 dark:text-[#85888E] text-xs font-semibold">
            <span>Avg Wholesale Ticket</span>
            <TrendingUp className="w-4 h-4 text-[#A07D38] dark:text-[#C9A96A]" />
          </div>
          <div className="text-2xl font-extrabold text-charcoal-900 dark:text-[#F1F0EC]">Rs. {avgWholesaleOrderValue.toLocaleString()}</div>
          <p className="text-[11px] text-charcoal-400 dark:text-gray-400">Per wholesale transaction</p>
        </div>
      </div>

      {/* 3. Global Wholesale Settings Configuration Form */}
      <form
        onSubmit={handleSaveSettings}
        className="p-6 rounded-2xl bg-white dark:bg-[#17191D] border border-light-border dark:border-[#30343A] shadow-sm dark:shadow-card space-y-5"
      >
        <div className="flex items-center justify-between border-b border-light-border dark:border-[#30343A] pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#A07D38] dark:text-[#C9A96A]" />
            <h2 className="font-bold text-sm text-charcoal-900 dark:text-[#F1F0EC]">Global Wholesale Rules &amp; Policy</h2>
          </div>
          <button
            type="submit"
            disabled={savingSettings}
            className="px-4 py-2 bg-champagne-500 hover:bg-champagne-400 disabled:opacity-50 text-black font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{savingSettings ? 'Saving...' : 'Save Global Rules'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B4B5BA] mb-1">
              Wholesale Module Status
            </label>
            <select
              value={wholesaleSettings.isEnabled ? 'active' : 'inactive'}
              onChange={(e) =>
                setWholesaleSettings({
                  ...wholesaleSettings,
                  isEnabled: e.target.value === 'active',
                })
              }
              className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] rounded-xl text-charcoal-900 dark:text-[#F1F0EC]"
            >
              <option value="active">Enabled (Active Storefront)</option>
              <option value="inactive">Disabled (Hidden)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B4B5BA] mb-1">
              Minimum Wholesale Qty (Pieces)
            </label>
            <input
              type="number"
              min={1}
              value={wholesaleSettings.minQuantity}
              onChange={(e) =>
                setWholesaleSettings({
                  ...wholesaleSettings,
                  minQuantity: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] rounded-xl text-charcoal-900 dark:text-[#F1F0EC]"
            />
            <span className="text-[10px] text-charcoal-400 dark:text-gray-400">Default: 12 pcs (1 Dozen)</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B4B5BA] mb-1">
              Default Wholesale Discount %
            </label>
            <input
              type="number"
              min={1}
              max={80}
              value={wholesaleSettings.defaultDiscountPercent}
              onChange={(e) =>
                setWholesaleSettings({
                  ...wholesaleSettings,
                  defaultDiscountPercent: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] rounded-xl text-charcoal-900 dark:text-[#F1F0EC]"
            />
            <span className="text-[10px] text-charcoal-400 dark:text-gray-400">Standard factory discount rate</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B4B5BA] mb-1">
              Wholesale Delivery Policy
            </label>
            <select
              value={wholesaleSettings.freeDeliveryForWholesale ? 'free' : 'standard'}
              onChange={(e) =>
                setWholesaleSettings({
                  ...wholesaleSettings,
                  freeDeliveryForWholesale: e.target.value === 'free',
                })
              }
              className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] rounded-xl text-charcoal-900 dark:text-[#F1F0EC]"
            >
              <option value="free">100% Free Nationwide Delivery</option>
              <option value="standard">Standard Shipping Fee Applied</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B4B5BA] mb-1">
            Wholesale Notice &amp; Terms Message
          </label>
          <input
            type="text"
            value={wholesaleSettings.termsAndNotes}
            onChange={(e) =>
              setWholesaleSettings({
                ...wholesaleSettings,
                termsAndNotes: e.target.value,
              })
            }
            className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] rounded-xl text-charcoal-900 dark:text-[#F1F0EC]"
          />
        </div>
      </form>

      {/* 4. Product Wholesale Pricing Editor Table */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#17191D] border border-light-border dark:border-[#30343A] shadow-sm dark:shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-border dark:border-[#30343A] pb-3">
          <div>
            <h2 className="font-bold text-sm text-charcoal-900 dark:text-[#F1F0EC] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#A07D38] dark:text-[#C9A96A]" />
              <span>Product &amp; Variant Wholesale Pricing ({editingProducts.length} Products)</span>
            </h2>
            <p className="text-xs text-charcoal-500 dark:text-[#85888E]">
              Edit wholesale prices per variant. When an order reaches 12+ pieces, the wholesale unit price is applied automatically.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {editingProducts.map((prod) => {
            const isEnabled = prod.isWholesaleEnabled !== false;
            const isSaving = savingProductId === prod.id;

            return (
              <div
                key={prod.id}
                className="p-4 rounded-xl bg-light-elevated dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] space-y-4"
              >
                {/* Product Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-light-border dark:border-[#30343A] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-charcoal-900 dark:text-gray-100">{prod.name}</h3>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isEnabled
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                        }`}
                      >
                        {isEnabled ? 'Wholesale Enabled' : 'Wholesale Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-500 dark:text-gray-400">{prod.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleApplyGlobalDiscountToProduct(prod)}
                      className="px-3 py-1.5 bg-champagne-100 dark:bg-[#2A2E35] hover:bg-champagne-200 dark:hover:bg-[#343840] text-[#A07D38] dark:text-[#C9A96A] border border-[#C9A96A]/30 text-xs font-semibold rounded-lg transition-colors"
                      title={`Apply ${wholesaleSettings.defaultDiscountPercent}% discount across all variants`}
                    >
                      Apply {wholesaleSettings.defaultDiscountPercent}% Global Rate
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleProductWholesale(prod)}
                      disabled={isSaving}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        isEnabled
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                      }`}
                    >
                      {isEnabled ? 'Disable Wholesale' : 'Enable Wholesale'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSaveProductWholesalePricing(prod.id)}
                      disabled={isSaving}
                      className="px-3.5 py-1.5 bg-champagne-500 hover:bg-champagne-400 text-black font-bold text-xs rounded-lg shadow-xs flex items-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{isSaving ? 'Saving...' : 'Save Product'}</span>
                    </button>
                  </div>
                </div>

                {/* Variants Pricing Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-light-border dark:border-[#30343A] text-charcoal-500 dark:text-gray-400">
                        <th className="py-2">Quality &amp; Style</th>
                        <th className="py-2">Size</th>
                        <th className="py-2">Retail Price (PKR)</th>
                        <th className="py-2">Wholesale Unit Price (PKR)</th>
                        <th className="py-2">Wholesale Margin / Discount</th>
                        <th className="py-2">Stock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-light-border dark:divide-[#30343A] text-charcoal-900 dark:text-gray-100">
                      {prod.variants.map((v) => {
                        const retail = v.salePrice || v.price;
                        const wholesale = v.wholesalePrice || Math.round(retail * 0.82);
                        const discount = Math.round(((retail - wholesale) / retail) * 100);

                        return (
                          <tr key={v.id} className="hover:bg-white dark:hover:bg-[#23262B] transition-colors">
                            <td className="py-2 font-semibold text-charcoal-900 dark:text-gray-200">
                              {v.quality} — {v.sleeve}
                            </td>
                            <td className="py-2">
                              <span className="font-bold bg-champagne-100 dark:bg-[#17191D] text-[#A07D38] dark:text-[#C9A96A] border border-[#C9A96A]/30 px-1.5 py-0.5 rounded">
                                {v.size}
                              </span>
                            </td>
                            <td className="py-2 font-mono text-charcoal-700 dark:text-gray-300">
                              Rs. {retail}
                            </td>
                            <td className="py-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-charcoal-400 dark:text-gray-500 text-xs">Rs.</span>
                                <input
                                  type="number"
                                  min={100}
                                  value={wholesale}
                                  onChange={(e) =>
                                    handleVariantWholesalePriceChange(
                                      prod.id,
                                      v.id,
                                      Number(e.target.value)
                                    )
                                  }
                                  className="w-24 px-2 py-1 bg-white dark:bg-[#17191D] border border-light-border dark:border-[#3E434B] rounded text-xs font-bold text-[#A07D38] dark:text-[#C9A96A] focus:outline-none focus:border-[#C9A96A]"
                                />
                              </div>
                            </td>
                            <td className="py-2">
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded">
                                -{discount}% (Save Rs. {retail - wholesale}/pc)
                              </span>
                            </td>
                            <td className="py-2 text-charcoal-600 dark:text-gray-400">
                              {v.stock} pcs
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
