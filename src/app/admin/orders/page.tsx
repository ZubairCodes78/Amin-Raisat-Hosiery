'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Order, OrderStatus } from '@/types';
import { Search, Filter, Phone, CheckCircle, Clock, X } from 'lucide-react';
import { WhatsAppIcon } from '@/components/common/WhatsAppIcon';

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
  const { orders, updateOrderStatus } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  return (
    <div className="space-y-6 text-gray-100 max-w-7xl">
      {/* Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-card">
        <div>
          <h1 className="text-xl font-extrabold text-gray-100">Customer Orders</h1>
          <p className="text-xs text-gray-400 mt-1">
            Track order fulfillment, update delivery status, and contact customers directly on WhatsApp.
          </p>
        </div>

        <div className="text-xs font-bold bg-dark-card border border-dark-border px-4 py-2 rounded-xl text-gray-300">
          Total Orders: <strong className="text-gold-400 font-extrabold">{orders.length}</strong>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-dark-surface p-4 sm:p-5 rounded-2xl border border-dark-border shadow-card flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search Order #, Name, Phone, City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-dark-card border border-dark-border text-gray-100 rounded-xl focus:outline-none focus:border-gold-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gold-400" />
          <span className="text-xs font-semibold text-gray-300">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-dark-card border border-dark-border rounded-xl font-medium text-gray-100 focus:outline-none focus:border-gold-500"
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
      <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-card overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-sm font-bold text-gray-200">No orders match your search or filter.</p>
            <p className="text-xs text-gray-400">Orders placed by customers will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-dark-card text-gold-400 uppercase font-bold text-[10px] border-b border-dark-border">
                <tr>
                  <th className="p-3.5">Order #</th>
                  <th className="p-3.5">Customer &amp; Phone</th>
                  <th className="p-3.5">City / Province</th>
                  <th className="p-3.5">Items &amp; Details</th>
                  <th className="p-3.5">Total (Rs.)</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border font-medium text-gray-300">
                {filteredOrders.map((ord) => {
                  const whatsappLink = `https://wa.me/92${ord.customerPhone.replace(/^0/, '').replace(/[\s-]/g, '')}?text=${encodeURIComponent(
                    `Assalam-o-Alaikum ${ord.customerName}, regarding your order #${ord.orderNumber} from Amin Raisat Hosiery.`
                  )}`;

                  return (
                    <tr key={ord.id} className="hover:bg-dark-hover transition-colors">
                      <td className="p-3.5 font-mono font-bold text-gold-400">#{ord.orderNumber}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-gray-100">{ord.customerName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-gray-400 font-mono">{ord.customerPhone}</span>
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
                      <td className="p-3.5 text-gray-300">
                        <div>{ord.city}</div>
                        <span className="text-[10px] text-gray-500">{ord.province}</span>
                      </td>
                      <td className="p-3.5 text-gray-200">
                        <div>
                          {ord.items.reduce((s, it) => s + it.quantity, 0)} pieces
                        </div>
                        <span className="text-[10px] text-gray-400 line-clamp-1">
                          {ord.items.map((it) => `${it.quality} ${it.size} x${it.quantity}`).join(', ')}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-gold-400 text-sm">
                        Rs. {ord.totalAmount}
                      </td>
                      <td className="p-3.5">
                        <span className="capitalize font-semibold text-[11px] text-gray-300">
                          {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={ord.status}
                          onChange={(e) =>
                            handleStatusChange(ord.id, e.target.value as OrderStatus)
                          }
                          className={`px-2.5 py-1 text-xs font-bold rounded-xl border focus:outline-none ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                              : ord.status === 'Cancelled'
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                              : ord.status === 'Pending'
                              ? 'bg-amber-950/60 text-amber-300 border-amber-800/60'
                              : 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                          }`}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st} className="bg-dark-card text-gray-100">
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 bg-dark-card hover:bg-dark-hover border border-dark-border text-gold-400 rounded-xl text-xs font-bold transition-colors"
                        >
                          View
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
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-surface rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-elevation border border-dark-border space-y-6 max-h-[90vh] overflow-y-auto text-gray-100">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Order Details</span>
                <h3 className="text-xl font-bold text-gold-400">#{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white text-sm font-semibold p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="bg-dark-card p-4 rounded-xl border border-dark-border text-xs space-y-2">
              <p>
                <strong>Customer:</strong> {selectedOrder.customerName}
              </p>
              <p>
                <strong>Phone:</strong> {selectedOrder.customerPhone}
              </p>
              {selectedOrder.customerEmail && (
                <p>
                  <strong>Email:</strong> {selectedOrder.customerEmail}
                </p>
              )}
              <p>
                <strong>Address:</strong> {selectedOrder.address}, {selectedOrder.city},{' '}
                {selectedOrder.province}
              </p>
            </div>

            {/* Ordered items breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Garments in Order
              </h4>
              <div className="border border-dark-border rounded-xl divide-y divide-dark-border overflow-hidden text-xs">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center bg-dark-card">
                    <div>
                      <p className="font-bold text-gray-100">{it.productName}</p>
                      <p className="text-[11px] text-gray-400">
                        {it.quality} • {it.sleeve} • Size: {it.size}
                      </p>
                      <p className="text-[11px] text-gold-400 font-semibold">
                        Qty: {it.quantity} x Rs. {it.unitPrice}
                      </p>
                    </div>
                    <div className="font-bold text-gold-400">Rs. {it.totalPrice}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-dark-border pt-3 space-y-1.5 text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-gray-100">Rs. {selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="font-semibold text-emerald-400">
                  {selectedOrder.deliveryFee === 0 ? 'FREE' : `Rs. ${selectedOrder.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-gold-400 pt-1 border-t border-dark-border">
                <span>Total Amount:</span>
                <span>Rs. {selectedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Status changer in modal */}
            <div className="pt-2 flex items-center justify-between border-t border-dark-border">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-300">Update Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="px-3 py-1.5 text-xs font-semibold bg-dark-card text-gray-100 border border-dark-border rounded-xl"
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <a
                href={`https://wa.me/92${selectedOrder.customerPhone.replace(/^0/, '').replace(/[\s-]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-glow-whatsapp"
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
