'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Order, OrderStatus } from '@/types';
import { Search, Filter, Phone, CheckCircle, Clock, X, ShoppingCart, Check, ExternalLink } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

const ALL_STATUSES: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Returned',
];

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, isLoading } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('');
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Status Change Confirmation Modal
  const [statusConfirmModal, setStatusConfirmModal] = useState<{
    isOpen: boolean;
    orderId: string;
    orderNumber: string;
    newStatus: OrderStatus;
  }>({
    isOpen: false,
    orderId: '',
    orderNumber: '',
    newStatus: 'Pending',
  });

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleInitiateStatusChange = (orderId: string, orderNumber: string, newStatus: OrderStatus) => {
    if (newStatus === 'Cancelled' || newStatus === 'Returned') {
      setStatusConfirmModal({
        isOpen: true,
        orderId,
        orderNumber,
        newStatus,
      });
    } else {
      executeStatusChange(orderId, newStatus);
    }
  };

  const executeStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      showToast(`Order status updated to "${newStatus}"!`);
    } catch (err) {
      showToast('Unable to update order status. Please try again.');
    } finally {
      setStatusConfirmModal({ isOpen: false, orderId: '', orderNumber: '', newStatus: 'Pending' });
    }
  };

  return (
    <div className="space-y-6 text-[#F1F0EC] max-w-7xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-[#17191D] text-[#F1F0EC] border border-[#3FB982]/40 rounded-xl shadow-elevation flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-[#3FB982]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Status Confirmation Modal */}
      <ConfirmModal
        isOpen={statusConfirmModal.isOpen}
        title={`Confirm Order Status: ${statusConfirmModal.newStatus}`}
        message={`Are you sure you want to mark Order #${statusConfirmModal.orderNumber} as "${statusConfirmModal.newStatus}"?`}
        confirmLabel={`Mark as ${statusConfirmModal.newStatus}`}
        cancelLabel="Keep Current Status"
        isDestructive={statusConfirmModal.newStatus === 'Cancelled'}
        onConfirm={() => executeStatusChange(statusConfirmModal.orderId, statusConfirmModal.newStatus)}
        onCancel={() => setStatusConfirmModal({ isOpen: false, orderId: '', orderNumber: '', newStatus: 'Pending' })}
      />

      {/* Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#17191D] p-6 rounded-2xl border border-[#30343A] shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#F1F0EC]">Customer Orders &amp; Fulfillment</h1>
            <span className="text-xs font-bold bg-[#1D2025] text-[#C9A96A] border border-[#30343A] px-2.5 py-0.5 rounded-lg">
              {orders.length} Placed
            </span>
          </div>
          <p className="text-xs text-[#85888E] mt-1">
            Track order fulfillment, update delivery status, view customer addresses, and contact buyers directly on WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold bg-[#1D2025] border border-[#30343A] px-4 py-2 rounded-xl text-[#B4B5BA]">
          <span>Total Orders:</span>
          <strong className="text-[#C9A96A] font-bold">{orders.length}</strong>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-[#17191D] p-4 sm:p-5 rounded-2xl border border-[#30343A] shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search Order #, Name, Phone, City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#1D2025] border border-[#343840] text-[#F1F0EC] placeholder-[#85888E] rounded-xl focus:outline-none focus:border-[#C9A96A]"
          />
          <Search className="w-4 h-4 text-[#85888E] absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-[#C9A96A]" />
          <span className="text-xs font-semibold text-[#85888E]">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-[#1D2025] border border-[#343840] rounded-xl font-medium text-[#F1F0EC] focus:outline-none focus:border-[#C9A96A]"
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

      {/* Orders Table */}
      <div className="bg-[#17191D] rounded-2xl border border-[#30343A] shadow-card overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <ShoppingCart className="w-10 h-10 text-[#85888E] mx-auto" />
            <h3 className="text-sm font-bold text-[#F1F0EC]">No orders match your search or filter.</h3>
            <p className="text-xs text-[#85888E]">Customer orders placed on the storefront will appear here instantly.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#1D2025] text-[#C9A96A] uppercase font-bold text-[10px] border-b border-[#30343A]">
                <tr>
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Customer &amp; Phone</th>
                  <th className="p-3.5">City / Province</th>
                  <th className="p-3.5">Items &amp; Details</th>
                  <th className="p-3.5">Total (Rs.)</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
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
                      <td className="p-3.5 font-mono font-bold text-[#C9A96A]">#{ord.orderNumber}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-[#F1F0EC]">{ord.customerName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[#85888E] font-mono text-[11px]">{ord.customerPhone}</span>
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
                      <td className="p-3.5 text-[#F1F0EC]">
                        <div>{ord.city}</div>
                        <span className="text-[10px] text-[#85888E]">{ord.province}</span>
                      </td>
                      <td className="p-3.5 text-[#F1F0EC]">
                        <div className="font-bold">
                          {ord.items.reduce((s, it) => s + it.quantity, 0)} pieces
                        </div>
                        <span className="text-[10px] text-[#85888E] line-clamp-1">
                          {ord.items.map((it) => `${it.quality} ${it.size} x${it.quantity}`).join(', ')}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-[#C9A96A] text-sm">
                        Rs. {ord.totalAmount}
                      </td>
                      <td className="p-3.5">
                        <span className="capitalize font-semibold text-[11px] text-[#B4B5BA]">
                          {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                        </span>
                      </td>
                      <td className="p-3.5">
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
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 bg-[#202329] hover:bg-[#272A2F] border border-[#30343A] text-[#C9A96A] hover:text-[#D8BD88] rounded-xl text-xs font-bold transition-colors"
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
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-[#101114]/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#17191D] rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-elevation border border-[#30343A] space-y-6 max-h-[90vh] overflow-y-auto text-[#F1F0EC]">
            <div className="flex items-center justify-between border-b border-[#30343A] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[#85888E] uppercase tracking-wider">Order Details</span>
                <h3 className="text-xl font-bold text-[#C9A96A]">#{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#85888E] hover:text-[#F1F0EC] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="bg-[#1D2025] p-4 rounded-xl border border-[#30343A] text-xs space-y-2">
              <p>
                <strong className="text-[#85888E]">Customer:</strong> <span className="text-[#F1F0EC] font-bold">{selectedOrder.customerName}</span>
              </p>
              <p>
                <strong className="text-[#85888E]">Phone:</strong> <span className="text-[#F1F0EC] font-mono">{selectedOrder.customerPhone}</span>
              </p>
              {selectedOrder.customerEmail && (
                <p>
                  <strong className="text-[#85888E]">Email:</strong> <span className="text-[#F1F0EC]">{selectedOrder.customerEmail}</span>
                </p>
              )}
              <p>
                <strong className="text-[#85888E]">Delivery Address:</strong> <span className="text-[#F1F0EC]">{selectedOrder.address}, {selectedOrder.city}, {selectedOrder.province}</span>
              </p>
            </div>

            {/* Ordered items breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#85888E] uppercase tracking-wider">
                Garments in Order
              </h4>
              <div className="border border-[#30343A] rounded-xl divide-y divide-[#30343A] overflow-hidden text-xs">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center bg-[#1D2025]">
                    <div>
                      <p className="font-bold text-[#F1F0EC]">{it.productName}</p>
                      <p className="text-[11px] text-[#85888E]">
                        {it.quality} &bull; {it.sleeve} &bull; Size: <span className="text-[#C9A96A] font-bold">{it.size}</span>
                      </p>
                      <p className="text-[11px] text-[#85888E] font-medium">
                        Qty: {it.quantity} x Rs. {it.unitPrice}
                      </p>
                    </div>
                    <div className="font-bold text-[#C9A96A]">Rs. {it.totalPrice}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-[#30343A] pt-3 space-y-1.5 text-xs text-[#B4B5BA]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-[#F1F0EC]">Rs. {selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge:</span>
                <span className="font-semibold text-[#3FB982]">
                  {selectedOrder.deliveryFee === 0 ? 'FREE DELIVERY (3+ pieces)' : `Rs. ${selectedOrder.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#C9A96A] pt-1 border-t border-[#30343A]">
                <span>Total Amount:</span>
                <span>Rs. {selectedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Status changer and WhatsApp in modal */}
            <div className="pt-2 flex items-center justify-between border-t border-[#30343A] flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#85888E]">Update Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleInitiateStatusChange(selectedOrder.id, selectedOrder.orderNumber, e.target.value as OrderStatus)
                  }
                  className="px-3 py-1.5 text-xs font-semibold bg-[#1D2025] text-[#F1F0EC] border border-[#343840] rounded-xl"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st} className="bg-[#17191D] text-[#F1F0EC]">
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <a
                href={`https://wa.me/92${selectedOrder.customerPhone.replace(/^0/, '').replace(/[\s-]/g, '')}?text=${encodeURIComponent(
                  `Assalam-o-Alaikum ${selectedOrder.customerName}, regarding your Order #${selectedOrder.orderNumber} from Amin Raisat Hosiery.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <WhatsAppIcon size={16} className="text-white fill-current" />
                <span>WhatsApp Customer</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
