'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { PaymentMethodType } from '@/types';
import {
  ArrowLeft,
  Lock,
  Building2,
  Banknote,
  AlertCircle,
  Zap,
} from 'lucide-react';

const PAKISTAN_PROVINCES = [
  'Punjab',
  'Sindh',
  'Khyber Pakhtunkhwa',
  'Balochistan',
  'Islamabad Capital Territory',
  'Azad Jammu & Kashmir',
  'Gilgit-Baltistan',
];

const POPULAR_CITIES = [
  'Faisalabad',
  'Lahore',
  'Karachi',
  'Rawalpindi',
  'Islamabad',
  'Multan',
  'Gujranwala',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Hyderabad',
  'Bahawalpur',
  'Sargodha',
  'Gujrat',
  'Sheikhupura',
  'Jhang',
  'Rahim Yar Khan',
  'Kasur',
  'Mardan',
  'Sahiwal',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalQuantity, subtotal, deliveryFee, totalAmount, clearCart } = useCart();
  const { settings, createOrder } = useStore();
  const { user, profile, addresses } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    whatsappNumber: '',
    email: '',
    address: '',
    city: 'Lahore',
    customCity: '',
    province: 'Punjab',
    orderNotes: '',
    paymentMethod: 'cod' as PaymentMethodType,
    paymentReference: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Autofill user profile and default saved address if logged in
  useEffect(() => {
    if (user || profile) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      setFormData((prev) => ({
        ...prev,
        fullName: profile?.fullName || prev.fullName,
        phone: profile?.phone || prev.phone,
        whatsappNumber: profile?.whatsappNumber || prev.whatsappNumber,
        email: user?.email || prev.email,
        address: defaultAddr?.streetAddress || prev.address,
        city: defaultAddr?.city || prev.city,
        province: defaultAddr?.province || prev.province,
      }));
    }
  }, [user, profile, addresses]);

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4 bg-dark-bg text-gray-100 min-h-[70vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-100">Your cart is empty</h1>
        <p className="text-xs text-gray-400">Please select items before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold py-3 px-6 rounded-xl shadow-glow-gold"
        >
          <ArrowLeft className="w-4 h-4" /> Explore Shop
        </Link>
      </div>
    );
  }

  const minOrderQty = settings.shipping.minOrderQty || 3;
  if (totalQuantity < minOrderQty) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4 bg-dark-bg text-gray-100 min-h-[70vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-100">Minimum Order Required</h1>
        <p className="text-xs text-gray-400">
          The minimum order quantity is {minOrderQty} pieces. You currently have {totalQuantity} piece{totalQuantity > 1 ? 's' : ''}.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold py-3 px-6 rounded-xl shadow-glow-gold"
        >
          Add More Pieces ({minOrderQty - totalQuantity} needed)
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    const cleanPhone = formData.phone.trim().replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg('Please enter a valid Pakistani mobile number (e.g. 03001234567).');
      return;
    }

    if (!formData.address.trim()) {
      setErrorMsg('Please provide your complete street delivery address.');
      return;
    }

    const finalCity = formData.city === 'Other' ? formData.customCity.trim() : formData.city;
    if (!finalCity) {
      setErrorMsg('Please select or specify your city.');
      return;
    }

    try {
      setIsSubmitting(true);

      const orderPayload = {
        customerName: formData.fullName.trim(),
        customerPhone: formData.phone.trim(),
        customerEmail: formData.email.trim() || undefined,
        address: formData.address.trim(),
        city: finalCity,
        province: formData.province,
        orderNotes: formData.orderNotes.trim() || undefined,
        subtotal,
        deliveryFee,
        totalAmount,
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference.trim() || undefined,
        items: items.map((it) => ({
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          orderId: '',
          productId: it.productId,
          variantId: it.id,
          productName: it.productName,
          quality: it.quality,
          sleeve: it.sleeve,
          size: it.size,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          totalPrice: it.unitPrice * it.quantity,
        })),
      };

      const createdOrder = await createOrder(orderPayload);
      clearCart();
      router.push(`/order-confirmation/${createdOrder.id}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setErrorMsg('Something went wrong placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-12 bg-dark-bg min-h-[85vh] text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
          <Link href="/cart" className="hover:text-gold-400 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
          <span>/</span>
          <span className="font-bold text-gray-200">Express Checkout</span>
        </div>

        <div className="border-b border-dark-border pb-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-100 tracking-tight">
            Checkout &amp; Delivery Details
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {user ? `Logged in as ${user.email}. Address pre-filled.` : 'Guest checkout available. No password required.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Customer & Delivery Info Form */}
            <div className="lg:col-span-7 space-y-6">
              {errorMsg && (
                <div className="p-4 bg-rose-950/60 border border-rose-800/60 text-rose-300 rounded-2xl text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Contact & Name */}
              <div className="bg-dark-surface rounded-2xl p-6 border border-dark-border shadow-card space-y-4">
                <h2 className="text-sm font-bold text-gray-100 flex items-center gap-2 border-b border-dark-border pb-3">
                  <span className="w-5 h-5 rounded-full bg-gold-500 text-black text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  Customer Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Full Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muhammad Usman"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Phone Number (For Rider Call) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="03001234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      WhatsApp Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="03018666075"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address */}
              <div className="bg-dark-surface rounded-2xl p-6 border border-dark-border shadow-card space-y-4">
                <h2 className="text-sm font-bold text-gray-100 flex items-center gap-2 border-b border-dark-border pb-3">
                  <span className="w-5 h-5 rounded-full bg-gold-500 text-black text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Delivery Address (Pakistan)
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Complete Street Address / House / Flat / Plaza <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="House #, Street #, Sector / Colony, Landmark"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      City <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
                    >
                      {POPULAR_CITIES.map((c) => (
                        <option key={c} value={c} className="bg-dark-surface text-gray-100">
                          {c}
                        </option>
                      ))}
                      <option value="Other" className="bg-dark-surface text-gray-100">Other City (Specify below)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Province <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
                    >
                      {PAKISTAN_PROVINCES.map((prov) => (
                        <option key={prov} value={prov} className="bg-dark-surface text-gray-100">
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.city === 'Other' && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-300 mb-1">
                      Enter Your City Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abbottabad"
                      value={formData.customCity}
                      onChange={(e) => setFormData({ ...formData, customCity: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Order Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Call before delivery or leave with security"
                    value={formData.orderNotes}
                    onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="bg-dark-surface rounded-2xl p-6 border border-dark-border shadow-card space-y-4">
                <h2 className="text-sm font-bold text-gray-100 flex items-center gap-2 border-b border-dark-border pb-3">
                  <span className="w-5 h-5 rounded-full bg-gold-500 text-black text-xs flex items-center justify-center font-bold">
                    3
                  </span>
                  Select Payment Method
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* COD */}
                  {(settings.isCodEnabled ?? true) && (
                    <label
                      className={`cursor-pointer p-4 rounded-xl border-2 flex items-start gap-3 transition-all ${
                        formData.paymentMethod === 'cod'
                          ? 'border-gold-500 bg-gold-500/10 shadow-glow-gold'
                          : 'border-dark-border bg-dark-card hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                        className="mt-1 accent-gold-500"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-xs text-gray-100">Cash on Delivery (COD)</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Pay cash to courier rider upon parcel delivery.
                        </p>
                      </div>
                    </label>
                  )}

                  {/* Bank Transfer */}
                  {(settings.isBankTransferEnabled ?? true) && (
                    <label
                      className={`cursor-pointer p-4 rounded-xl border-2 flex items-start gap-3 transition-all ${
                        formData.paymentMethod === 'bank_transfer'
                          ? 'border-gold-500 bg-gold-500/10 shadow-glow-gold'
                          : 'border-dark-border bg-dark-card hover:border-gray-600'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={formData.paymentMethod === 'bank_transfer'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                        className="mt-1 accent-gold-500"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-blue-400" />
                          <span className="font-bold text-xs text-gray-100">Direct Bank Transfer</span>
                        </div>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Transfer via Raast, Meezan or online banking.
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                {/* Bank Details */}
                {formData.paymentMethod === 'bank_transfer' && (settings.isBankTransferEnabled ?? true) && (
                  <div className="p-4 bg-dark-card border border-dark-border rounded-xl text-xs text-gray-200 space-y-2">
                    <p className="font-bold text-gold-400">{settings.bankDetails.bankName} Account Details:</p>
                    <div className="space-y-1 font-mono text-[11px]">
                      <p>• Bank: <strong>{settings.bankDetails.bankName}</strong></p>
                      <p>• Title: <strong>{settings.bankDetails.accountTitle}</strong></p>
                      <p>• Account #: <strong>{settings.bankDetails.accountNumber}</strong></p>
                      {settings.bankDetails.iban && (
                        <p>• IBAN: <strong>{settings.bankDetails.iban}</strong></p>
                      )}
                    </div>
                    {settings.bankDetails.instructions && (
                      <p className="text-[11px] text-gray-400 pt-1">
                        {settings.bankDetails.instructions}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Summary & Place Order Button */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-dark-surface rounded-2xl p-6 border border-dark-border shadow-card space-y-4 sticky top-24">
                <h2 className="text-sm font-bold text-gray-100 border-b border-dark-border pb-3">
                  Order Summary
                </h2>

                {/* Items preview */}
                <div className="space-y-3 divide-y divide-dark-border max-h-72 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-100">{item.productName}</p>
                        <p className="text-[11px] text-gray-400">
                          {item.quality} • {item.sleeve} • Size: {item.size}
                        </p>
                        <p className="text-[11px] text-gray-300 font-medium">
                          Qty: {item.quantity} x Rs. {item.unitPrice}
                        </p>
                      </div>
                      <div className="font-bold text-gold-400">
                        Rs. {item.unitPrice * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing totals */}
                <div className="border-t border-dark-border pt-3 space-y-2 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalQuantity} pieces)</span>
                    <span className="font-semibold text-gray-100">Rs. {subtotal}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-400 font-bold">FREE Delivery ({settings.shipping.freeDeliveryThreshold}+ pcs)</span>
                      ) : (
                        `Rs. ${deliveryFee}`
                      )}
                    </span>
                  </div>
                  <div className="border-t border-dark-border pt-3 flex justify-between text-base font-bold text-gold-400">
                    <span>Total Amount</span>
                    <span>Rs. {totalAmount}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-glow-gold active:scale-[0.99]"
                >
                  <Lock className="w-4 h-4 stroke-[2.2]" />
                  <span>{isSubmitting ? 'Placing Order...' : `Confirm & Place Order • Rs. ${totalAmount}`}</span>
                </button>

                <div className="text-[11px] text-center text-gray-400 pt-1">
                  100% Fine Combed Cotton • Delivered across Pakistan
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
