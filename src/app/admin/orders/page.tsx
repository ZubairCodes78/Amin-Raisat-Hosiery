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
  }, [orders, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
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
    <div className="space-y-6 max-w-7xl text-[#F1F0EC]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#17191D] p-6 rounded-2xl border border-[#30343A] shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#F1F0EC]">Orders &amp; Dispatch</h1>
            <span className="text-xs font-bold bg-[#1D2025] text-[#C9A96A] border border-[#30343A] px-2.5 py-0.5 rounded-lg whitespace-nowrap">
              {orders.length} Total
            </span>
          </div>
          <p className="text-xs text-[#85888E] mt-1">
            Real-time customer dispatch desk. Confirm orders, update courier fulfillment statuses, and launch direct WhatsApp messages.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#17191D] p-4 rounded-2xl border border-[#30343A] shadow-card">
          <span className="text-[10px] font-bold text-[#85888E] uppercase tracking-wider block whitespace-nowrap">
            Pending Review
          </span>
          <div className="text-xl font-bold text-[#D6A84F] mt-1">{stats.pending}</div>
          <span className="text-[10px] text-[#85888E] mt-0.5 block whitespace-nowrap">Awaiting Call</span>
        </div>

        <div className="bg-[#17191D] p-4 rounded-2xl border border-[#30343A] shadow-card">
          <span className="text-[10px] font-bold text-[#85888E] uppercase tracking-wider block whitespace-nowrap">
            In Processing
          </span>
          <div className="text-xl font-bold text-[#F1F0EC] mt-1">{stats.confirmed}</div>
          <span className="text-[10px] text-[#85888E] mt-0.5 block whitespace-nowrap">Packing &amp; Ready</span>
        </div>

        <div className="bg-[#17191D] p-4 rounded-2xl border border-[#30343A] shadow-card">
          <span className="text-[10px] font-bold text-[#85888E] uppercase tracking-wider block whitespace-nowrap">
            On The Way (Shipped)
          </span>
          <div className="text-xl font-bold text-blue-400 mt-1">{stats.shipped}</div>
          <span className="text-[10px] text-[#85888E] mt-0.5 block whitespace-nowrap">With Courier</span>
        </div>

        <div className="bg-[#17191D] p-4 rounded-2xl border border-[#30343A] shadow-card">
          <span className="text-[10px] font-bold text-[#85888E] uppercase tracking-wider block whitespace-nowrap">
            Delivered / Completed
          </span>
          <div className="text-xl font-bold text-[#3FB982] mt-1">{stats.delivered}</div>
          <span className="text-[10px] text-[#85888E] mt-0.5 block whitespace-nowrap">Successfully Paid</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-[#17191D] p-4 rounded-2xl border border-[#30343A] shadow-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 relative">
          <input
            type="text"
            placeholder="Search order #, customer, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-[#1D2025] border border-[#343840] text-[#F1F0EC] placeholder-[#85888E] rounded-xl focus:border-[#C9A96A] focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-[#85888E] absolute left-2.5 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#85888E] whitespace-nowrap">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#1D2025] border border-[#343840] text-[#F1F0EC] rounded-xl focus:border-[#C9A96A] focus:outline-none"
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
      <div className="bg-[#17191D] rounded-2xl border border-[#30343A] shadow-card overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <ShoppingCart className="w-10 h-10 text-[#85888E] mx-auto" />
            <h3 className="text-sm font-bold text-[#F1F0EC]">No orders match your search or filter.</h3>
            <p className="text-xs text-[#85888E]">Customer orders placed on the storefront will appear here instantly.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View (hidden on mobile < md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#1D2025] text-[#C9A96A] uppercase font-bold text-[11px] border-b border-[#30343A]">
                  <tr>
                    <th className="p-4 w-28 whitespace-nowrap font-mono">Order #</th>
                    <th className="p-4 min-w-[200px]">Customer &amp; Phone</th>
                    <th className="p-4 w-36 whitespace-nowrap">City / Province</th>
                    <th className="p-4 min-w-[220px]">Items &amp; Details</th>
                    <th className="p-4 w-32 whitespace-nowrap">Total (Rs.)</th>
                    <th className="p-4 w-36 whitespace-nowrap">Payment</th>
                    <th className="p-4 w-36 whitespace-nowrap">Status</th>
                    <th className="p-4 w-28 text-right whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#272A2F] font-medium text-[#B4B5BA]">
                  {filteredOrders.map((ord) => {
                    const cleanPhone = ord.customerPhone.replace(/^0/, '').replace(/[\s-]/g, '');
                    const whatsappLink = `https://wa.me/92${cleanPhone}?text=${encodeURIComponent(
                      `Assalam-o-Alaikum ${ord.customerName}, this is Amin Raisat Hosiery regarding your Order #${ord.orderNumber}.`
                    )}`;

                    return (
                      <tr key={ord.id} className="hover:bg-[#1D2025]/60 transition-colors">
                        <td className="p-4 font-mono font-bold text-[#C9A96A] whitespace-nowrap">
                          #{ord.orderNumber}
                        </td>
                        <td className="p-4 min-w-[200px]">
                          <div className="font-bold text-[#F1F0EC]">{ord.customerName}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[#85888E] font-mono text-[11px] whitespace-nowrap">{ord.customerPhone}</span>
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
                        <td className="p-4 w-36 whitespace-nowrap text-[#F1F0EC]">
                          <div>{ord.city}</div>
                          <span className="text-[10px] text-[#85888E]">{ord.province}</span>
                        </td>
                        <td className="p-4 min-w-[220px] text-[#F1F0EC]">
                          <div className="font-bold whitespace-nowrap">
                            {ord.items.reduce((s, it) => s + it.quantity, 0)} pieces
                          </div>
                          <span className="text-[10px] text-[#85888E] line-clamp-1">
                            {ord.items.map((it) => `${it.quality} ${it.size} x${it.quantity}`).join(', ')}
                          </span>
                        </td>
                        <td className="p-4 w-32 font-bold text-[#C9A96A] text-sm whitespace-nowrap">
                          Rs. {ord.totalAmount}
                        </td>
                        <td className="p-4 w-36 whitespace-nowrap">
                          <span className="capitalize font-semibold text-[11px] text-[#B4B5BA]">
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
                                ? 'bg-[#3FB982]/15 text-[#3FB982] border-[#3FB982]/30'
                                : ord.status === 'Cancelled'
                                ? 'bg-[#D96B6B]/15 text-[#D96B6B] border-[#D96B6B]/30'
                                : ord.status === 'Pending'
                                ? 'bg-[#D6A84F]/15 text-[#D6A84F] border-[#D6A84F]/30'
                                : 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                            }`}
                          >
                            {ALL_STATUSES.map((st) => (
                              <option key={st} value={st} className="bg-[#17191D] text-[#F1F0EC]">
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 w-28 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(ord)}
                            className="px-3.5 py-1.5 bg-[#202329] hover:bg-[#272A2F] border border-[#30343A] text-[#C9A96A] hover:text-[#D8BD88] rounded-xl text-xs font-bold transition-colors whitespace-nowrap"
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

            {/* Mobile Cards View (md:hidden) */}
            <div className="md:hidden divide-y divide-[#30343A]/60">
              {filteredOrders.map((ord) => {
                const cleanPhone = ord.customerPhone.replace(/^0/, '').replace(/[\s-]/g, '');
                const whatsappLink = `https://wa.me/92${cleanPhone}?text=${encodeURIComponent(
                  `Assalam-o-Alaikum ${ord.customerName}, this is Amin Raisat Hosiery regarding your Order #${ord.orderNumber}.`
                )}`;

                return (
                  <div key={ord.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-[#C9A96A] bg-[#202329] px-2 py-0.5 rounded border border-[#30343A]">
                          #{ord.orderNumber}
                        </span>
                        <h4 className="font-bold text-sm text-[#F1F0EC] mt-1">{ord.customerName}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-[#85888E] mt-0.5">
                          <span>{ord.customerPhone}</span>
                          <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#25D366] p-0.5 inline-flex items-center"
                          >
                            <WhatsAppIcon size={14} className="fill-current" />
                          </a>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-sm text-[#C9A96A] block whitespace-nowrap">Rs. {ord.totalAmount}</span>
                        <span className="text-[10px] text-[#85888E]">{ord.city}</span>
                      </div>
                    </div>

                    <div className="text-xs text-[#85888E] bg-[#1D2025] p-2.5 rounded-xl border border-[#30343A]">
                      <span className="font-bold text-[#F1F0EC]">{ord.items.reduce((s, it) => s + it.quantity, 0)} pieces: </span>
                      <span>{ord.items.map((it) => `${it.quality} ${it.size} x${it.quantity}`).join(', ')}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          handleInitiateStatusChange(ord.id, ord.orderNumber, e.target.value as OrderStatus)
                        }
                        className={`px-2.5 py-1 text-xs font-bold rounded-xl border focus:outline-none ${
                          ord.status === 'Delivered'
                            ? 'bg-[#3FB982]/15 text-[#3FB982] border-[#3FB982]/30'
                            : ord.status === 'Cancelled'
                            ? 'bg-[#D96B6B]/15 text-[#D96B6B] border-[#D96B6B]/30'
                            : ord.status === 'Pending'
                            ? 'bg-[#D6A84F]/15 text-[#D6A84F] border-[#D6A84F]/30'
                            : 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                        }`}
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st} className="bg-[#17191D] text-[#F1F0EC]">
                            {st}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3 py-1.5 bg-[#202329] text-[#C9A96A] border border-[#30343A] rounded-xl text-xs font-bold"
                      >
                        Details &rarr;
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#101114]/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#17191D] rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-elevation border border-[#30343A] space-y-6 max-h-[90vh] overflow-y-auto text-[#F1F0EC]">
            <div className="flex items-start justify-between border-b border-[#30343A] pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#C9A96A] uppercase tracking-wider">
                  Order Details
                </span>
                <h2 className="text-xl font-bold text-[#F1F0EC] mt-0.5">
                  #{selectedOrder.orderNumber}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-[#85888E] mt-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-PK', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#85888E] hover:text-[#F1F0EC] rounded-lg hover:bg-[#202329] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Contact & Delivery Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#1D2025] p-4 rounded-xl border border-[#30343A] text-xs">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-[#85888E] block">
                  Customer
                </span>
                <p className="font-bold text-[#F1F0EC] text-sm">{selectedOrder.customerName}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[#85888E] font-mono">{selectedOrder.customerPhone}</span>
                  <a
                    href={`https://wa.me/92${selectedOrder.customerPhone.replace(/^0/, '').replace(/[\s-]/g, '')}?text=${encodeURIComponent(
                      `Assalam-o-Alaikum ${selectedOrder.customerName}, this is Amin Raisat Hosiery regarding your Order #${selectedOrder.orderNumber}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#25D366] hover:text-[#1EBE5D] inline-flex items-center"
                    title="Launch WhatsApp Chat"
                  >
                    <WhatsAppIcon size={14} className="fill-current" />
                  </a>
                </div>
                {selectedOrder.customerEmail && (
                  <p className="text-[#85888E]">{selectedOrder.customerEmail}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase text-[#85888E] block">
                  Delivery Destination
                </span>
                <p className="text-[#F1F0EC] leading-relaxed">{selectedOrder.address}</p>
                <p className="font-semibold text-[#C9A96A]">
                  {selectedOrder.city}, {selectedOrder.province}
                </p>
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-[#85888E] block">
                Ordered Garments ({selectedOrder.items.reduce((s, it) => s + it.quantity, 0)} pieces)
              </span>

              <div className="border border-[#30343A] rounded-xl overflow-hidden divide-y divide-[#30343A] text-xs bg-[#1D2025]">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-[#F1F0EC]">{it.productName}</h4>
                      <p className="text-[11px] text-[#85888E]">
                        {it.quality} &bull; {it.sleeve} &bull; Fit: <span className="text-[#C9A96A] font-bold">{it.size}</span>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-[#F1F0EC] block">
                        {it.quantity} x Rs. {it.unitPrice}
                      </span>
                      <span className="font-bold text-[#C9A96A] text-xs">
                        Rs. {it.quantity * it.unitPrice}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Financial Summary */}
            <div className="bg-[#1D2025] p-4 rounded-xl border border-[#30343A] space-y-2 text-xs">
              <div className="flex justify-between text-[#85888E]">
                <span>Payment Method:</span>
                <span className="font-bold text-[#F1F0EC] capitalize">
                  {selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Direct Bank Transfer'}
                </span>
              </div>
              <div className="flex justify-between text-[#85888E]">
                <span>Delivery Charge:</span>
                <span className="font-bold text-[#3FB982]">
                  {selectedOrder.deliveryFee === 0 ? 'FREE DELIVERY (3+ pieces)' : `Rs. ${selectedOrder.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-[#F1F0EC] pt-2 border-t border-[#30343A]">
                <span>Grand Total:</span>
                <span className="text-[#C9A96A]">Rs. {selectedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-[#202329] hover:bg-[#272A2F] text-[#F1F0EC] rounded-xl text-xs font-bold border border-[#30343A]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Confirmation Modal */}
      {statusConfirmModal && (
        <ConfirmModal
          isOpen={statusConfirmModal.isOpen}
          title="Update Order Status"
          message={`Are you sure you want to change the status of Order #${statusConfirmModal.orderNumber} to "${statusConfirmModal.newStatus}"?`}
          confirmLabel={`Set to ${statusConfirmModal.newStatus}`}
          isDestructive={statusConfirmModal.newStatus === 'Cancelled' || statusConfirmModal.newStatus === 'Returned'}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => setStatusConfirmModal(null)}
        />
      )}
    </div>
  );
}
