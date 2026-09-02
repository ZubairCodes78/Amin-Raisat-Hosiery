'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DataStore } from '@/lib/store';
import { CustomerRecord, Order } from '@/types';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  MapPin,
  X,
  ExternalLink,
  ChevronRight,
  UserCheck,
  CreditCard,
  Package,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { formatWhatsAppNumber } from '@/lib/whatsapp';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [selectedCustomerOrder, setSelectedCustomerOrder] = useState<Order | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await DataStore.getCustomers();
      setCustomers(data);
    } catch (err: any) {
      console.error('Failed to load customers:', err);
      setLoadError(err?.message || 'Failed to query customer database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers;
    const q = searchQuery.toLowerCase().trim();
    return customers.filter(
      (c) =>
        c.fullName.toLowerCase().includes(q) ||
        (c.email && c.email.toLowerCase().includes(q)) ||
        (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [customers, searchQuery]);

  const stats = useMemo(() => {
    const total = customers.length;
    const withOrders = customers.filter((c) => c.totalOrders > 0).length;
    const totalOrdersCount = customers.reduce((sum, c) => sum + c.totalOrders, 0);
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

    return { total, withOrders, totalOrdersCount, totalRevenue };
  }, [customers]);

  return (
    <div className="space-y-6 max-w-7xl text-charcoal-900 dark:text-[#F4F1E9]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#191917] p-6 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-charcoal-900 dark:text-[#F4F1E9]">Customer Profiles</h1>
            <span className="text-xs font-bold bg-light-elevated dark:bg-[#22211E] text-[#B89555] dark:text-[#C9A96A] border border-light-border dark:border-[#34322D] px-2.5 py-0.5 rounded-lg whitespace-nowrap">
              {customers.length} Registered
            </span>
          </div>
          <p className="text-xs text-charcoal-500 dark:text-[#8E8A80] mt-1">
            Real customer database synchronized with Supabase Auth. Inspect customer order history, lifetime value, and saved addresses.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchCustomers}
          disabled={isLoading}
          className="inline-flex items-center gap-2 py-2 px-4 bg-white dark:bg-[#22211E] hover:bg-light-hover dark:hover:bg-[#262521] text-charcoal-900 dark:text-[#F4F1E9] border border-light-border dark:border-[#34322D] rounded-xl text-xs font-bold transition-all self-start sm:self-auto active:scale-95 disabled:opacity-50 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#B89555] dark:text-[#C9A96A]' : ''}`} />
          <span>{isLoading ? 'Refreshing...' : 'Refresh List'}</span>
        </button>
      </div>

      {loadError && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-2xl text-xs flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>Error reading customer database: {loadError}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-[#191917] p-4 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm">
          <span className="text-[10px] font-bold text-charcoal-500 dark:text-[#8E8A80] uppercase tracking-wider block whitespace-nowrap">
            Total Customers
          </span>
          <div className="text-xl font-bold text-[#B89555] dark:text-[#C9A96A] mt-1">{stats.total}</div>
          <span className="text-[10px] text-charcoal-400 dark:text-[#8E8A80] mt-0.5 block whitespace-nowrap">Registered Accounts</span>
        </div>

        <div className="bg-white dark:bg-[#191917] p-4 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm">
          <span className="text-[10px] font-bold text-charcoal-500 dark:text-[#8E8A80] uppercase tracking-wider block whitespace-nowrap">
            Active Buyers
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.withOrders}</div>
          <span className="text-[10px] text-charcoal-400 dark:text-[#8E8A80] mt-0.5 block whitespace-nowrap">Placed Orders</span>
        </div>

        <div className="bg-white dark:bg-[#191917] p-4 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm">
          <span className="text-[10px] font-bold text-charcoal-500 dark:text-[#8E8A80] uppercase tracking-wider block whitespace-nowrap">
            Total Orders
          </span>
          <div className="text-xl font-bold text-charcoal-900 dark:text-[#F4F1E9] mt-1">{stats.totalOrdersCount}</div>
          <span className="text-[10px] text-charcoal-400 dark:text-[#8E8A80] mt-0.5 block whitespace-nowrap">Lifetime Checkouts</span>
        </div>

        <div className="bg-white dark:bg-[#191917] p-4 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm">
          <span className="text-[10px] font-bold text-charcoal-500 dark:text-[#8E8A80] uppercase tracking-wider block whitespace-nowrap">
            Customer Revenue
          </span>
          <div className="text-xl font-bold text-[#B89555] dark:text-[#C9A96A] mt-1">
            Rs. {stats.totalRevenue.toLocaleString()}
          </div>
          <span className="text-[10px] text-charcoal-400 dark:text-[#8E8A80] mt-0.5 block whitespace-nowrap">Delivered &amp; Paid</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-[#191917] p-4 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm">
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] text-charcoal-900 dark:text-[#F4F1E9] placeholder-charcoal-400 dark:placeholder-[#8E8A80] rounded-xl focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
          />
          <Search className="w-4 h-4 text-charcoal-400 dark:text-[#8E8A80] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Customers List Container */}
      <div className="bg-white dark:bg-[#191917] rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#B89555] dark:border-[#C9A96A] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-charcoal-500 dark:text-[#8E8A80]">Loading customer records from Supabase...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <Users className="w-10 h-10 text-charcoal-400 dark:text-[#8E8A80] mx-auto" />
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-[#F4F1E9]">No customers found</h3>
            <p className="text-xs text-charcoal-500 dark:text-[#8E8A80] max-w-sm mx-auto">
              {searchQuery
                ? 'No customer matches your current search criteria.'
                : 'Registered customer accounts will appear here automatically.'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table (hidden on mobile < md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-light-elevated dark:bg-[#22211E] text-[#B89555] dark:text-[#C9A96A] uppercase font-bold text-[11px] border-b border-light-border dark:border-[#34322D]">
                  <tr>
                    <th className="p-4 min-w-[220px]">Customer</th>
                    <th className="p-4 min-w-[200px]">Contact Info</th>
                    <th className="p-4 w-32 text-center whitespace-nowrap">Orders</th>
                    <th className="p-4 w-36 whitespace-nowrap">Lifetime Spent</th>
                    <th className="p-4 w-36 whitespace-nowrap">Registered</th>
                    <th className="p-4 w-28 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-[#34322D] font-medium text-charcoal-700 dark:text-[#B8B3A8]">
                  {filteredCustomers.map((cust) => {
                    const targetPhone = cust.phone ? formatWhatsAppNumber(cust.phone) : null;
                    const whatsappLink = targetPhone
                      ? `https://wa.me/${targetPhone}?text=${encodeURIComponent(
                          `Assalam-o-Alaikum ${cust.fullName}, this is Amin Raisat Hosiery.`
                        )}`
                      : null;

                    return (
                      <tr key={cust.id} className="hover:bg-light-hover dark:hover:bg-[#22211E]/60 transition-colors">
                        <td className="p-4 min-w-[220px]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-champagne-100 dark:bg-[#22211E] border border-light-border dark:border-[#34322D] flex items-center justify-center font-bold text-xs text-[#B89555] dark:text-[#C9A96A]">
                              {cust.fullName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-charcoal-900 dark:text-[#F4F1E9]">{cust.fullName}</div>
                              <span className="text-[10px] text-charcoal-400 dark:text-[#8E8A80] font-mono">
                                ID: {cust.id.slice(0, 8)}...
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 min-w-[200px]">
                          <div className="space-y-0.5">
                            {cust.email && (
                              <div className="flex items-center gap-1.5 text-xs text-charcoal-900 dark:text-[#F4F1E9]">
                                <Mail className="w-3.5 h-3.5 text-charcoal-400 dark:text-[#8E8A80]" />
                                <span>{cust.email}</span>
                              </div>
                            )}
                            {cust.phone ? (
                              <div className="flex items-center gap-1.5 text-xs text-charcoal-500 dark:text-[#8E8A80]">
                                <Phone className="w-3.5 h-3.5 text-charcoal-400 dark:text-[#8E8A80]" />
                                <span className="font-mono">{cust.phone}</span>
                                {whatsappLink && (
                                  <a
                                    href={whatsappLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#25D366] hover:text-[#1EBE5D] p-0.5 inline-flex items-center ml-1"
                                    title="WhatsApp Chat"
                                  >
                                    <WhatsAppIcon size={13} className="fill-current" />
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-[11px] text-charcoal-400 dark:text-[#8E8A80] italic">No phone saved</span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 w-32 text-center whitespace-nowrap">
                          <span className="inline-flex items-center font-bold text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] text-charcoal-900 dark:text-[#F4F1E9] px-2.5 py-1 rounded-lg">
                            {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                          </span>
                        </td>

                        <td className="p-4 w-36 whitespace-nowrap font-bold text-[#B89555] dark:text-[#C9A96A] text-sm">
                          Rs. {cust.totalSpent.toLocaleString()}
                        </td>

                        <td className="p-4 w-36 whitespace-nowrap text-charcoal-400 dark:text-[#8E8A80] text-[11px]">
                          {new Date(cust.createdAt).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        <td className="p-4 w-28 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(cust)}
                            className="px-3.5 py-1.5 bg-light-elevated dark:bg-[#22211E] hover:bg-light-hover dark:hover:bg-[#262521] border border-light-border dark:border-[#34322D] text-[#B89555] dark:text-[#C9A96A] hover:text-[#96763D] dark:hover:text-[#D8BD88] rounded-xl text-xs font-bold transition-colors shadow-2xs"
                          >
                            Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (md:hidden) */}
            <div className="md:hidden divide-y divide-light-border dark:divide-[#34322D]">
              {filteredCustomers.map((cust) => (
                <div key={cust.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-champagne-100 dark:bg-[#22211E] border border-light-border dark:border-[#34322D] flex items-center justify-center font-bold text-sm text-[#B89555] dark:text-[#C9A96A]">
                        {cust.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-charcoal-900 dark:text-[#F4F1E9]">{cust.fullName}</h4>
                        <span className="text-[11px] text-charcoal-500 dark:text-[#8E8A80] block">{cust.email || 'No email'}</span>
                      </div>
                    </div>

                    <span className="font-bold text-xs bg-light-elevated dark:bg-[#22211E] text-[#B89555] dark:text-[#C9A96A] px-2.5 py-1 rounded-lg border border-light-border dark:border-[#34322D] whitespace-nowrap">
                      {cust.totalOrders} {cust.totalOrders === 1 ? 'order' : 'orders'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-charcoal-500 dark:text-[#8E8A80]">
                      Spent: <strong className="text-charcoal-900 dark:text-[#F4F1E9]">Rs. {cust.totalSpent.toLocaleString()}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(cust)}
                      className="px-3.5 py-1.5 bg-light-elevated dark:bg-[#22211E] text-[#B89555] dark:text-[#C9A96A] border border-light-border dark:border-[#34322D] rounded-xl text-xs font-bold"
                    >
                      View Profile &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-white dark:bg-[#191917] rounded-2xl max-w-3xl w-full shadow-elevation border border-light-border dark:border-[#34322D] space-y-6 max-h-[92vh] overflow-y-auto p-5 sm:p-8 text-charcoal-900 dark:text-[#F4F1E9]">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-light-border dark:border-[#34322D] pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-champagne-100 dark:bg-[#22211E] border border-light-border dark:border-[#34322D] flex items-center justify-center font-extrabold text-base text-[#B89555] dark:text-[#C9A96A]">
                  {selectedCustomer.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#B89555] dark:text-[#C9A96A] uppercase tracking-wider">
                    Customer Account
                  </span>
                  <h2 className="text-xl font-bold text-charcoal-900 dark:text-[#F4F1E9] mt-0.5">
                    {selectedCustomer.fullName}
                  </h2>
                  <p className="text-xs text-charcoal-500 dark:text-[#8E8A80] font-mono">
                    Auth ID: {selectedCustomer.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-charcoal-400 dark:text-[#8E8A80] hover:text-charcoal-900 dark:hover:text-[#F4F1E9] rounded-lg hover:bg-light-hover dark:hover:bg-[#22211E] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-light-elevated dark:bg-[#22211E] p-4 rounded-xl border border-light-border dark:border-[#34322D] text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-charcoal-500 dark:text-[#8E8A80] block">Email</span>
                <p className="font-semibold text-charcoal-900 dark:text-[#F4F1E9] mt-0.5">{selectedCustomer.email || '—'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-charcoal-500 dark:text-[#8E8A80] block">Phone</span>
                <p className="font-semibold text-charcoal-900 dark:text-[#F4F1E9] font-mono mt-0.5">
                  {selectedCustomer.phone || '—'}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase text-charcoal-500 dark:text-[#8E8A80] block">Member Since</span>
                <p className="font-semibold text-charcoal-900 dark:text-[#F4F1E9] mt-0.5">
                  {new Date(selectedCustomer.createdAt).toLocaleDateString('en-PK', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Saved Customer Addresses */}
            <div className="space-y-2.5">
              <h3 className="font-bold text-xs text-[#B89555] dark:text-[#C9A96A] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>Saved Addresses ({selectedCustomer.addresses.length})</span>
              </h3>

              {selectedCustomer.addresses.length === 0 ? (
                <div className="p-4 bg-light-elevated dark:bg-[#22211E] rounded-xl border border-light-border dark:border-[#34322D] text-center text-xs text-charcoal-500 dark:text-[#8E8A80]">
                  No saved shipping or billing addresses recorded yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedCustomer.addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-3.5 bg-light-elevated dark:bg-[#22211E] rounded-xl border border-light-border dark:border-[#34322D] space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#B89555] dark:text-[#C9A96A]">
                          {addr.addressType} {addr.isDefault && '• Default'}
                        </span>
                        <span className="text-[10px] text-charcoal-500 dark:text-[#8E8A80]">{addr.city}</span>
                      </div>
                      <p className="font-semibold text-charcoal-900 dark:text-[#F4F1E9]">{addr.fullName || selectedCustomer.fullName}</p>
                      <p className="text-charcoal-600 dark:text-[#B8B3A8] leading-relaxed">{addr.address || addr.streetAddress}</p>
                      <p className="text-[11px] text-charcoal-500 dark:text-[#8E8A80]">
                        {addr.city}, {addr.province} {addr.postalCode ? `(${addr.postalCode})` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order History */}
            <div className="space-y-2.5">
              <h3 className="font-bold text-xs text-[#B89555] dark:text-[#C9A96A] uppercase tracking-wider flex items-center gap-1.5">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Order History ({selectedCustomer.orders.length})</span>
              </h3>

              {selectedCustomer.orders.length === 0 ? (
                <div className="p-6 bg-light-elevated dark:bg-[#22211E] rounded-xl border border-light-border dark:border-[#34322D] text-center text-xs text-charcoal-500 dark:text-[#8E8A80]">
                  This customer has not placed any orders yet.
                </div>
              ) : (
                <div className="border border-light-border dark:border-[#34322D] rounded-xl overflow-hidden divide-y divide-light-border dark:divide-[#34322D] text-xs bg-light-elevated dark:bg-[#22211E]">
                  {selectedCustomer.orders.map((ord) => (
                    <div key={ord.id} className="p-3.5 flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#B89555] dark:text-[#C9A96A]">#{ord.orderNumber}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                : ord.status === 'Cancelled'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                                : ord.status === 'Pending'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800/60'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-charcoal-500 dark:text-[#8E8A80] mt-1">
                          {ord.items.map((it) => `${it.productName} (${it.size} x${it.quantity})`).join(', ')}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="font-bold text-charcoal-900 dark:text-[#F4F1E9] block">Rs. {ord.totalAmount.toLocaleString()}</span>
                        <span className="text-[10px] text-charcoal-400 dark:text-[#8E8A80]">
                          {new Date(ord.createdAt).toLocaleDateString('en-PK', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-light-border dark:border-[#34322D]">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 bg-light-elevated dark:bg-[#22211E] hover:bg-light-hover dark:hover:bg-[#262521] text-charcoal-900 dark:text-[#F4F1E9] rounded-xl text-xs font-bold border border-light-border dark:border-[#34322D]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
