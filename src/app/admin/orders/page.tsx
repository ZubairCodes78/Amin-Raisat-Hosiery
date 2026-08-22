'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Order, OrderStatus } from '@/types';
import { Search, Filter, Phone, CheckCircle, Clock } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Top Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-950">Customer Orders</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Track order fulfillment, update delivery status, and contact customers directly on WhatsApp.
          </p>
        </div>

        <div className="text-xs font-semibold bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-xs text-gray-700">
          Total Orders: <strong className="text-gray-950 font-bold">{orders.length}</strong>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Order #, Name, Phone, City..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-black"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-xs font-semibold text-gray-700">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-lg font-medium focus:outline-none"
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
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <p className="text-sm font-bold text-gray-950">No orders match your search or filter.</p>
            <p className="text-xs text-gray-500">Orders placed by customers will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-900 uppercase font-bold">
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
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredOrders.map((ord) => {
                  const whatsappLink = `https://wa.me/92${ord.customerPhone.replace(/^0/, '').replace(/[\s-]/g, '')}?text=${encodeURIComponent(
                    `Assalam-o-Alaikum ${ord.customerName}, regarding your order #${ord.orderNumber} from Amin Raisat Hosiery.`
                  )}`;

                  return (
                    <tr key={ord.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-gray-950">#{ord.orderNumber}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-gray-950">{ord.customerName}</div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-gray-600 font-mono">{ord.customerPhone}</span>
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
                      <td className="p-3.5 text-gray-700">
                        <div>{ord.city}</div>
                        <span className="text-[10px] text-gray-500">{ord.province}</span>
                      </td>
                      <td className="p-3.5 text-gray-800">
                        <div>
                          {ord.items.reduce((s, it) => s + it.quantity, 0)} pieces
                        </div>
                        <span className="text-[10px] text-gray-500 line-clamp-1">
                          {ord.items.map((it) => `${it.quality} ${it.size} x${it.quantity}`).join(', ')}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-gray-950 text-sm">
                        Rs. {ord.totalAmount}
                      </td>
                      <td className="p-3.5">
                        <span className="capitalize font-semibold text-[11px] text-gray-700">
                          {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <select
                          value={ord.status}
                          onChange={(e) =>
                            handleStatusChange(ord.id, e.target.value as OrderStatus)
                          }
                          className={`px-2.5 py-1 text-xs font-semibold rounded-md border focus:outline-none ${
                            ord.status === 'Delivered'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : ord.status === 'Cancelled'
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : ord.status === 'Pending'
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-blue-50 text-blue-900 border-blue-300'
                          }`}
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1 bg-gray-950 hover:bg-black text-white rounded text-xs font-semibold"
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-gray-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Order Details</span>
                <h3 className="text-xl font-bold text-gray-950">#{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-black text-sm font-semibold p-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Customer & Address Details */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-xs space-y-2">
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
              {selectedOrder.orderNotes && (
                <p>
                  <strong>Notes:</strong> {selectedOrder.orderNotes}
                </p>
              )}
              {selectedOrder.paymentReference && (
                <p>
                  <strong>Payment Reference:</strong> {selectedOrder.paymentReference}
                </p>
              )}
            </div>

            {/* Ordered items breakdown */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Products in Order
              </h4>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden text-xs">
                {selectedOrder.items.map((it, idx) => (
                  <div key={idx} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-950">{it.productName}</p>
                      <p className="text-[11px] text-gray-500">
                        {it.quality} • {it.sleeve} • Size: {it.size}
                      </p>
                      <p className="text-[11px] text-gray-600 font-semibold">
                        Qty: {it.quantity} x Rs. {it.unitPrice}
                      </p>
                    </div>
                    <div className="font-bold text-gray-950">Rs. {it.totalPrice}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-3 space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold">Rs. {selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span className="font-semibold">
                  {selectedOrder.deliveryFee === 0 ? 'FREE' : `Rs. ${selectedOrder.deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-950 pt-1 border-t border-gray-100">
                <span>Total Amount:</span>
                <span>Rs. {selectedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Status changer in modal */}
            <div className="pt-2 flex items-center justify-between border-t border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-800">Update Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) =>
                    handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)
                  }
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 rounded-lg"
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
                className="px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs"
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
