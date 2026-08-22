'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { ChevronRight, Phone, Mail, Check, Send } from 'lucide-react';
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
    <div className="min-h-[75vh] py-10 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-gray-900">
            Home
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="font-semibold text-gray-900">Contact Us</span>
        </div>

        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest block">
            Direct Communication
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-950 mt-1">
            Get in Touch
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
            Have a question about fabric sizing, bulk orders, or tracking your delivery? We are ready to help.
          </p>
        </div>

        {/* 2-Column Layout: Contact Cards + Contact Form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Column: Direct Info */}
          <div className="md:col-span-5 space-y-4">
            {/* WhatsApp Card with Official WhatsAppIcon */}
            <div className="p-5 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#25D366] text-white flex items-center justify-center">
                  <WhatsAppIcon size={20} className="text-white fill-current" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-950">WhatsApp (Fastest)</h3>
                  <p className="text-xs text-gray-600">{settings.whatsapp}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                Direct chat with owner Muhammad Amin for immediate order assistance and sizing recommendations.
              </p>
              <a
                href={`https://wa.me/92${settings.whatsapp.replace(/^0/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:underline pt-1"
              >
                <span>Open WhatsApp Chat</span>
                <span>→</span>
              </a>
            </div>

            {/* Phone Card */}
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-950">Direct Phone Call</h3>
                  <p className="text-xs text-gray-600">{settings.phone}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed font-normal">
                Available daily for customer inquiries across all cities of Pakistan.
              </p>
            </div>

            {/* Email Card */}
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-900 text-white flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-950">Email Support</h3>
                  <p className="text-xs text-gray-600 truncate">{settings.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Message Form */}
          <div className="md:col-span-7 bg-gray-50/70 p-6 sm:p-8 rounded-xl border border-gray-200 space-y-4">
            <h2 className="text-base font-bold text-gray-950">Send an Inquiry</h2>
            <p className="text-xs text-gray-600">
              Fill in your details below and your message will be pre-filled to our WhatsApp for instant response.
            </p>

            {isSent ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-center space-y-2">
                <Check className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold">Message Ready on WhatsApp!</p>
                <p className="text-[11px]">We look forward to assisting you.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-gray-800 mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Muhammad Usman"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-1">Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="03001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-1">Your Message or Inquiry *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="What would you like to ask about our vests, sizes, or delivery?"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs"
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
