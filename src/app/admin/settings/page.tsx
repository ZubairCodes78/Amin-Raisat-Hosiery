'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { SiteSettings } from '@/types';
import {
  Save,
  Truck,
  Building2,
  Check,
  Megaphone,
  CreditCard,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export default function AdminSettingsPage() {
  const { settings, updateSettings } = useStore();
  const [formState, setFormState] = useState<SiteSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    setFormState(settings);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(formState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl text-gray-100">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-card">
        <div>
          <h1 className="text-xl font-extrabold text-gray-100">Store &amp; Delivery Settings</h1>
          <p className="text-xs text-gray-400 mt-1">
            Centralized store management: change delivery thresholds, charges, announcement text, and payment rules.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold h-10 px-5 rounded-xl shadow-glow-gold transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>All store settings saved and updated live on the website!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Delivery & Order Rules */}
        <div className="bg-dark-surface rounded-2xl p-5 sm:p-6 border border-dark-border shadow-card space-y-4">
          <div className="flex items-center gap-3 border-b border-dark-border pb-3">
            <div className="p-2 bg-dark-card text-gold-400 rounded-xl border border-dark-border">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-100">1. Delivery Rules &amp; Shipping Charges</h2>
              <p className="text-xs text-gray-400">
                These numbers automatically control free delivery messages, product pages, cart calculation, and checkout.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Free Delivery After (Pieces) *
              </label>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={formState.shipping?.freeDeliveryThreshold ?? 3}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    shipping: {
                      ...formState.shipping,
                      freeDeliveryThreshold: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl font-bold text-gold-400"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Standard default: 3 pieces
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Standard Delivery Charge (Rs.) *
              </label>
              <input
                type="number"
                min={0}
                required
                value={formState.shipping?.baseDeliveryCharge ?? 200}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    shipping: {
                      ...formState.shipping,
                      baseDeliveryCharge: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl font-bold text-gold-400"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Charged when below free threshold (Default: Rs. 200)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Minimum Order Quantity (Pieces)
              </label>
              <input
                type="number"
                min={1}
                required
                value={formState.shipping?.minOrderQty ?? 3}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    shipping: {
                      ...formState.shipping,
                      minOrderQty: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl font-bold text-gray-100"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Default: 3 pieces</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Maximum Order Quantity (Pieces)
              </label>
              <input
                type="number"
                min={1}
                required
                value={formState.shipping?.maxOrderQty ?? 12}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    shipping: {
                      ...formState.shipping,
                      maxOrderQty: Number(e.target.value),
                    },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl font-bold text-gray-100"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Default: 12 pieces</span>
            </div>
          </div>

          <div className="pt-2 border-t border-dark-border grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Exchange / Return Period (Days)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={formState.exchangeReturnDays ?? 7}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    exchangeReturnDays: Number(e.target.value),
                  })
                }
                className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl font-bold text-gray-100"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Shown on exchange &amp; returns page (Default: 7 days)
              </span>
            </div>
          </div>
        </div>

        {/* 2. Announcement Bar Settings */}
        <div className="bg-dark-surface rounded-2xl p-5 sm:p-6 border border-dark-border shadow-card space-y-4">
          <div className="flex items-center gap-3 border-b border-dark-border pb-3">
            <div className="p-2 bg-dark-card text-gold-400 rounded-xl border border-dark-border">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-100">2. Website Announcement Bar</h2>
              <p className="text-xs text-gray-400">
                Top ticker displayed at the very top of the website.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="announcement-toggle"
                checked={formState.isAnnouncementEnabled ?? true}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    isAnnouncementEnabled: e.target.checked,
                  })
                }
                className="rounded accent-gold-500 w-4 h-4"
              />
              <label htmlFor="announcement-toggle" className="text-xs font-bold text-gray-200 cursor-pointer">
                Enable Top Announcement Bar on Website
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">
                Custom Announcement Message (Optional)
              </label>
              <input
                type="text"
                placeholder="Leave blank to use default 3+ Free Delivery messaging"
                value={formState.announcementText || ''}
                onChange={(e) => setFormState({ ...formState, announcementText: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100"
              />
            </div>
          </div>
        </div>

        {/* 3. Payment Methods */}
        <div className="bg-dark-surface rounded-2xl p-5 sm:p-6 border border-dark-border shadow-card space-y-4">
          <div className="flex items-center gap-3 border-b border-dark-border pb-3">
            <div className="p-2 bg-dark-card text-gold-400 rounded-xl border border-dark-border">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-100">3. Payment Methods &amp; Bank Details</h2>
              <p className="text-xs text-gray-400">
                Enable or disable Cash on Delivery and Direct Bank Transfer at checkout.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
            <div className="p-3.5 border border-dark-border rounded-xl bg-dark-card flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-gray-200 block">Cash on Delivery (COD)</span>
                <span className="text-[11px] text-gray-400">Pay cash upon delivery</span>
              </div>
              <input
                type="checkbox"
                checked={formState.isCodEnabled ?? true}
                onChange={(e) => setFormState({ ...formState, isCodEnabled: e.target.checked })}
                className="rounded accent-gold-500 w-4 h-4"
              />
            </div>

            <div className="p-3.5 border border-dark-border rounded-xl bg-dark-card flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-gray-200 block">Direct Bank Transfer</span>
                <span className="text-[11px] text-gray-400">Bank deposit / online transfer</span>
              </div>
              <input
                type="checkbox"
                checked={formState.isBankTransferEnabled ?? true}
                onChange={(e) => setFormState({ ...formState, isBankTransferEnabled: e.target.checked })}
                className="rounded accent-gold-500 w-4 h-4"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-dark-border">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Bank Name</label>
              <input
                type="text"
                value={formState.bankDetails?.bankName || ''}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    bankDetails: { ...formState.bankDetails, bankName: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl font-bold text-gray-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Account Title</label>
              <input
                type="text"
                value={formState.bankDetails?.accountTitle || ''}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    bankDetails: { ...formState.bankDetails, accountTitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl font-bold text-gray-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">Account Number</label>
              <input
                type="text"
                value={formState.bankDetails?.accountNumber || ''}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    bankDetails: { ...formState.bankDetails, accountNumber: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl font-mono font-bold text-gold-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">IBAN / Raast ID</label>
              <input
                type="text"
                value={formState.bankDetails?.iban || ''}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    bankDetails: { ...formState.bankDetails, iban: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl font-mono font-bold text-gold-400"
              />
            </div>
          </div>
        </div>

        {/* 4. Business & Contact Info */}
        <div className="bg-dark-surface rounded-2xl p-5 sm:p-6 border border-dark-border shadow-card space-y-4">
          <div className="flex items-center gap-3 border-b border-dark-border pb-3">
            <div className="p-2 bg-dark-card text-[#25D366] rounded-xl border border-dark-border">
              <WhatsAppIcon size={20} className="fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-100">4. Store Info, Contact &amp; WhatsApp</h2>
              <p className="text-xs text-gray-400">Official contact info displayed across the storefront.</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="whatsapp-floating-toggle"
                checked={formState.isWhatsAppFloatingEnabled ?? true}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    isWhatsAppFloatingEnabled: e.target.checked,
                  })
                }
                className="rounded accent-gold-500 w-4 h-4"
              />
              <label htmlFor="whatsapp-floating-toggle" className="text-xs font-bold text-gray-200 cursor-pointer">
                Enable Floating WhatsApp Button on Website
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Brand Name</label>
                <input
                  type="text"
                  value={formState.brandName}
                  onChange={(e) => setFormState({ ...formState, brandName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl font-bold text-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Owner Name</label>
                <input
                  type="text"
                  value={formState.ownerName}
                  onChange={(e) => setFormState({ ...formState, ownerName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl font-bold text-gray-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  WhatsApp Order Number *
                </label>
                <input
                  type="text"
                  required
                  value={formState.whatsapp}
                  onChange={(e) => setFormState({ ...formState, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl font-bold text-gold-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  Official Support Email
                </label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl font-bold text-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="h-11 px-7 bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs rounded-xl shadow-glow-gold flex items-center gap-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
