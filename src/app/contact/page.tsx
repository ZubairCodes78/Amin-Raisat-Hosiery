'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ChevronRight, Phone, Mail, Check } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

export default function ContactPage() {
  const { settings } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    // Send via WhatsApp direct link
    const text = `Assalam-o-Alaikum Amin Raisat Hosiery,\nName: ${name}\nPhone: ${phone}\nMessage: ${message}`;
    const url = `https://wa.me/92${settings.whatsapp.replace(/^0/, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');

    setIsSent(true);
    setTimeout(() => {
      setIsSent(false);
      setName('');
      setPhone('');
      setMessage('');
    }, 2500);
  };

  return (
    <div className="min-h-[85vh] py-12 bg-dark-bg text-gray-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-gold-400 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-600" />
          <span className="font-semibold text-gray-200">Contact Us</span>
        </div>

        {/* Header */}
        <div className="border-b border-dark-border pb-6 mb-8">
          <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest block">
            Direct Communication
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-100 mt-1 tracking-tight">
            Get in Touch
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 leading-relaxed">
            Have a question about fabric sizing, bulk orders, or tracking your delivery? We are available to help.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info */}
          <div className="md:col-span-5 space-y-4">
            {/* WhatsApp Card */}
            <div className="p-6 bg-dark-surface rounded-2xl border border-dark-border shadow-card space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-glow-whatsapp">
                  <WhatsAppIcon size={20} className="text-white fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-100">WhatsApp (Fastest)</h3>
                  <p className="text-xs text-gold-400 font-bold">{settings.whatsapp}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-normal">
                Direct chat with owner Muhammad Amin for immediate order assistance and sizing recommendations.
              </p>
              <a
                href={`https://wa.me/92${settings.whatsapp.replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline pt-1"
              >
                <span>Open WhatsApp Chat →</span>
              </a>
            </div>

            {/* Phone Card */}
            <div className="p-6 bg-dark-surface rounded-2xl border border-dark-border shadow-card space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dark-card border border-dark-border text-gold-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-100">Direct Phone Call</h3>
                  <p className="text-xs text-gray-300 font-bold">{settings.phone}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-normal">
                Available daily for customer inquiries across all cities of Pakistan.
              </p>
            </div>

            {/* Email Card */}
            <div className="p-6 bg-dark-surface rounded-2xl border border-dark-border shadow-card space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-dark-card border border-dark-border text-gold-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-100">Email Support</h3>
                  <p className="text-xs text-gray-400 truncate">{settings.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Message Form */}
          <div className="md:col-span-7 bg-dark-surface p-6 sm:p-8 rounded-2xl border border-dark-border shadow-card space-y-4">
            <h2 className="text-base font-bold text-gray-100">Send an Instant Inquiry</h2>
            <p className="text-xs text-gray-400">
              Fill in your details below and your message will be forwarded to our WhatsApp for quick response.
            </p>

            {isSent ? (
              <div className="p-6 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 rounded-xl text-center space-y-2">
                <Check className="w-6 h-6 text-emerald-400 mx-auto" />
                <p className="text-xs font-bold">Message Ready on WhatsApp!</p>
                <p className="text-[11px]">We look forward to assisting you.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Usman"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="03001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Your Message or Inquiry *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="What would you like to ask about our vests, sizes, or delivery?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl focus:outline-none focus:border-gold-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-glow-whatsapp"
                >
                  <WhatsAppIcon size={18} className="text-white fill-current" />
                  <span>Send Message via WhatsApp</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
