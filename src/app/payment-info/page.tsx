'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { CreditCard, Landmark, Smartphone, ShieldCheck, Clock, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { DISPLAY_WHATSAPP_NUMBER } from '@/lib/whatsapp';

export default function PaymentInfoPage() {
  const { settings } = useStore();
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const methods = settings.paymentMethods;
  const bank = settings.bankDetails;
  const whatsappNumber = settings.whatsapp || DISPLAY_WHATSAPP_NUMBER;

  return (
    <div className="min-h-screen py-12 bg-light-bg dark:bg-[#11110F] text-charcoal-900 dark:text-[#F4F1E9] transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs text-charcoal-500 dark:text-[#B8B3A8]">
          <Link href="/" className="hover:text-[#B89555] dark:hover:text-[#C9A96A] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-charcoal-400 dark:text-[#6E6A62]" />
          <span className="font-semibold text-charcoal-900 dark:text-[#F4F1E9]">Payment Methods &amp; Details</span>
        </nav>

        {/* Hero Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-champagne-100 dark:bg-[#22211E] text-[#96763D] dark:text-[#C9A96A] text-xs font-bold border border-[#B89555]/30 uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Safe &amp; Verified Transactions
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-charcoal-900 dark:text-[#F4F1E9] tracking-tight">
            Official Payment Information
          </h1>
          <p className="text-sm sm:text-base text-charcoal-600 dark:text-[#B8B3A8] max-w-2xl mx-auto font-normal leading-relaxed">
            We accept Cash on Delivery (COD), Direct Bank Transfer, JazzCash, EasyPaisa, and SadaPay.
            Choose your preferred method at checkout.
          </p>
        </div>

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Cash on Delivery (COD) */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#191917] border border-light-border dark:border-[#34322D] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-charcoal-900 dark:text-[#F4F1E9]">Cash on Delivery (COD)</h2>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {methods?.cod?.enabled ?? true ? 'Available Across Pakistan' : 'Temporarily Unavailable'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold bg-light-elevated dark:bg-[#22211E] text-charcoal-700 dark:text-[#D7D7D4] px-2.5 py-1 rounded-lg border border-light-border dark:border-[#34322D]">
                Doorstep Pay
              </span>
            </div>
            <p className="text-xs text-charcoal-600 dark:text-[#B8B3A8] leading-relaxed">
              Pay in cash directly to the courier rider upon package delivery at your doorstep anywhere in Pakistan.
              Zero upfront payment required.
            </p>
            <div className="p-3 bg-light-elevated dark:bg-[#22211E] rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-charcoal-800 dark:text-[#F4F1E9]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Instant Order Confirmation
              </div>
              <p className="text-charcoal-500 dark:text-[#8E8A80] text-[11px]">
                No screenshot needed. Courier delivers within 2–4 business days.
              </p>
            </div>
          </div>

          {/* 2. Direct Bank Transfer */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#191917] border border-light-border dark:border-[#34322D] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-charcoal-900 dark:text-[#F4F1E9]">
                    {methods?.bank_transfer?.bankName || bank?.bankName || 'Direct Bank Transfer'}
                  </h2>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {methods?.bank_transfer?.enabled ?? true ? 'Official Corporate Account' : 'Inactive'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold bg-champagne-100 dark:bg-[#22211E] text-[#96763D] dark:text-[#C9A96A] px-2.5 py-1 rounded-lg border border-[#B89555]/30">
                Online / Raast
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-light-border dark:divide-[#34322D]">
              <div className="flex items-center justify-between pt-1">
                <span className="text-charcoal-500 dark:text-[#8E8A80]">Account Title:</span>
                <span className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">
                  {methods?.bank_transfer?.accountTitle || bank?.accountTitle || 'AMIN RAISAT HOSIERY'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-charcoal-500 dark:text-[#8E8A80]">Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-charcoal-900 dark:text-[#F4F1E9]">
                    {methods?.bank_transfer?.accountNumber || bank?.accountNumber || '1088-0081-0062-8101'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(methods?.bank_transfer?.accountNumber || bank?.accountNumber || '1088008100628101', 'bank-acc')}
                    className="p-1 rounded text-charcoal-400 hover:text-[#B89555]"
                    title="Copy Account Number"
                  >
                    {copiedKey === 'bank-acc' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-charcoal-500 dark:text-[#8E8A80]">IBAN:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-charcoal-900 dark:text-[#F4F1E9]">
                    {methods?.bank_transfer?.iban || bank?.iban || 'PK09BBAH0010880081006281'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(methods?.bank_transfer?.iban || bank?.iban || 'PK09BBAH0010880081006281', 'bank-iban')}
                    className="p-1 rounded text-charcoal-400 hover:text-[#B89555]"
                    title="Copy IBAN"
                  >
                    {copiedKey === 'bank-iban' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. JazzCash */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#191917] border border-light-border dark:border-[#34322D] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-charcoal-900 dark:text-[#F4F1E9]">JazzCash Mobile Account</h2>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {methods?.jazzcash?.enabled ?? true ? 'Active & Instant' : 'Inactive'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900">
                JazzCash
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-light-border dark:divide-[#34322D]">
              <div className="flex items-center justify-between pt-1">
                <span className="text-charcoal-500 dark:text-[#8E8A80]">Account Title:</span>
                <span className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">
                  {methods?.jazzcash?.accountTitle || 'MUHAMMAD ZUBAIR'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-charcoal-500 dark:text-[#8E8A80]">Mobile / Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-charcoal-900 dark:text-[#F4F1E9]">
                    {methods?.jazzcash?.accountNumber || '03088666075'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(methods?.jazzcash?.accountNumber || '03088666075', 'jazzcash')}
                    className="p-1 rounded text-charcoal-400 hover:text-[#B89555]"
                    title="Copy JazzCash Number"
                  >
                    {copiedKey === 'jazzcash' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. EasyPaisa */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#191917] border border-light-border dark:border-[#34322D] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-charcoal-900 dark:text-[#F4F1E9]">EasyPaisa Account</h2>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {methods?.easypaisa?.enabled ?? true ? 'Active & Instant' : 'Inactive'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
                EasyPaisa
              </span>
            </div>

            <div className="space-y-2 text-xs divide-y divide-light-border dark:divide-[#34322D]">
              <div className="flex items-center justify-between pt-1">
                <span className="text-charcoal-500 dark:text-[#8E8A80]">Account Title:</span>
                <span className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">
                  {methods?.easypaisa?.accountTitle || 'MUHAMMAD ZUBAIR'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-charcoal-500 dark:text-[#8E8A80]">Mobile / Account Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-charcoal-900 dark:text-[#F4F1E9]">
                    {methods?.easypaisa?.accountNumber || '03088666075'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(methods?.easypaisa?.accountNumber || '03088666075', 'easypaisa')}
                    className="p-1 rounded text-charcoal-400 hover:text-[#B89555]"
                    title="Copy EasyPaisa Number"
                  >
                    {copiedKey === 'easypaisa' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 5. SadaPay */}
          <div className="p-6 rounded-2xl bg-white dark:bg-[#191917] border border-light-border dark:border-[#34322D] shadow-sm space-y-4 md:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-base text-charcoal-900 dark:text-[#F4F1E9]">SadaPay Digital Wallet / Card</h2>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {methods?.sadapay?.enabled ?? true ? 'Active & Zero Fee' : 'Inactive'}
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-900">
                SadaPay
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-light-elevated dark:bg-[#22211E]">
                <span className="text-charcoal-500 dark:text-[#8E8A80]">Account Title:</span>
                <span className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">
                  {methods?.sadapay?.accountTitle || 'MUHAMMAD ZUBAIR'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-light-elevated dark:bg-[#22211E]">
                <span className="text-charcoal-500 dark:text-[#8E8A80]">SadaPay Number:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-charcoal-900 dark:text-[#F4F1E9]">
                    {methods?.sadapay?.accountNumber || '03088666075'}
                  </span>
                  <button
                    onClick={() => copyToClipboard(methods?.sadapay?.accountNumber || '03088666075', 'sadapay')}
                    className="p-1 rounded text-charcoal-400 hover:text-[#B89555]"
                    title="Copy SadaPay Number"
                  >
                    {copiedKey === 'sadapay' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Screenshot Upload Instructions Banner */}
        <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
            <Clock className="w-4 h-4" /> Digital Payment Verification Process
          </div>
          <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed font-normal">
            When ordering via Bank Transfer, JazzCash, EasyPaisa, or SadaPay:
          </p>
          <ol className="list-decimal list-inside text-xs text-amber-900/90 dark:text-amber-200/90 space-y-1.5 font-medium pl-1">
            <li>Transfer the order amount to the corresponding account details above.</li>
            <li>Take a clear screenshot showing the Transaction ID, Date, and Transferred Amount.</li>
            <li>Upload the screenshot during checkout before placing your order.</li>
            <li>Our finance team verifies the transaction within 15–30 minutes during business hours.</li>
          </ol>
        </div>

        {/* WhatsApp Assistance Button */}
        <div className="text-center p-8 rounded-2xl bg-white dark:bg-[#191917] border border-light-border dark:border-[#34322D] space-y-4">
          <h3 className="font-bold text-lg text-charcoal-900 dark:text-[#F4F1E9]">
            Need Help or Custom Billing Support?
          </h3>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-[#B8B3A8] max-w-md mx-auto">
            Our customer service team is available 24/7 on WhatsApp for payment verification and order tracking.
          </p>
          <a
            href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent('Hello Amin Raisat Hosiery, I have an inquiry regarding payment methods.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all"
          >
            <WhatsAppIcon size={18} className="text-white fill-current" />
            <span>Chat on WhatsApp ({whatsappNumber})</span>
          </a>
        </div>
      </div>
    </div>
  );
}
