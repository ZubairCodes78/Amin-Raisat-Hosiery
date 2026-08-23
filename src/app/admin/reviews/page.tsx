'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Star, Trash2, CheckCircle, XCircle, MessageSquare } from 'lucide-react';

export default function AdminReviewsPage() {
  const { reviews, products, approveReview, deleteReview } = useStore();
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const getProductName = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    return prod ? prod.name : 'General Product';
  };

  return (
    <div className="space-y-6 text-gray-100 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-surface p-6 rounded-2xl border border-dark-border shadow-card">
        <div>
          <h1 className="text-xl font-extrabold text-gray-100">Customer Reviews Moderation</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage authentic reviews submitted by customers on product pages.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-3.5 bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <span>{toast}</span>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-dark-surface rounded-2xl p-12 text-center border border-dark-border space-y-3 shadow-card">
          <MessageSquare className="w-8 h-8 text-gray-500 mx-auto" />
          <h3 className="text-base font-bold text-gray-200">No customer reviews yet</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Reviews submitted by customers on product pages will appear here for moderation.
          </p>
        </div>
      ) : (
        <div className="bg-dark-surface rounded-2xl border border-dark-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-dark-card text-gold-400 font-bold uppercase text-[10px] border-b border-dark-border">
                <tr>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Comment</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border text-gray-300 font-medium">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-dark-hover transition-colors">
                    <td className="p-3.5 font-bold text-gray-100">
                      {rev.customerName}
                      {rev.customerCity && (
                        <span className="block text-[10px] text-gray-400 font-normal">
                          {rev.customerCity}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-gray-200">{getProductName(rev.productId)}</td>
                    <td className="p-3.5">
                      <div className="flex text-gold-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= rev.rating ? 'fill-current' : 'text-gray-600'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-gray-300 max-w-xs">{rev.comment}</td>
                    <td className="p-3.5 text-gray-400 text-[11px]">
                      {new Date(rev.createdAt).toLocaleDateString('en-PK')}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          rev.isApproved
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-800/60'
                        }`}
                      >
                        {rev.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            await approveReview(rev.id, !rev.isApproved);
                            showToast(rev.isApproved ? 'Review hidden' : 'Review approved');
                          }}
                          className={`p-1.5 rounded-lg border ${
                            rev.isApproved
                              ? 'text-amber-400 border-amber-800/60 hover:bg-amber-950/30'
                              : 'text-emerald-400 border-emerald-800/60 hover:bg-emerald-950/30'
                          }`}
                          title={rev.isApproved ? 'Unpublish' : 'Approve'}
                        >
                          {rev.isApproved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm('Delete this review?')) {
                              await deleteReview(rev.id);
                              showToast('Review deleted');
                            }
                          }}
                          className="p-1.5 text-rose-400 hover:bg-rose-950/30 border border-rose-800/60 rounded-lg"
                          title="Delete review"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
