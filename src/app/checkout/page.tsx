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
  Mail,
  User as UserIcon,
  Phone,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
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
  const {
    items,
    totalQuantity,
    subtotal,
    deliveryFee,
    totalAmount,
    clearCart,
    hasWholesaleItems,
    isWholesaleMinimumMet,
    wholesalePiecesNeeded,
    wholesaleMinQty,
    totalSavings,
  } = useCart();
  const { settings, createOrder } = useStore();
  const { user, profile, addresses, isLoading: authLoading, signIn, signUp } = useAuth();

  // Auth gate state (for unauthenticated customers)
  const [authTab, setAuthTab] = useState<'signup' | 'signin'>('signup');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authShowPassword, setAuthShowPassword] = useState(false);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState('');

  // Checkout Form State
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
        fullName: profile?.fullName || defaultAddr?.fullName || prev.fullName,
        phone: profile?.phone || profile?.whatsappNumber || defaultAddr?.phone || prev.phone,
        whatsappNumber: profile?.whatsappNumber || profile?.phone || prev.whatsappNumber,
        email: user?.email || profile?.email || prev.email,
        address: defaultAddr?.address || defaultAddr?.streetAddress || prev.address,
        city: defaultAddr?.city || prev.city,
        province: defaultAddr?.province || prev.province,
      }));
    }
  }, [user, profile, addresses]);

  // Cart Empty State
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4 bg-light-bg dark:bg-[#11110F] text-charcoal-900 dark:text-[#F4F1E9] min-h-[70vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-charcoal-900 dark:text-[#F4F1E9]">Your cart is empty</h1>
        <p className="text-xs text-charcoal-500 dark:text-[#8E8A80]">Please select items before proceeding to checkout.</p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-champagne-500 hover:bg-champagne-400 text-charcoal-950 text-xs font-bold py-3 px-6 rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Explore Shop
        </Link>
      </div>
    );
  }

  // Wholesale Minimum Check
  if (hasWholesaleItems && !isWholesaleMinimumMet) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4 bg-light-bg dark:bg-[#11110F] text-charcoal-900 dark:text-[#F4F1E9] min-h-[70vh] flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal-900 dark:text-[#F4F1E9]">Wholesale Minimum Not Met</h1>
        <p className="text-xs text-charcoal-600 dark:text-[#8E8A80]">
          Wholesale orders require a minimum of {wholesaleMinQty} pieces. You currently have {totalQuantity} piece{totalQuantity > 1 ? 's' : ''}.
        </p>
        <Link
          href="/wholesale"
          className="inline-flex items-center gap-2 bg-champagne-500 hover:bg-champagne-400 text-charcoal-950 text-xs font-bold py-3 px-6 rounded-xl shadow-xs"
        >
          Add {wholesalePiecesNeeded} More Pieces to Cart
        </Link>
      </div>
    );
  }

  // Retail Minimum Order Check
  const minRetailQty = settings.shipping.minOrderQty || 3;
  if (!hasWholesaleItems && totalQuantity < minRetailQty) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4 bg-light-bg dark:bg-[#11110F] text-charcoal-900 dark:text-[#F4F1E9] min-h-[70vh] flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-charcoal-900 dark:text-[#F4F1E9]">Minimum Order Required</h1>
        <p className="text-xs text-charcoal-600 dark:text-[#8E8A80]">
          The minimum order quantity is {minRetailQty} pieces. You currently have {totalQuantity} piece{totalQuantity > 1 ? 's' : ''}.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 bg-champagne-500 hover:bg-champagne-400 text-charcoal-950 text-xs font-bold py-3 px-6 rounded-xl shadow-xs"
        >
          Add More Pieces ({minRetailQty - totalQuantity} needed)
        </Link>
      </div>
    );
  }

  // Handle Authentication for Unregistered Guests
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);

    try {
      if (authTab === 'signup') {
        if (!authFullName.trim()) {
          setAuthError('Please enter your full name.');
          setAuthSubmitting(false);
          return;
        }
        if (!authPhone.trim() || authPhone.length < 10) {
          setAuthError('Please enter a valid Pakistani mobile number (e.g. 03001234567).');
          setAuthSubmitting(false);
          return;
        }
        if (authPassword.length < 6) {
          setAuthError('Password must be at least 6 characters.');
          setAuthSubmitting(false);
          return;
        }
        if (authPassword !== authConfirmPassword) {
          setAuthError('Passwords do not match.');
          setAuthSubmitting(false);
          return;
        }

        const res = await signUp(authEmail.trim(), authPassword, authFullName.trim(), authPhone.trim());

        if (res?.error) {
          setAuthError(res.error || 'Failed to create account. Please check details.');
          setAuthSubmitting(false);
          return;
        }

        setFormData((prev) => ({
          ...prev,
          fullName: authFullName.trim(),
          phone: authPhone.trim(),
          email: authEmail.trim(),
        }));
      } else {
        const res = await signIn(authEmail.trim(), authPassword);
        if (res?.error) {
          setAuthError(res.error || 'Invalid email or password.');
          setAuthSubmitting(false);
          return;
        }
        setFormData((prev) => ({
          ...prev,
          email: authEmail.trim(),
        }));
      }
    } catch (err: any) {
      setAuthError('Authentication failed. Please try again.');
    } finally {
      setAuthSubmitting(false);
    }
  };

  // STEP 1: AUTH GATE (If not signed in, prompt clean Sign In / Register)
  if (!user && !authLoading) {
    return (
      <div className="py-12 bg-light-bg dark:bg-[#11110F] min-h-[85vh] text-charcoal-900 dark:text-[#F4F1E9] transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-charcoal-500 dark:text-[#8E8A80] mb-6">
            <Link href="/cart" className="hover:text-[#B89555] dark:hover:text-[#C9A96A] flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
            </Link>
            <span>/</span>
            <span className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">Account Verification</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Auth Form Card */}
            <div className="lg:col-span-7 bg-white dark:bg-[#191917] p-6 sm:p-8 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-bold text-[#B89555] dark:text-[#C9A96A] uppercase tracking-widest block">
                  Step 1 of 2
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-[#F4F1E9] mt-1 tracking-tight">
                  Sign in or register to checkout
                </h1>
                <p className="text-xs text-charcoal-600 dark:text-[#8E8A80] mt-1.5 leading-relaxed">
                  Your cart items and selected sizes are securely saved. Complete this quick step to proceed with delivery.
                </p>
              </div>

              {/* Two Clear Options */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-light-elevated dark:bg-[#22211E] rounded-xl border border-light-border dark:border-[#34322D]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('signup');
                    setAuthError('');
                  }}
                  className={`py-2.5 text-xs font-bold rounded-lg transition-all ${
                    authTab === 'signup'
                      ? 'bg-champagne-500 text-charcoal-950 shadow-xs'
                      : 'text-charcoal-600 dark:text-[#8E8A80] hover:text-charcoal-900 dark:hover:text-[#F4F1E9]'
                  }`}
                >
                  Create Account
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('signin');
                    setAuthError('');
                  }}
                  className={`py-2.5 text-xs font-bold rounded-lg transition-all ${
                    authTab === 'signin'
                      ? 'bg-champagne-500 text-charcoal-950 shadow-xs'
                      : 'text-charcoal-600 dark:text-[#8E8A80] hover:text-charcoal-900 dark:hover:text-[#F4F1E9]'
                  }`}
                >
                  Sign In
                </button>
              </div>

              {authError && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {authTab === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={authFullName}
                        onChange={(e) => setAuthFullName(e.target.value)}
                        placeholder="e.g. Muhammad Usman"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-900 dark:text-[#F4F1E9] placeholder-charcoal-400 dark:placeholder-[#8E8A80] focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A]"
                      />
                      <UserIcon className="w-4 h-4 text-charcoal-400 dark:text-[#8E8A80] absolute left-3.5 top-3" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-900 dark:text-[#F4F1E9] placeholder-charcoal-400 dark:placeholder-[#8E8A80] focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A]"
                    />
                    <Mail className="w-4 h-4 text-charcoal-400 dark:text-[#8E8A80] absolute left-3.5 top-3" />
                  </div>
                </div>

                {authTab === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                      Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={authPhone}
                        onChange={(e) => setAuthPhone(e.target.value)}
                        placeholder="03001234567"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-900 dark:text-[#F4F1E9] placeholder-charcoal-400 dark:placeholder-[#8E8A80] focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A]"
                      />
                      <Phone className="w-4 h-4 text-charcoal-400 dark:text-[#8E8A80] absolute left-3.5 top-3" />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={authShowPassword ? 'text' : 'password'}
                      required
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-white dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-900 dark:text-[#F4F1E9] placeholder-charcoal-400 dark:placeholder-[#8E8A80] focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A]"
                    />
                    <Lock className="w-4 h-4 text-charcoal-400 dark:text-[#8E8A80] absolute left-3.5 top-3" />
                    <button
                      type="button"
                      onClick={() => setAuthShowPassword(!authShowPassword)}
                      className="absolute right-3.5 top-3 text-charcoal-400 dark:text-[#8E8A80] hover:text-charcoal-900 dark:hover:text-[#F4F1E9]"
                    >
                      {authShowPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {authTab === 'signup' && (
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={authShowPassword ? 'text' : 'password'}
                        required
                        value={authConfirmPassword}
                        onChange={(e) => setAuthConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-900 dark:text-[#F4F1E9] placeholder-charcoal-400 dark:placeholder-[#8E8A80] focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A]"
                      />
                      <Lock className="w-4 h-4 text-charcoal-400 dark:text-[#8E8A80] absolute left-3.5 top-3" />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full mt-2 py-3 px-4 bg-champagne-500 hover:bg-champagne-400 disabled:opacity-50 text-charcoal-950 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>
                    {authSubmitting
                      ? 'Please wait...'
                      : authTab === 'signup'
                      ? 'Register & Continue to Delivery'
                      : 'Sign In & Continue to Delivery'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Right: Cart Summary Sidebar */}
            <div className="lg:col-span-5 bg-white dark:bg-[#191917] p-6 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-charcoal-900 dark:text-[#F4F1E9] border-b border-light-border dark:border-[#34322D] pb-3">
                Order Summary ({totalQuantity} pieces)
              </h3>

              <div className="space-y-3 divide-y divide-light-border dark:divide-[#34322D] max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">{item.productName}</p>
                      <p className="text-[11px] text-charcoal-500 dark:text-[#8E8A80]">
                        {item.isWholesale && (
                          <span className="font-bold text-[#B89555] dark:text-[#C9A96A] mr-1">[Wholesale]</span>
                        )}
                        {item.quality} • {item.sleeve} • Size: {item.size}
                      </p>
                      <p className="text-[11px] text-charcoal-600 dark:text-[#B8B3A8] font-medium">
                        Qty: {item.quantity} x Rs. {item.unitPrice}
                      </p>
                    </div>
                    <div className="font-bold text-[#B89555] dark:text-[#C9A96A]">
                      Rs. {item.unitPrice * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-light-border dark:border-[#34322D] pt-3 space-y-2 text-xs text-charcoal-600 dark:text-[#B8B3A8]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-charcoal-900 dark:text-[#F4F1E9]">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Delivery</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">FREE Delivery</span>
                    ) : (
                      `Rs. ${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="border-t border-light-border dark:border-[#34322D] pt-2 flex justify-between text-base font-bold text-[#B89555] dark:text-[#C9A96A]">
                  <span>Total Payable</span>
                  <span>Rs. {totalAmount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // STEP 2: AUTHENTICATED CHECKOUT & DELIVERY FORM
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
        userId: user?.id || undefined,
        customerName: formData.fullName.trim(),
        customerPhone: formData.phone.trim(),
        customerEmail: user?.email || formData.email.trim() || undefined,
        address: formData.address.trim(),
        city: finalCity,
        province: formData.province,
        orderNotes: formData.orderNotes.trim() || undefined,
        subtotal,
        deliveryFee,
        totalAmount,
        paymentMethod: formData.paymentMethod,
        paymentReference: formData.paymentReference.trim() || undefined,
        isWholesale: hasWholesaleItems,
        wholesaleDiscount: totalSavings,
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
          regularPrice: it.regularPrice || it.unitPrice,
          wholesalePrice: it.wholesalePrice,
          isWholesale: it.isWholesale,
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
    <div className="py-12 bg-light-bg dark:bg-[#11110F] min-h-[85vh] text-charcoal-900 dark:text-[#F4F1E9] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 text-xs text-charcoal-500 dark:text-[#8E8A80] mb-6">
          <Link href="/cart" className="hover:text-[#B89555] dark:hover:text-[#C9A96A] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cart
          </Link>
          <span>/</span>
          <span className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">Express Checkout</span>
        </div>

        <div className="border-b border-light-border dark:border-[#34322D] pb-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 dark:text-[#F4F1E9] tracking-tight">
                  Checkout &amp; Delivery Details
                </h1>
                {hasWholesaleItems && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-champagne-100 dark:bg-[#22211E] text-[#96763D] dark:text-[#C9A96A] border border-[#B89555]/30 text-xs font-bold">
                    Wholesale Order
                  </span>
                )}
              </div>
              <p className="text-xs text-charcoal-600 dark:text-[#8E8A80] mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Logged in as <strong className="text-[#B89555] dark:text-[#C9A96A]">{user?.email || profile?.email}</strong>. Saved address details auto-applied.</span>
              </p>
            </div>
            <Link
              href="/account"
              className="text-xs text-[#B89555] dark:text-[#C9A96A] hover:underline font-semibold"
            >
              Manage Saved Addresses →
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Customer & Delivery Info Form */}
            <div className="lg:col-span-7 space-y-6">
              {errorMsg && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-2xl text-xs flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Contact & Name */}
              <div className="bg-white dark:bg-[#191917] rounded-2xl p-6 border border-light-border dark:border-[#34322D] shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-charcoal-900 dark:text-[#F4F1E9] flex items-center gap-2 border-b border-light-border dark:border-[#34322D] pb-3">
                  <span className="w-5 h-5 rounded-full bg-champagne-500 text-charcoal-950 text-xs flex items-center justify-center font-bold">
                    1
                  </span>
                  Customer Information
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Muhammad Usman"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-900 dark:text-[#F4F1E9] placeholder-charcoal-400 dark:placeholder-[#8E8A80] focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                      Phone Number (For Courier Call) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="03001234567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-900 dark:text-[#F4F1E9] placeholder-charcoal-400 dark:placeholder-[#8E8A80] focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                      WhatsApp Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="03018666075"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-900 dark:text-[#F4F1E9] placeholder-charcoal-400 dark:placeholder-[#8E8A80] focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                      Account Email Address
                    </label>
                    <input
                      type="email"
                      readOnly
                      value={formData.email}
                      className="w-full px-3.5 py-2.5 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-500 dark:text-[#8E8A80] cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Shipping Address */}
              <div className="bg-white dark:bg-[#191917] rounded-2xl p-6 border border-light-border dark:border-[#34322D] shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-charcoal-900 dark:text-[#F4F1E9] flex items-center gap-2 border-b border-light-border dark:border-[#34322D] pb-3">
                  <span className="w-5 h-5 rounded-full bg-champagne-500 text-charcoal-950 text-xs flex items-center justify-center font-bold">
                    2
                  </span>
                  Delivery Address (Pakistan)
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                    Complete Street Address / House / Flat / Plaza <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="House #, Street #, Sector / Colony, Landmark"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-900 dark:text-[#F4F1E9] placeholder-charcoal-400 dark:placeholder-[#8E8A80] focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                      City <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-900 dark:text-[#F4F1E9] focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A]"
                    >
                      {POPULAR_CITIES.map((c) => (
                        <option key={c} value={c} className="bg-white dark:bg-[#191917] text-charcoal-900 dark:text-[#F4F1E9]">
                          {c}
                        </option>
                      ))}
                      <option value="Other" className="bg-white dark:bg-[#191917] text-charcoal-900 dark:text-[#F4F1E9]">Other City (Specify below)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                      Province <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-900 dark:text-[#F4F1E9] focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A]"
                    >
                      {PAKISTAN_PROVINCES.map((prov) => (
                        <option key={prov} value={prov} className="bg-white dark:bg-[#191917] text-charcoal-900 dark:text-[#F4F1E9]">
                          {prov}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formData.city === 'Other' && (
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                      Enter Your City Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Abbottabad"
                      value={formData.customCity}
                      onChange={(e) => setFormData({ ...formData, customCity: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-900 dark:text-[#F4F1E9] placeholder-charcoal-400 dark:placeholder-[#8E8A80] focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A]"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B8B3A8] mb-1">
                    Order Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Call before delivery or leave with security"
                    value={formData.orderNotes}
                    onChange={(e) => setFormData({ ...formData, orderNotes: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-charcoal-900 dark:text-[#F4F1E9] placeholder-charcoal-400 dark:placeholder-[#8E8A80] focus:outline-none focus:border-[#B89555] dark:focus:border-[#C9A96A]"
                  />
                </div>
              </div>

              {/* 3. Payment Method */}
              <div className="bg-white dark:bg-[#191917] rounded-2xl p-6 border border-light-border dark:border-[#34322D] shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-charcoal-900 dark:text-[#F4F1E9] flex items-center gap-2 border-b border-light-border dark:border-[#34322D] pb-3">
                  <span className="w-5 h-5 rounded-full bg-champagne-500 text-charcoal-950 text-xs flex items-center justify-center font-bold">
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
                          ? 'border-[#B89555] dark:border-[#C9A96A] bg-champagne-50/70 dark:bg-[#22211E] shadow-xs'
                          : 'border-light-border dark:border-[#34322D] bg-white dark:bg-[#191917] hover:border-light-border'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                        className="mt-1 accent-[#B89555]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Banknote className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span className="font-bold text-xs text-charcoal-900 dark:text-[#F4F1E9]">Cash on Delivery (COD)</span>
                        </div>
                        <p className="text-[11px] text-charcoal-500 dark:text-[#8E8A80] mt-0.5">
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
                          ? 'border-[#B89555] dark:border-[#C9A96A] bg-champagne-50/70 dark:bg-[#22211E] shadow-xs'
                          : 'border-light-border dark:border-[#34322D] bg-white dark:bg-[#191917] hover:border-light-border'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={formData.paymentMethod === 'bank_transfer'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'bank_transfer' })}
                        className="mt-1 accent-[#B89555]"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span className="font-bold text-xs text-charcoal-900 dark:text-[#F4F1E9]">Direct Bank Transfer</span>
                        </div>
                        <p className="text-[11px] text-charcoal-500 dark:text-[#8E8A80] mt-0.5">
                          Transfer via Raast, Meezan or online banking.
                        </p>
                      </div>
                    </label>
                  )}
                </div>

                {/* Bank Details */}
                {formData.paymentMethod === 'bank_transfer' && (settings.isBankTransferEnabled ?? true) && (
                  <div className="p-4 bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] rounded-xl text-xs text-charcoal-900 dark:text-[#F4F1E9] space-y-2">
                    <p className="font-bold text-[#B89555] dark:text-[#C9A96A]">{settings.bankDetails.bankName} Account Details:</p>
                    <div className="space-y-1 font-mono text-[11px] text-charcoal-700 dark:text-[#B8B3A8]">
                      <p>• Bank: <strong className="text-charcoal-900 dark:text-[#F4F1E9]">{settings.bankDetails.bankName}</strong></p>
                      <p>• Title: <strong className="text-charcoal-900 dark:text-[#F4F1E9]">{settings.bankDetails.accountTitle}</strong></p>
                      <p>• Account #: <strong className="text-charcoal-900 dark:text-[#F4F1E9]">{settings.bankDetails.accountNumber}</strong></p>
                      {settings.bankDetails.iban && (
                        <p>• IBAN: <strong className="text-charcoal-900 dark:text-[#F4F1E9]">{settings.bankDetails.iban}</strong></p>
                      )}
                    </div>
                    {settings.bankDetails.instructions && (
                      <p className="text-[11px] text-charcoal-500 dark:text-[#8E8A80] pt-1">
                        {settings.bankDetails.instructions}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Order Summary & Place Order Button */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white dark:bg-[#191917] rounded-2xl p-6 border border-light-border dark:border-[#34322D] shadow-sm space-y-4 sticky top-24">
                <h2 className="text-sm font-bold text-charcoal-900 dark:text-[#F4F1E9] border-b border-light-border dark:border-[#34322D] pb-3">
                  Order Summary
                </h2>

                {/* Items preview */}
                <div className="space-y-3 divide-y divide-light-border dark:divide-[#34322D] max-h-72 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="pt-3 first:pt-0 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">{item.productName}</p>
                        <p className="text-[11px] text-charcoal-500 dark:text-[#8E8A80]">
                          {item.isWholesale && (
                            <span className="font-bold text-[#B89555] dark:text-[#C9A96A] mr-1">[Wholesale]</span>
                          )}
                          {item.quality} • {item.sleeve} • Size: {item.size}
                        </p>
                        <p className="text-[11px] text-charcoal-600 dark:text-[#B8B3A8] font-medium">
                          Qty: {item.quantity} x Rs. {item.unitPrice}
                        </p>
                      </div>
                      <div className="font-bold text-[#B89555] dark:text-[#C9A96A]">
                        Rs. {item.unitPrice * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pricing totals */}
                <div className="border-t border-light-border dark:border-[#34322D] pt-3 space-y-2 text-xs text-charcoal-600 dark:text-[#B8B3A8]">
                  <div className="flex justify-between">
                    <span>Subtotal ({totalQuantity} pieces)</span>
                    <span className="font-semibold text-charcoal-900 dark:text-[#F4F1E9]">Rs. {subtotal}</span>
                  </div>

                  {totalSavings > 0 && (
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-semibold">
                      <span>Wholesale Savings</span>
                      <span>- Rs. {totalSavings}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span>Delivery Fee</span>
                    <span className="font-semibold">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold">FREE Delivery</span>
                      ) : (
                        `Rs. ${deliveryFee}`
                      )}
                    </span>
                  </div>
                  <div className="border-t border-light-border dark:border-[#34322D] pt-3 flex justify-between text-base font-bold text-[#B89555] dark:text-[#C9A96A]">
                    <span>Total Amount</span>
                    <span>Rs. {totalAmount}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-champagne-500 hover:bg-champagne-400 disabled:opacity-50 text-charcoal-950 font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
                >
                  <Lock className="w-4 h-4 stroke-[2.2]" />
                  <span>{isSubmitting ? 'Placing Order...' : `Confirm & Place Order • Rs. ${totalAmount}`}</span>
                </button>

                <div className="text-[11px] text-center text-charcoal-500 dark:text-[#8E8A80] pt-1">
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
