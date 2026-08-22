'use client';

import React from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import {
  ShoppingCart,
  Clock,
  CheckCircle2,
  Banknote,
  Package,
  AlertTriangle,
  ArrowRight,
  Plus,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { orders, products } = useStore();

  // Metrics calculated from real data
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'Pending' || o.status === 'Processing').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const totalSales = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);

  // Compute all variants and check low stock (< 10 units)
  const allVariants = products.flatMap((p) => p.variants);
  const lowStockCount = allVariants.filter((v) => v.stock <= 10).length;
  const totalProducts = products.length;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-950">Store Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Real-time business performance, order status, and inventory tracking for Amin Raisat Hosiery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 bg-gray-950 hover:bg-black text-white text-xs font-semibold py-2.5 px-4 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-300" />
            <span>Manage Products &amp; Prices</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sales</span>
            <div className="text-2xl font-bold text-gray-950 mt-1">
              Rs. {totalSales.toLocaleString()}
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">From confirmed customer orders</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        {/* 2. Total Orders */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Orders</span>
            <div className="text-2xl font-bold text-gray-950 mt-1">{totalOrders}</div>
            <span className="text-[11px] text-gray-400 mt-1 block">All placed orders</span>
          </div>
          <div className="p-3 bg-gray-100 text-gray-900 rounded-lg">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        {/* 3. Pending Orders */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Orders</span>
            <div className="text-2xl font-bold text-amber-600 mt-1">{pendingOrders}</div>
            <span className="text-[11px] text-gray-400 mt-1 block">Awaiting packaging or dispatch</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* 4. Delivered Orders */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivered Orders</span>
            <div className="text-2xl font-bold text-gray-950 mt-1">{deliveredOrders}</div>
            <span className="text-[11px] text-gray-400 mt-1 block">Completed deliveries</span>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* 5. Products Active */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Products</span>
            <div className="text-2xl font-bold text-gray-950 mt-1">{totalProducts}</div>
            <span className="text-[11px] text-gray-400 mt-1 block">Men&apos;s Pure Cotton Vest</span>
          </div>
          <div className="p-3 bg-gray-100 text-gray-900 rounded-lg">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* 6. Low Stock Variants */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex items-start justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Low Stock Warnings</span>
            <div className={`text-2xl font-bold mt-1 ${lowStockCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {lowStockCount}
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">Variants with &le; 10 units</span>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-950">Recent Customer Orders</h2>
            <p className="text-xs text-gray-500">Latest orders placed on the website</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-semibold text-gray-900 hover:text-black flex items-center gap-1"
          >
            <span>View All Orders ({totalOrders})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-xs font-bold text-gray-900">No orders received yet.</p>
            <p className="text-xs text-gray-500">
              When customers place an order through the website, it will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-900 uppercase font-bold">
                <tr>
                  <th className="p-3 rounded-l-lg">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-gray-950">#{ord.orderNumber}</td>
                    <td className="p-3 font-bold text-gray-900">{ord.customerName}</td>
                    <td className="p-3 text-gray-600">{ord.customerPhone}</td>
                    <td className="p-3 text-gray-600">{ord.city}</td>
                    <td className="p-3 text-gray-700">
                      {ord.items.reduce((s, it) => s + it.quantity, 0)} pcs
                    </td>
                    <td className="p-3 font-bold text-gray-950">Rs. {ord.totalAmount}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.status === 'Pending'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-100 text-blue-900'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link
                        href="/admin/orders"
                        className="text-xs font-semibold text-gray-900 hover:text-black hover:underline"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
