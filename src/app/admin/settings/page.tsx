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
  const [toastMessage, setToastMessage] = useState('');

  React.useEffect(() => {
    setFormState(settings);
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings(formState);
      setToastMessage('All store settings saved and updated live across the website!');
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setToastMessage('');
      }, 3500);
    } catch (err) {
      setToastMessage('Error updating settings. Please try again.');
      setTimeout(() => setToastMessage(''), 3500);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl text-charcoal-900 dark:text-[#F4F1E9]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-white dark:bg-[#191917] text-charcoal-900 dark:text-[#F4F1E9] border border-emerald-500/40 rounded-xl shadow-elevation flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#191917] p-6 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-charcoal-900 dark:text-[#F4F1E9]">Store &amp; Delivery Engine Settings</h1>
          <p className="text-xs text-charcoal-500 dark:text-[#8E8A80] mt-1">
            Centralized store management: configure free delivery thresholds (3+ pieces rule), shipping charges, announcement text, and bank details.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 bg-champagne-500 hover:bg-champagne-400 text-charcoal-950 text-xs font-bold h-10 px-5 rounded-xl shadow-xs transition-all"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Delivery & Order Rules */}
        <div className="bg-white dark:bg-[#191917] rounded-2xl p-5 sm:p-6 border border-light-border dark:border-[#34322D] shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-light-border dark:border-[#34322D] pb-3">
            <div className="p-2 bg-light-elevated dark:bg-[#22211E] text-[#B89555] dark:text-[#C9A96A] rounded-xl border border-light-border dark:border-[#34322D]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal-900 dark:text-[#F4F1E9]">1. Delivery Rules &amp; Shipping Charges</h2>
              <p className="text-xs text-charcoal-500 dark:text-[#8E8A80]">
                These parameters automatically sync across homepage benefit strips, cart calculations, checkout, and WhatsApp order messages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
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
                className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl font-bold text-[#B89555] dark:text-[#C9A96A] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
              />
              <span className="text-[10px] text-charcoal-500 dark:text-[#8E8A80] mt-1 block">
                Store policy: 3+ pieces = FREE DELIVERY
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
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
                className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl font-bold text-[#B89555] dark:text-[#C9A96A] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
              />
              <span className="text-[10px] text-charcoal-500 dark:text-[#8E8A80] mt-1 block">
                Applied when order &lt; 3 pieces (Default: Rs. 200)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
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
                className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl font-bold text-charcoal-900 dark:text-[#F4F1E9] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
              />
              <span className="text-[10px] text-charcoal-500 dark:text-[#8E8A80] mt-1 block">Default: 3 pieces</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
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
                className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl font-bold text-charcoal-900 dark:text-[#F4F1E9] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
              />
              <span className="text-[10px] text-charcoal-500 dark:text-[#8E8A80] mt-1 block">Default: 12 pieces</span>
            </div>
          </div>

          <div className="pt-2 border-t border-light-border dark:border-[#34322D] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
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
                className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl font-bold text-charcoal-900 dark:text-[#F4F1E9] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
              />
              <span className="text-[10px] text-charcoal-500 dark:text-[#8E8A80] mt-1 block">
                Shown on exchange &amp; returns page (Default: 7 days)
              </span>
            </div>
          </div>
        </div>

        {/* 2. Announcement Bar Settings */}
        <div className="bg-white dark:bg-[#191917] rounded-2xl p-5 sm:p-6 border border-light-border dark:border-[#34322D] shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-light-border dark:border-[#34322D] pb-3">
            <div className="p-2 bg-light-elevated dark:bg-[#22211E] text-[#B89555] dark:text-[#C9A96A] rounded-xl border border-light-border dark:border-[#34322D]">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal-900 dark:text-[#F4F1E9]">2. Website Announcement Bar</h2>
              <p className="text-xs text-charcoal-500 dark:text-[#8E8A80]">
                Top promotional ticker displayed across the storefront.
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
                className="rounded accent-[#B89555] w-4 h-4"
              />
              <label htmlFor="announcement-toggle" className="text-xs font-semibold text-charcoal-900 dark:text-[#F4F1E9] cursor-pointer">
                Enable Top Announcement Bar on Website
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                Custom Announcement Message (Optional)
              </label>
              <input
                type="text"
                placeholder="Leave blank to use default 3+ Free Delivery messaging"
                value={formState.announcementText || ''}
                onChange={(e) => setFormState({ ...formState, announcementText: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-900 dark:text-[#F4F1E9] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Payment Methods */}
        <div className="bg-white dark:bg-[#191917] rounded-2xl p-5 sm:p-6 border border-light-border dark:border-[#34322D] shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-light-border dark:border-[#34322D] pb-3">
            <div className="p-2 bg-light-elevated dark:bg-[#22211E] text-[#B89555] dark:text-[#C9A96A] rounded-xl border border-light-border dark:border-[#34322D]">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal-900 dark:text-[#F4F1E9]">3. Payment Methods &amp; Bank Details</h2>
              <p className="text-xs text-charcoal-500 dark:text-[#8E8A80]">
                Enable or disable Cash on Delivery and Direct Bank Transfer at checkout.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2">
            <div className="p-3.5 border border-light-border dark:border-[#34322D] rounded-xl bg-light-elevated dark:bg-[#22211E] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-charcoal-900 dark:text-[#F4F1E9] block">Cash on Delivery (COD)</span>
                <span className="text-[11px] text-charcoal-500 dark:text-[#8E8A80]">Pay cash upon delivery nationwide</span>
              </div>
              <input
                type="checkbox"
                checked={formState.isCodEnabled ?? true}
                onChange={(e) => setFormState({ ...formState, isCodEnabled: e.target.checked })}
                className="rounded accent-[#B89555] w-4 h-4"
              />
            </div>

            <div className="p-3.5 border border-light-border dark:border-[#34322D] rounded-xl bg-light-elevated dark:bg-[#22211E] flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-charcoal-900 dark:text-[#F4F1E9] block">Direct Bank Transfer</span>
                <span className="text-[11px] text-charcoal-500 dark:text-[#8E8A80]">Bank deposit / online transfer</span>
              </div>
              <input
                type="checkbox"
                checked={formState.isBankTransferEnabled ?? true}
                onChange={(e) => setFormState({ ...formState, isBankTransferEnabled: e.target.checked })}
                className="rounded accent-[#B89555] w-4 h-4"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-light-border dark:border-[#34322D]">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">Bank Name</label>
              <input
                type="text"
                value={formState.bankDetails?.bankName || ''}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    bankDetails: { ...formState.bankDetails, bankName: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl font-bold text-charcoal-900 dark:text-[#F4F1E9] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">Account Title</label>
              <input
                type="text"
                value={formState.bankDetails?.accountTitle || ''}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    bankDetails: { ...formState.bankDetails, accountTitle: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl font-bold text-charcoal-900 dark:text-[#F4F1E9] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">Account Number</label>
              <input
                type="text"
                value={formState.bankDetails?.accountNumber || ''}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    bankDetails: { ...formState.bankDetails, accountNumber: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl font-mono font-bold text-[#B89555] dark:text-[#C9A96A] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">IBAN / Raast ID</label>
              <input
                type="text"
                value={formState.bankDetails?.iban || ''}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    bankDetails: { ...formState.bankDetails, iban: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl font-mono font-bold text-[#B89555] dark:text-[#C9A96A] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Business & Contact Info */}
        <div className="bg-white dark:bg-[#191917] rounded-2xl p-5 sm:p-6 border border-light-border dark:border-[#34322D] shadow-sm space-y-4">
          <div className="flex items-center gap-3 border-b border-light-border dark:border-[#34322D] pb-3">
            <div className="p-2 bg-light-elevated dark:bg-[#22211E] text-[#25D366] rounded-xl border border-light-border dark:border-[#34322D]">
              <WhatsAppIcon size={20} className="fill-current" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-charcoal-900 dark:text-[#F4F1E9]">4. Store Info, Contact &amp; WhatsApp</h2>
              <p className="text-xs text-charcoal-500 dark:text-[#8E8A80]">Official contact info displayed across the storefront.</p>
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
                className="rounded accent-[#B89555] w-4 h-4"
              />
              <label htmlFor="whatsapp-floating-toggle" className="text-xs font-semibold text-charcoal-900 dark:text-[#F4F1E9] cursor-pointer">
                Enable Floating WhatsApp Button on Website
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">Brand Name</label>
                <input
                  type="text"
                  value={formState.brandName}
                  onChange={(e) => setFormState({ ...formState, brandName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl font-bold text-charcoal-900 dark:text-[#F4F1E9] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">Owner Name</label>
                <input
                  type="text"
                  value={formState.ownerName}
                  onChange={(e) => setFormState({ ...formState, ownerName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl font-bold text-charcoal-900 dark:text-[#F4F1E9] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                  WhatsApp Order Number *
                </label>
                <input
                  type="text"
                  required
                  value={formState.whatsapp}
                  onChange={(e) => setFormState({ ...formState, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl font-bold text-[#B89555] dark:text-[#C9A96A] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                  Official Support Email
                </label>
                <input
                  type="email"
                  value={formState.email}
                  onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl font-bold text-charcoal-900 dark:text-[#F4F1E9] focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="h-11 px-7 bg-champagne-500 hover:bg-champagne-400 text-charcoal-950 font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-[0.99]"
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
