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
  CheckCircle,
  AlertCircle,
  Building,
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
  const { user, profile, addresses, signOut, updateProfile, saveAddress, deleteAddress } = useAuth();
  const { orders } = useStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile');

  // Profile Edit State
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [whatsappNumber, setWhatsappNumber] = useState(profile?.whatsappNumber || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');

  // Address Modal / Form State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addrType, setAddrType] = useState<'shipping' | 'billing'>('shipping');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('Lahore');
  const [province, setProvince] = useState('Punjab');
  const [postalCode, setPostalCode] = useState('');
  const [isDefault, setIsDefault] = useState(true);

  // Sync profile fields on load
  React.useEffect(() => {
    if (profile) {
      setFullName(profile.fullName || '');
      setPhone(profile.phone || '');
      setWhatsappNumber(profile.whatsappNumber || '');
    }
  }, [profile]);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center py-16 px-4 bg-dark-bg text-gray-100 text-center space-y-4">
        <User className="w-12 h-12 text-gold-400" />
        <h1 className="text-2xl font-bold text-gray-100">Customer Sign In Required</h1>
        <p className="text-xs text-gray-400 max-w-sm">
          Please sign in or create an account to view your saved addresses and order history.
        </p>
        <div className="flex gap-3 pt-2">
          <Link
            href="/login"
            className="py-2.5 px-5 bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs rounded-xl shadow-glow-gold transition-all"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="py-2.5 px-5 bg-dark-surface hover:bg-dark-hover text-gray-200 border border-dark-border font-bold text-xs rounded-xl transition-colors"
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

    try {
      const { error } = await updateProfile({
        fullName: fullName.trim(),
        phone: phone.trim(),
        whatsappNumber: whatsappNumber.trim() || undefined,
      });

      if (error) {
        setProfileMessage('Failed to update profile.');
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
    if (!streetAddress.trim() || !city.trim()) return;

    await saveAddress({
      addressType: addrType,
      streetAddress: streetAddress.trim(),
      city: city.trim(),
      province: province,
      postalCode: postalCode.trim() || undefined,
      country: 'Pakistan',
      isDefault: isDefault,
    });

    setIsAddingAddress(false);
    setStreetAddress('');
    setPostalCode('');
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="py-12 bg-dark-bg min-h-[85vh] text-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-surface p-6 sm:p-8 rounded-2xl border border-dark-border shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gold-500 text-black flex items-center justify-center font-bold text-xl shadow-glow-gold">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-100">
                {profile?.fullName || 'Valued Customer'}
              </h1>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="inline-flex items-center gap-2 py-2.5 px-4 bg-dark-card hover:bg-rose-950/40 text-gray-300 hover:text-rose-400 border border-dark-border rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 border-b border-dark-border pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'profile'
                ? 'bg-gold-500 text-black shadow-glow-gold'
                : 'text-gray-400 hover:text-gray-100 hover:bg-dark-surface'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile Details</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`py-3 px-5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'addresses'
                ? 'bg-gold-500 text-black shadow-glow-gold'
                : 'text-gray-400 hover:text-gray-100 hover:bg-dark-surface'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses ({addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 px-5 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
              activeTab === 'orders'
                ? 'bg-gold-500 text-black shadow-glow-gold'
                : 'text-gray-400 hover:text-gray-100 hover:bg-dark-surface'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>My Orders ({customerOrders.length})</span>
          </button>
        </div>

        {/* TAB 1: Profile Details */}
        {activeTab === 'profile' && (
          <div className="bg-dark-surface p-6 sm:p-8 rounded-2xl border border-dark-border shadow-card max-w-2xl">
            <h2 className="text-base font-bold text-gray-100 mb-4 pb-2 border-b border-dark-border">
              Customer Contact Information
            </h2>

            {profileMessage && (
              <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{profileMessage}</span>
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user.email || ''}
                  className="w-full px-3.5 py-2.5 bg-dark-card/50 border border-dark-border text-gray-500 rounded-xl cursor-not-allowed"
                />
                <span className="text-[10px] text-gray-500 mt-0.5 block">Email cannot be modified.</span>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Mobile Phone Number</label>
                <input
                  type="tel"
                  placeholder="03001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl focus:outline-none focus:border-gold-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">WhatsApp Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="03018666075"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl focus:outline-none focus:border-gold-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="py-3 px-6 bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs rounded-xl shadow-glow-gold transition-all"
                >
                  {isUpdatingProfile ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: Saved Shipping Addresses */}
        {activeTab === 'addresses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-100">Saved Addresses</h2>
                <p className="text-xs text-gray-400">
                  Manage your delivery locations for faster guest or registered checkout.
                </p>
              </div>

              <button
                onClick={() => setIsAddingAddress(true)}
                className="inline-flex items-center gap-1.5 py-2.5 px-4 bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs rounded-xl shadow-glow-gold transition-all"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add New Address</span>
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-8 bg-dark-surface rounded-2xl border border-dark-border text-center space-y-3">
                <MapPin className="w-8 h-8 text-gray-500 mx-auto" />
                <h3 className="font-bold text-gray-200 text-sm">No saved addresses yet</h3>
                <p className="text-xs text-gray-400">
                  Save your address to avoid typing it during your next vest order.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="p-5 bg-dark-surface rounded-2xl border border-dark-border shadow-card space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-dark-card rounded-lg border border-dark-border text-gold-400">
                            {addr.addressType === 'shipping' ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                          </span>
                          <span className="font-bold text-xs text-gray-200 capitalize">
                            {addr.addressType} Address
                          </span>
                        </div>
                        {addr.isDefault && (
                          <span className="text-[10px] font-bold bg-gold-500 text-black px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-300 leading-relaxed font-medium">
                        {addr.streetAddress}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {addr.city}, {addr.province} {addr.postalCode ? `• ${addr.postalCode}` : ''}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-dark-border flex justify-end">
                      <button
                        onClick={() => deleteAddress(addr.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
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
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-dark-surface rounded-2xl p-6 max-w-md w-full shadow-elevation border border-dark-border space-y-4">
                  <h3 className="font-bold text-gray-100 text-base border-b border-dark-border pb-3">
                    Add New Address
                  </h3>

                  <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Address Type</label>
                      <select
                        value={addrType}
                        onChange={(e) => setAddrType(e.target.value as 'shipping' | 'billing')}
                        className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl"
                      >
                        <option value="shipping">Shipping Address (Home / Office)</option>
                        <option value="billing">Billing Address</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-semibold mb-1">Street Address *</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="House #, Street #, Sector / Landmark"
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl focus:outline-none focus:border-gold-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-gray-300 font-semibold mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-300 font-semibold mb-1">Province *</label>
                        <select
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl"
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
                        className="accent-gold-500 w-4 h-4 rounded"
                      />
                      <label htmlFor="isDefault" className="text-gray-300 font-medium cursor-pointer">
                        Set as default address
                      </label>
                    </div>

                    <div className="flex justify-end gap-2.5 pt-3 border-t border-dark-border">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="py-2.5 px-4 bg-dark-card text-gray-300 hover:bg-dark-hover rounded-xl font-semibold border border-dark-border"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="py-2.5 px-5 bg-gold-500 text-black rounded-xl font-bold hover:bg-gold-400 shadow-glow-gold"
                      >
                        Save Address
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
            <h2 className="text-lg font-bold text-gray-100">Order History</h2>
            {customerOrders.length === 0 ? (
              <div className="p-8 bg-dark-surface rounded-2xl border border-dark-border text-center space-y-3">
                <Package className="w-8 h-8 text-gray-500 mx-auto" />
                <h3 className="font-bold text-gray-200 text-sm">No orders found</h3>
                <p className="text-xs text-gray-400">
                  Any orders placed using this email or phone number will be listed here.
                </p>
                <div className="pt-2">
                  <Link
                    href="/shop"
                    className="inline-block py-2.5 px-5 bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs rounded-xl shadow-glow-gold"
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {customerOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="bg-dark-surface rounded-2xl p-6 border border-dark-border shadow-card space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dark-border pb-3">
                      <div>
                        <span className="text-xs font-bold text-gold-400">
                          Order #{ord.orderNumber}
                        </span>
                        <span className="text-xs text-gray-400 ml-2">
                          {new Date(ord.createdAt).toLocaleDateString('en-PK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-dark-card border border-dark-border text-gray-200">
                          Status: {ord.status}
                        </span>
                        <span className="text-xs font-extrabold text-gold-400">
                          Rs. {ord.totalAmount}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-gray-300">
                          <span>
                            {it.productName} ({it.quality}, {it.sleeve}, Size {it.size}) x {it.quantity}
                          </span>
                          <span className="font-semibold text-gray-100">Rs. {it.totalPrice}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[11px] text-gray-400 pt-2 border-t border-dark-border flex justify-between">
                      <span>Delivery Address: {ord.address}, {ord.city}</span>
                      <span>Payment: {ord.paymentMethod.toUpperCase()}</span>
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
