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

  // Compute all variants and check low stock (<= 10 units)
  const allVariants = products.flatMap((p) => p.variants);
  const lowStockCount = allVariants.filter((v) => v.stock <= 10).length;
  const totalProducts = products.length;

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6 text-gray-100 max-w-7xl">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-card">
        <div>
          <h1 className="text-xl font-extrabold text-gray-100">Store Dashboard</h1>
          <p className="text-xs text-gray-400 mt-1">
            Real-time business performance, order status, and inventory tracking for Amin Raisat Hosiery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-2 bg-gold-500 hover:bg-gold-400 text-black text-xs font-bold py-2.5 px-4 rounded-xl shadow-glow-gold transition-colors"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Manage Products &amp; Prices</span>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Total Sales */}
        <div className="bg-dark-surface p-5 rounded-2xl border border-dark-border shadow-card flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Sales</span>
            <div className="text-2xl font-extrabold text-gold-400 mt-1">
              Rs. {totalSales.toLocaleString()}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">From confirmed customer orders</span>
          </div>
          <div className="p-3 bg-dark-card border border-dark-border text-emerald-400 rounded-xl">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        {/* 2. Total Orders */}
        <div className="bg-dark-surface p-5 rounded-2xl border border-dark-border shadow-card flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Orders</span>
            <div className="text-2xl font-extrabold text-gray-100 mt-1">{totalOrders}</div>
            <span className="text-[11px] text-gray-500 mt-1 block">All placed orders</span>
          </div>
          <div className="p-3 bg-dark-card border border-dark-border text-gold-400 rounded-xl">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        {/* 3. Pending Orders */}
        <div className="bg-dark-surface p-5 rounded-2xl border border-dark-border shadow-card flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Orders</span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">{pendingOrders}</div>
            <span className="text-[11px] text-gray-500 mt-1 block">Awaiting packaging or dispatch</span>
          </div>
          <div className="p-3 bg-dark-card border border-dark-border text-amber-400 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* 4. Delivered Orders */}
        <div className="bg-dark-surface p-5 rounded-2xl border border-dark-border shadow-card flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivered Orders</span>
            <div className="text-2xl font-extrabold text-gray-100 mt-1">{deliveredOrders}</div>
            <span className="text-[11px] text-gray-500 mt-1 block">Completed deliveries</span>
          </div>
          <div className="p-3 bg-dark-card border border-dark-border text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* 5. Products Active */}
        <div className="bg-dark-surface p-5 rounded-2xl border border-dark-border shadow-card flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Live Catalog Products</span>
            <div className="text-2xl font-extrabold text-gray-100 mt-1">{totalProducts}</div>
            <span className="text-[11px] text-gray-500 mt-1 block">Separate HQ &amp; SQ entries</span>
          </div>
          <div className="p-3 bg-dark-card border border-dark-border text-gold-400 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* 6. Low Stock Variants */}
        <div className="bg-dark-surface p-5 rounded-2xl border border-dark-border shadow-card flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Low Stock Warnings</span>
            <div className={`text-2xl font-extrabold mt-1 ${lowStockCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {lowStockCount}
            </div>
            <span className="text-[11px] text-gray-500 mt-1 block">Variants with &le; 10 units</span>
          </div>
          <div className="p-3 bg-dark-card border border-dark-border text-rose-400 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-dark-surface rounded-2xl p-5 sm:p-6 border border-dark-border shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-dark-border pb-3">
          <div>
            <h2 className="text-base font-bold text-gray-100">Recent Customer Orders</h2>
            <p className="text-xs text-gray-400">Latest orders placed on the website</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-gold-400 hover:text-gold-300 flex items-center gap-1 transition-colors"
          >
            <span>View All Orders ({totalOrders})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <p className="text-xs font-bold text-gray-300">No orders received yet.</p>
            <p className="text-xs text-gray-500">
              When customers place an order through the website, it will appear here instantly.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-dark-card text-gold-400 uppercase font-bold text-[10px] border-b border-dark-border">
                <tr>
                  <th className="p-3 rounded-l-xl">Order #</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">City</th>
                  <th className="p-3">Items</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border font-medium text-gray-300">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-dark-hover transition-colors">
                    <td className="p-3 font-mono font-bold text-gold-400">#{ord.orderNumber}</td>
                    <td className="p-3 font-bold text-gray-100">{ord.customerName}</td>
                    <td className="p-3 text-gray-400 font-mono">{ord.customerPhone}</td>
                    <td className="p-3 text-gray-400">{ord.city}</td>
                    <td className="p-3 text-gray-300">
                      {ord.items.reduce((s, it) => s + it.quantity, 0)} pcs
                    </td>
                    <td className="p-3 font-bold text-gold-400">Rs. {ord.totalAmount}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                            : ord.status === 'Pending'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                            : 'bg-blue-950/60 text-blue-300 border border-blue-800/60'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link
                        href="/admin/orders"
                        className="text-xs font-bold text-gold-400 hover:text-gold-300"
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
