'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { CustomerAddress } from '@/types';
import {
  User,
  MapPin,
  Package,
  LogOut,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Home,
  Briefcase,
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

export default function AccountPage() {
  const router = useRouter();
  const { user, profile, addresses, signOut, updateProfile, saveAddress, deleteAddress, isLoading } = useAuth();
  const { orders } = useStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');

  // Profile Edit State
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.whatsappNumber || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  // Address Modal / Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addrType, setAddrType] = useState<'shipping' | 'billing'>('shipping');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [province, setProvince] = useState('Punjab');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrError, setAddrError] = useState('');

  // Sync profile fields on load
  React.useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setWhatsappNumber(profile.whatsappNumber || '');
    }
  }, [profile]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-light-bg dark:bg-[#101114] text-charcoal-900 dark:text-[#F1F0EC]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-3 border-[#C9A96A] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-charcoal-500 dark:text-[#85888E]">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center py-16 px-4 bg-light-bg dark:bg-[#101114] text-charcoal-900 dark:text-[#F1F0EC] text-center space-y-4 transition-colors duration-200">
        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-[#17191D] border border-light-border dark:border-[#30343A] flex items-center justify-center text-[#A07D38] dark:text-[#C9A96A] mx-auto shadow-sm">
          <User className="w-7 h-7 stroke-[1.8]" />
        </div>
        <h1 className="text-2xl font-extrabold text-charcoal-900 dark:text-[#F1F0EC]">Customer Sign In Required</h1>
        <p className="text-xs text-charcoal-600 dark:text-[#85888E] max-w-sm">
          Please sign in or create an account to view your saved addresses and order history.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/login?redirect=/account"
            className="py-2.5 px-6 bg-champagne-500 hover:bg-champagne-400 text-black font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/signup?redirect=/account"
            className="py-2.5 px-6 bg-white dark:bg-[#17191D] hover:bg-light-hover dark:hover:bg-[#202329] text-charcoal-900 dark:text-[#F1F0EC] border border-light-border dark:border-[#30343A] font-bold text-xs rounded-xl transition-colors"
          >
            Register Account
          </Link>
        </div>
      </div>
    );
  }

  // Filter orders matching this customer's user ID, email, or phone
  const customerOrders = orders.filter(
    (o) =>
      (user?.id && o.userId === user.id) ||
      (user?.email && o.customerEmail?.toLowerCase() === user.email.toLowerCase()) ||
      (profile?.phone && o.customerPhone === profile.phone)
  );

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileMessage('');
    setProfileError('');

    try {
      const { error } = await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        whatsappNumber: whatsappNumber.trim() || undefined,
      });

      if (error) {
        setProfileError(error);
      } else {
        setProfileMessage('Profile updated successfully!');
        setTimeout(() => setProfileMessage(''), 3000);
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddrError('');
    if (!streetAddress.trim() || !city.trim()) {
      setAddrError('Please fill in your street address and city.');
      return;
    }

    try {
      setAddrLoading(true);
      const res = await saveAddress({
        addressType: addrType,
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        province: province,
        postalCode: postalCode.trim() || undefined,
        country: 'Pakistan',
        isDefault: isDefault,
      });

      if (res.error) {
        setAddrError(res.error);
      } else {
        setIsAddingAddress(false);
        setStreetAddress('');
        setPostalCode('');
      }
    } finally {
      setAddrLoading(false);
    }
  };

  return (
    <div className="py-12 bg-light-bg dark:bg-[#101114] min-h-[85vh] text-charcoal-900 dark:text-[#F1F0EC] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#17191D] p-6 rounded-2xl border border-light-border dark:border-[#30343A] shadow-sm dark:shadow-card">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-champagne-100 dark:bg-[#1D2025] border border-champagne-300 dark:border-[#30343A] flex items-center justify-center text-[#A07D38] dark:text-[#C9A96A] font-extrabold text-lg">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h1 className="text-xl font-bold text-charcoal-900 dark:text-[#F1F0EC]">{profile?.fullName || 'Valued Customer'}</h1>
              <p className="text-xs text-charcoal-500 dark:text-[#85888E]">{user.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="self-start sm:self-auto py-2 px-4 rounded-xl border border-rose-200 dark:border-[#D96B6B]/30 text-rose-600 dark:text-[#D96B6B] hover:bg-rose-50 dark:hover:bg-[#D96B6B]/10 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-light-border dark:border-[#30343A] pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-champagne-500 text-black shadow-xs'
                : 'text-charcoal-600 dark:text-[#85888E] hover:text-charcoal-900 dark:hover:text-[#F1F0EC] bg-white dark:bg-[#17191D] border border-light-border dark:border-[#30343A]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Account Profile</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'addresses'
                ? 'bg-champagne-500 text-black shadow-xs'
                : 'text-charcoal-600 dark:text-[#85888E] hover:text-charcoal-900 dark:hover:text-[#F1F0EC] bg-white dark:bg-[#17191D] border border-light-border dark:border-[#30343A]'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Delivery Addresses ({addresses.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'bg-champagne-500 text-black shadow-xs'
                : 'text-charcoal-600 dark:text-[#85888E] hover:text-charcoal-900 dark:hover:text-[#F1F0EC] bg-white dark:bg-[#17191D] border border-light-border dark:border-[#30343A]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Orders ({customerOrders.length})</span>
          </button>
        </div>

        {/* TAB 1: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white dark:bg-[#17191D] rounded-2xl p-6 border border-light-border dark:border-[#30343A] shadow-sm dark:shadow-card space-y-4">
            <h2 className="text-base font-bold text-charcoal-900 dark:text-[#F1F0EC] border-b border-light-border dark:border-[#30343A] pb-3">
              Personal Information
            </h2>

            {profileMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{profileMessage}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3 bg-rose-50 dark:bg-[#D96B6B]/15 border border-rose-200 dark:border-[#D96B6B]/30 text-rose-700 dark:text-[#D96B6B] rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-charcoal-700 dark:text-[#B4B5BA] mb-1">Account Email</label>
                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full px-3.5 py-2.5 bg-light-elevated dark:bg-[#202329] border border-light-border dark:border-[#30343A] text-charcoal-500 dark:text-[#85888E] rounded-xl cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-semibold text-charcoal-700 dark:text-[#B4B5BA] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] text-charcoal-900 dark:text-[#F1F0EC] rounded-xl focus:outline-none focus:border-[#C9A96A]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-[#B4B5BA] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="03001234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] text-charcoal-900 dark:text-[#F1F0EC] rounded-xl focus:outline-none focus:border-[#C9A96A]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-charcoal-700 dark:text-[#B4B5BA] mb-1">WhatsApp Number</label>
                  <input
                    type="tel"
                    placeholder="03018666075"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] text-charcoal-900 dark:text-[#F1F0EC] rounded-xl focus:outline-none focus:border-[#C9A96A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="py-2.5 px-6 bg-champagne-500 hover:bg-champagne-400 text-black font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {isUpdatingProfile ? 'Saving...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-charcoal-900 dark:text-[#F1F0EC]">Saved Delivery Addresses</h2>
              <button
                type="button"
                onClick={() => setIsAddingAddress(true)}
                className="py-2.5 px-4 bg-champagne-500 hover:bg-champagne-400 text-black font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Address</span>
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-8 bg-white dark:bg-[#17191D] rounded-2xl border border-light-border dark:border-[#30343A] text-center space-y-3">
                <MapPin className="w-8 h-8 text-charcoal-400 dark:text-[#85888E] mx-auto" />
                <h3 className="font-bold text-charcoal-900 dark:text-[#F1F0EC] text-sm">No saved addresses yet</h3>
                <p className="text-xs text-charcoal-500 dark:text-[#85888E]">
                  Save your address to avoid typing it during your next garment order.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 bg-white dark:bg-[#17191D] rounded-2xl border border-light-border dark:border-[#30343A] shadow-sm dark:shadow-card space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-light-elevated dark:bg-[#1D2025] rounded-lg border border-light-border dark:border-[#30343A] text-[#A07D38] dark:text-[#C9A96A]">
                            {addr.addressType === 'shipping' ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                          </span>
                          <span className="font-bold text-xs text-charcoal-900 dark:text-[#F1F0EC] capitalize">
                            {addr.addressType} Address
                          </span>
                        </div>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold bg-champagne-500 text-black px-2 py-0.5 rounded-md">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-charcoal-900 dark:text-[#F1F0EC] leading-relaxed font-medium">
                        {addr.streetAddress || addr.address}
                      </p>
                      <p className="text-xs text-charcoal-500 dark:text-[#85888E] mt-0.5">
                        {addr.city}, {addr.province} {addr.postalCode ? `• ${addr.postalCode}` : ''}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-light-border dark:border-[#30343A] flex justify-end">
                      <button
                        type="button"
                        onClick={() => deleteAddress(addr.id)}
                        className="text-xs text-rose-600 dark:text-[#D96B6B] hover:text-rose-700 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Address Modal */}
            {isAddingAddress && (
              <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white dark:bg-[#17191D] rounded-2xl p-6 max-w-md w-full shadow-elevation border border-light-border dark:border-[#30343A] space-y-4 text-charcoal-900 dark:text-[#F1F0EC]">
                  <h3 className="font-bold text-charcoal-900 dark:text-[#F1F0EC] text-base border-b border-light-border dark:border-[#30343A] pb-3">
                    Add New Address
                  </h3>

                  {addrError && (
                    <div className="p-3 bg-rose-50 dark:bg-[#D96B6B]/15 border border-rose-200 dark:border-[#D96B6B]/30 text-rose-700 dark:text-[#D96B6B] rounded-xl text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{addrError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-charcoal-700 dark:text-[#B4B5BA] font-semibold mb-1">Address Type</label>
                      <select
                        value={addrType}
                        onChange={(e) => setAddrType(e.target.value as 'shipping' | 'billing')}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] text-charcoal-900 dark:text-[#F1F0EC] rounded-xl focus:outline-none focus:border-[#C9A96A]"
                      >
                        <option value="shipping">Shipping Address (Home / Office)</option>
                        <option value="billing">Billing Address</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-charcoal-700 dark:text-[#B4B5BA] font-semibold mb-1">Street Address *</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="House #, Street #, Sector / Landmark"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] text-charcoal-900 dark:text-[#F1F0EC] placeholder-charcoal-400 dark:placeholder-[#85888E] rounded-xl focus:outline-none focus:border-[#C9A96A]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-charcoal-700 dark:text-[#B4B5BA] font-semibold mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] text-charcoal-900 dark:text-[#F1F0EC] rounded-xl focus:outline-none focus:border-[#C9A96A]"
                        />
                      </div>

                      <div>
                        <label className="block text-charcoal-700 dark:text-[#B4B5BA] font-semibold mb-1">Province *</label>
                        <select
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] text-charcoal-900 dark:text-[#F1F0EC] rounded-xl focus:outline-none focus:border-[#C9A96A]"
                        >
                          {PAKISTAN_PROVINCES.map((prov) => (
                            <option key={prov} value={prov}>
                              {prov}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="accent-[#C9A96A] w-4 h-4 rounded"
                      />
                      <label htmlFor="isDefault" className="text-charcoal-700 dark:text-[#B4B5BA] font-medium cursor-pointer">
                        Set as default address
                      </label>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3 border-t border-light-border dark:border-[#30343A]">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="py-2.5 px-4 bg-light-elevated dark:bg-[#202329] text-charcoal-600 dark:text-[#85888E] hover:text-charcoal-900 dark:hover:text-[#F1F0EC] rounded-xl font-semibold border border-light-border dark:border-[#30343A]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={addrLoading}
                        className="py-2.5 px-5 bg-champagne-500 text-black rounded-xl font-bold hover:bg-champagne-400"
                      >
                        {addrLoading ? 'Saving...' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Order History */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-charcoal-900 dark:text-[#F1F0EC]">Order History</h2>
            {customerOrders.length === 0 ? (
              <div className="p-8 bg-white dark:bg-[#17191D] rounded-2xl border border-light-border dark:border-[#30343A] text-center space-y-3">
                <Package className="w-8 h-8 text-charcoal-400 dark:text-[#85888E] mx-auto" />
                <h3 className="font-bold text-charcoal-900 dark:text-[#F1F0EC] text-sm">No orders found</h3>
                <p className="text-xs text-charcoal-500 dark:text-[#85888E]">
                  Any orders placed using this account will be listed here with tracking and line-item details.
                </p>
                <div className="pt-2 flex items-center justify-center gap-2">
                  <Link
                    href="/shop"
                    className="py-2.5 px-5 bg-champagne-500 hover:bg-champagne-400 text-black font-bold text-xs rounded-xl shadow-xs"
                  >
                    Start Shopping
                  </Link>
                  <Link
                    href="/wholesale"
                    className="py-2.5 px-5 bg-light-elevated dark:bg-[#1D2025] hover:bg-light-hover dark:hover:bg-[#202329] text-charcoal-900 dark:text-gray-100 border border-light-border dark:border-[#30343A] font-bold text-xs rounded-xl shadow-xs"
                  >
                    Wholesale Catalog
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-white dark:bg-[#17191D] rounded-2xl p-6 border border-light-border dark:border-[#30343A] shadow-sm dark:shadow-card space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-light-border dark:border-[#30343A] pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#A07D38] dark:text-[#C9A96A] font-mono">
                          Order #{ord.orderNumber}
                        </span>
                        {ord.isWholesale && (
                          <span className="text-[10px] font-bold bg-champagne-100 dark:bg-[#22211E] text-[#96763D] dark:text-[#C9A96A] border border-[#B89555]/30 px-2 py-0.5 rounded uppercase tracking-wider">
                            Wholesale
                          </span>
                        )}
                        <span className="text-xs text-charcoal-400 dark:text-[#85888E] ml-1">
                          {new Date(ord.createdAt).toLocaleDateString('en-PK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-50 dark:bg-[#3FB982]/15 text-emerald-700 dark:text-[#3FB982] border-emerald-300 dark:border-[#3FB982]/30'
                              : ord.status === 'Cancelled'
                              ? 'bg-rose-50 dark:bg-[#D96B6B]/15 text-rose-700 dark:text-[#D96B6B] border-rose-300 dark:border-[#D96B6B]/30'
                              : ord.status === 'Pending'
                              ? 'bg-amber-50 dark:bg-[#D6A84F]/15 text-amber-700 dark:text-[#D6A84F] border-amber-300 dark:border-[#D6A84F]/30'
                              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800/60'
                          }`}
                        >
                          {ord.status}
                        </span>
                        <span className="text-xs font-extrabold text-[#A07D38] dark:text-[#C9A96A]">
                          Rs. {ord.totalAmount}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-charcoal-700 dark:text-[#B4B5BA]">
                          <span>
                            {it.productName} ({it.quality}, {it.sleeve}, Size {it.size}) x {it.quantity}
                          </span>
                          <span className="font-semibold text-charcoal-900 dark:text-[#F1F0EC]">Rs. {it.totalPrice}</span>
                        </div>
                      ))}
                    </div>

                    {ord.wholesaleDiscount && ord.wholesaleDiscount > 0 && (
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs font-bold flex justify-between">
                        <span>Wholesale Discount Applied:</span>
                        <span>- Rs. {ord.wholesaleDiscount}</span>
                      </div>
                    )}

                    <div className="text-[11px] text-charcoal-500 dark:text-[#85888E] pt-2 border-t border-light-border dark:border-[#30343A] flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span>Delivery Destination: {ord.address}, {ord.city}</span>
                      <span>Payment: {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Direct Bank Transfer'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
