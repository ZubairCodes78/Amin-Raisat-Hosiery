'use client';

import React, { useState, useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import { Order, OrderStatus } from '@/types';
import {
  Search,
  ShoppingCart,
  Phone,
  MapPin,
  Calendar,
  X,
  CreditCard,
  Truck,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

const ALL_STATUSES: OrderStatus[] = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, isLoading } = useStore();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [wholesaleFilter, setWholesaleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Status Change Confirmation Modal State
  const [statusConfirmModal, setStatusConfirmModal] = useState<{
    isOpen: boolean;
    orderId: string;
    orderNumber: string;
    newStatus: OrderStatus;
  } | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      if (statusFilter !== 'all' && ord.status !== statusFilter) return false;
      if (wholesaleFilter === 'wholesale' && !ord.isWholesale) return false;
      if (wholesaleFilter === 'retail' && ord.isWholesale) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNumber = ord.orderNumber.toLowerCase().includes(q);
        const matchesName = ord.customerName.toLowerCase().includes(q);
        const matchesPhone = ord.customerPhone.toLowerCase().includes(q);
        const matchesCity = ord.city.toLowerCase().includes(q);
        return matchesNumber || matchesName || matchesPhone || matchesCity;
      }
      return true;
    });
  }, [orders, statusFilter, wholesaleFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      wholesale: orders.filter((o) => o.isWholesale).length,
      pending: orders.filter((o) => o.status === 'Pending').length,
      confirmed: orders.filter((o) => o.status === 'Confirmed' || o.status === 'Processing').length,
      shipped: orders.filter((o) => o.status === 'Shipped').length,
      delivered: orders.filter((o) => o.status === 'Delivered').length,
    };
  }, [orders]);

  const handleInitiateStatusChange = (orderId: string, orderNumber: string, newStatus: OrderStatus) => {
    setStatusConfirmModal({
      isOpen: true,
      orderId,
      orderNumber,
      newStatus,
    });
  };

  const handleConfirmStatusChange = async () => {
    if (!statusConfirmModal) return;
    const { orderId, newStatus } = statusConfirmModal;
    await updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
    setStatusConfirmModal(null);
  };

  return (
    <div className="space-y-6 max-w-7xl text-charcoal-900 dark:text-[#F4F1E9]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#191917] p-6 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-charcoal-900 dark:text-[#F4F1E9]">Orders &amp; Dispatch</h1>
            <span className="text-xs font-bold bg-light-elevated dark:bg-[#22211E] text-[#B89555] dark:text-[#C9A96A] border border-light-border dark:border-[#34322D] px-2.5 py-0.5 rounded-lg whitespace-nowrap">
              {orders.length} Total
            </span>
          </div>
          <p className="text-xs text-charcoal-500 dark:text-[#8E8A80] mt-1">
            Real-time customer dispatch desk. Confirm orders, update courier fulfillment statuses, and launch direct WhatsApp messages.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        <div className="bg-white dark:bg-[#191917] p-4 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm">
          <span className="text-[10px] font-bold text-charcoal-500 dark:text-[#8E8A80] uppercase tracking-wider block whitespace-nowrap">
            Wholesale Orders
          </span>
          <div className="text-xl font-bold text-[#B89555] dark:text-[#C9A96A] mt-1">{stats.wholesale}</div>
          <span className="text-[10px] text-charcoal-400 dark:text-[#8E8A80] mt-0.5 block whitespace-nowrap">B2B Bulk Orders</span>
        </div>

        <div className="bg-white dark:bg-[#191917] p-4 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm">
          <span className="text-[10px] font-bold text-charcoal-500 dark:text-[#8E8A80] uppercase tracking-wider block whitespace-nowrap">
            Pending Review
          </span>
          <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</div>
          <span className="text-[10px] text-charcoal-400 dark:text-[#8E8A80] mt-0.5 block whitespace-nowrap">Awaiting Call</span>
        </div>

        <div className="bg-white dark:bg-[#191917] p-4 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm">
          <span className="text-[10px] font-bold text-charcoal-500 dark:text-[#8E8A80] uppercase tracking-wider block whitespace-nowrap">
            In Processing
          </span>
          <div className="text-xl font-bold text-charcoal-900 dark:text-[#F4F1E9] mt-1">{stats.confirmed}</div>
          <span className="text-[10px] text-charcoal-400 dark:text-[#8E8A80] mt-0.5 block whitespace-nowrap">Packing &amp; Ready</span>
        </div>

        <div className="bg-white dark:bg-[#191917] p-4 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm">
          <span className="text-[10px] font-bold text-charcoal-500 dark:text-[#8E8A80] uppercase tracking-wider block whitespace-nowrap">
            Shipped
          </span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{stats.shipped}</div>
          <span className="text-[10px] text-charcoal-400 dark:text-[#8E8A80] mt-0.5 block whitespace-nowrap">With Courier</span>
        </div>

        <div className="bg-white dark:bg-[#191917] p-4 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm">
          <span className="text-[10px] font-bold text-charcoal-500 dark:text-[#8E8A80] uppercase tracking-wider block whitespace-nowrap">
            Delivered
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.delivered}</div>
          <span className="text-[10px] text-charcoal-400 dark:text-[#8E8A80] mt-0.5 block whitespace-nowrap">Successfully Paid</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white dark:bg-[#191917] p-4 rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            placeholder="Search order #, customer, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] text-charcoal-900 dark:text-[#F4F1E9] placeholder-charcoal-400 dark:placeholder-[#8E8A80] rounded-xl focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-charcoal-400 dark:text-[#8E8A80] absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          {/* Wholesale Filter */}
          <select
            value={wholesaleFilter}
            onChange={(e) => setWholesaleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] text-charcoal-900 dark:text-[#F4F1E9] rounded-xl focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="wholesale">Wholesale Only</option>
            <option value="retail">Retail Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-light-elevated dark:bg-[#22211E] border border-light-border dark:border-[#34322D] text-charcoal-900 dark:text-[#F4F1E9] rounded-xl focus:border-[#B89555] dark:focus:border-[#C9A96A] focus:outline-none"
          >
            <option value="all">All Statuses ({orders.length})</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Container */}
      <div className="bg-white dark:bg-[#191917] rounded-2xl border border-light-border dark:border-[#34322D] shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <ShoppingCart className="w-10 h-10 text-charcoal-400 dark:text-[#8E8A80] mx-auto" />
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-[#F4F1E9]">No orders match your search or filter.</h3>
            <p className="text-xs text-charcoal-500 dark:text-[#8E8A80]">Customer orders placed on the storefront will appear here instantly.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (md:block) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-light-elevated dark:bg-[#22211E] text-[#B89555] dark:text-[#C9A96A] uppercase font-bold text-[11px] border-b border-light-border dark:border-[#34322D]">
                  <tr>
                    <th className="p-4 w-28 whitespace-nowrap font-mono">Order #</th>
                    <th className="p-4 min-w-[200px]">Customer &amp; Phone</th>
                    <th className="p-4 w-36 whitespace-nowrap">City / Province</th>
                    <th className="p-4 min-w-[220px]">Items &amp; Type</th>
                    <th className="p-4 w-32 whitespace-nowrap">Total (Rs.)</th>
                    <th className="p-4 w-36 whitespace-nowrap">Payment</th>
                    <th className="p-4 w-36 whitespace-nowrap">Status</th>
                    <th className="p-4 w-28 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-[#282723] font-medium text-charcoal-700 dark:text-[#B8B3A8]">
                  {filteredOrders.map((ord) => {
                    const cleanPhone = ord.customerPhone.replace(/^0/, '').replace(/[\s-]/g, '');
                    const whatsappLink = `https://wa.me/92${cleanPhone}?text=${encodeURIComponent(
                      `Assalam-o-Alaikum ${ord.customerName}, this is Amin Raisat Hosiery regarding your Order #${ord.orderNumber}.`
                    )}`;

                    return (
                      <tr key={ord.id} className="hover:bg-light-hover dark:hover:bg-[#22211E]/60 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#B89555] dark:text-[#C9A96A] whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span>#{ord.orderNumber}</span>
                            {ord.isWholesale && (
                              <span className="text-[9px] font-extrabold bg-[#B89555]/20 text-[#B89555] dark:text-[#C9A96A] border border-[#B89555]/40 px-1 py-0.5 rounded uppercase">
                                Wholesale
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 min-w-[200px]">
                          <div className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">{ord.customerName}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-charcoal-500 dark:text-[#8E8A80] font-mono text-[11px] whitespace-nowrap">{ord.customerPhone}</span>
                            <a
                              href={whatsappLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#25D366] hover:text-[#1EBE5D] p-0.5 inline-flex items-center"
                              title="Chat on WhatsApp"
                            >
                              <WhatsAppIcon size={14} className="fill-current" />
                            </a>
                          </div>
                        </td>
                        <td className="p-4 w-36 whitespace-nowrap text-charcoal-900 dark:text-[#F4F1E9]">
                          <div>{ord.city}</div>
                          <span className="text-[10px] text-charcoal-500 dark:text-[#8E8A80]">{ord.province}</span>
                        </td>
                        <td className="p-4 min-w-[220px] text-charcoal-900 dark:text-[#F4F1E9]">
                          <div className="font-bold whitespace-nowrap flex items-center gap-1.5">
                            <span>{ord.items.reduce((s, it) => s + it.quantity, 0)} pieces</span>
                            {ord.isWholesale && (
                              <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">
                                (Wholesale Tier)
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-charcoal-500 dark:text-[#8E8A80] line-clamp-1">
                            {ord.items.map((it) => `${it.quality} ${it.size} x${it.quantity}`).join(', ')}
                          </span>
                        </td>
                        <td className="p-4 w-32 font-bold text-[#B89555] dark:text-[#C9A96A] text-sm whitespace-nowrap">
                          Rs. {ord.totalAmount}
                        </td>
                        <td className="p-4 w-36 whitespace-nowrap">
                          <span className="capitalize font-semibold text-[11px] text-charcoal-600 dark:text-[#B8B3A8]">
                            {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                          </span>
                        </td>
                        <td className="p-4 w-36 whitespace-nowrap">
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              handleInitiateStatusChange(ord.id, ord.orderNumber, e.target.value as OrderStatus)
                            }
                            className={`px-2.5 py-1 text-xs font-bold rounded-xl border focus:outline-none ${
                              ord.status === 'Delivered'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                : ord.status === 'Cancelled'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                                : ord.status === 'Pending'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                                : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                            }`}
                          >
                            {ALL_STATUSES.map((st) => (
                              <option key={st} value={st} className="bg-white dark:bg-[#191917] text-charcoal-900 dark:text-[#F4F1E9]">
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 w-28 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="px-3.5 py-1.5 bg-light-elevated dark:bg-[#22211E] hover:bg-light-hover dark:hover:bg-[#2A2925] border border-light-border dark:border-[#34322D] text-[#B89555] dark:text-[#C9A96A] hover:text-champagne-500 rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View (md:hidden) */}
            <div className="md:hidden divide-y divide-light-border dark:divide-[#282723] p-3 space-y-3">
              {filteredOrders.map((ord) => {
                const cleanPhone = ord.customerPhone.replace(/^0/, '').replace(/[\s-]/g, '');
                const whatsappLink = `https://wa.me/92${cleanPhone}?text=${encodeURIComponent(
                  `Assalam-o-Alaikum ${ord.customerName}, this is Amin Raisat Hosiery regarding your Order #${ord.orderNumber}.`
                )}`;

                return (
                  <div
                    key={ord.id}
                    className="p-4 bg-light-elevated dark:bg-[#22211E] rounded-xl border border-light-border dark:border-[#34322D] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-sm text-[#B89555] dark:text-[#C9A96A]">
                          #{ord.orderNumber}
                        </span>
                        {ord.isWholesale && (
                          <span className="text-[9px] font-extrabold bg-[#B89555]/20 text-[#B89555] dark:text-[#C9A96A] border border-[#B89555]/40 px-1 py-0.5 rounded uppercase">
                            Wholesale
                          </span>
                        )}
                      </div>
                      <span className="font-bold text-sm text-charcoal-900 dark:text-[#F4F1E9]">
                        Rs. {ord.totalAmount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">{ord.customerName}</div>
                        <div className="text-[11px] text-charcoal-500 dark:text-[#8E8A80]">{ord.city}, {ord.province}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg border border-emerald-500/30"
                        >
                          <WhatsAppIcon size={14} className="fill-current" />
                        </a>
                      </div>
                    </div>

                    <div className="text-[11px] text-charcoal-500 dark:text-[#8E8A80]">
                      {ord.items.reduce((s, it) => s + it.quantity, 0)} pcs • {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-light-border dark:border-[#34322D]">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          handleInitiateStatusChange(ord.id, ord.orderNumber, e.target.value as OrderStatus)
                        }
                        className={`flex-1 px-2.5 py-1.5 text-xs font-bold rounded-xl border focus:outline-none ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                            : ord.status === 'Cancelled'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-800'
                            : ord.status === 'Pending'
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                        }`}
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-white dark:bg-[#191917] text-charcoal-900 dark:text-[#F4F1E9]">
                            {st}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="px-4 py-1.5 bg-champagne-500 text-charcoal-950 rounded-xl text-xs font-bold shadow-xs"
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#191917] border border-light-border dark:border-[#34322D] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-elevation max-h-[90vh] overflow-y-auto text-charcoal-900 dark:text-[#F4F1E9]">
            <div className="flex items-center justify-between border-b border-light-border dark:border-[#34322D] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-charcoal-900 dark:text-[#F4F1E9]">Order #{selectedOrder.orderNumber}</h3>
                  {selectedOrder.isWholesale && (
                    <span className="text-[10px] font-extrabold bg-champagne-500 text-charcoal-950 px-2 py-0.5 rounded uppercase">
                      Wholesale B2B Order
                    </span>
                  )}
                </div>
                <p className="text-xs text-charcoal-500 dark:text-[#8E8A80]">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer info */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-light-elevated dark:bg-[#22211E] p-4 rounded-xl border border-light-border dark:border-[#34322D]">
              <div>
                <span className="text-charcoal-500 dark:text-[#8E8A80] block">Customer Name</span>
                <strong className="text-charcoal-900 dark:text-[#F4F1E9]">{selectedOrder.customerName}</strong>
              </div>
              <div>
                <span className="text-charcoal-500 dark:text-[#8E8A80] block">Phone Number</span>
                <strong className="text-charcoal-900 dark:text-[#F4F1E9]">{selectedOrder.customerPhone}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-charcoal-500 dark:text-[#8E8A80] block">Delivery Address</span>
                <p className="text-charcoal-900 dark:text-[#F4F1E9]">{selectedOrder.address}, {selectedOrder.city}, {selectedOrder.province}</p>
              </div>
              {selectedOrder.orderNotes && (
                <div className="col-span-2">
                  <span className="text-charcoal-500 dark:text-[#8E8A80] block">Customer Order Notes</span>
                  <p className="text-[#B89555] dark:text-[#C9A96A] italic">{selectedOrder.orderNotes}</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-charcoal-700 dark:text-[#B8B3A8] uppercase">Ordered Items</h4>
              <div className="divide-y divide-light-border dark:divide-[#34322D] border border-light-border dark:border-[#34322D] rounded-xl overflow-hidden">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="p-3 flex items-center justify-between text-xs bg-white dark:bg-[#191917]">
                    <div>
                      <div className="font-bold text-charcoal-900 dark:text-[#F4F1E9]">{it.productName}</div>
                      <div className="text-[11px] text-charcoal-500 dark:text-[#8E8A80]">
                        {it.quality} • {it.sleeve} • Size {it.size}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#B89555] dark:text-[#C9A96A]">
                        {it.quantity} x Rs. {it.unitPrice} = Rs. {it.totalPrice}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-light-elevated dark:bg-[#22211E] p-4 rounded-xl space-y-1.5 text-xs text-charcoal-700 dark:text-[#B8B3A8]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-charcoal-900 dark:text-[#F4F1E9] font-semibold">Rs. {selectedOrder.subtotal}</span>
              </div>
              {selectedOrder.wholesaleDiscount && selectedOrder.wholesaleDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                  <span>Wholesale Savings Applied</span>
                  <span>- Rs. {selectedOrder.wholesaleDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{selectedOrder.deliveryFee === 0 ? 'FREE DELIVERY' : `Rs. ${selectedOrder.deliveryFee}`}</span>
              </div>
              <div className="border-t border-light-border dark:border-[#34322D] pt-2 flex justify-between text-sm font-extrabold text-[#B89555] dark:text-[#C9A96A]">
                <span>Total Amount</span>
                <span>Rs. {selectedOrder.totalAmount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {statusConfirmModal && (
        <ConfirmModal
          isOpen={statusConfirmModal.isOpen}
          title={`Update Order #${statusConfirmModal.orderNumber}`}
          message={`Are you sure you want to change the status of this order to "${statusConfirmModal.newStatus}"?`}
          confirmLabel="Confirm Status"
          onConfirm={handleConfirmStatusChange}
          onCancel={() => setStatusConfirmModal(null)}
        />
      )}
    </div>
  );
}
