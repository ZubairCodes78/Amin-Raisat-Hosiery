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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-950">Customer Reviews Moderation</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage authentic reviews submitted by customers on product pages.
          </p>
        </div>
      </div>

      {toast && (
        <div className="p-3 bg-gray-900 text-white rounded-lg text-xs font-semibold flex items-center gap-2">
          <span>{toast}</span>
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 space-y-3">
          <MessageSquare className="w-8 h-8 text-gray-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-950">No customer reviews yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Reviews submitted by customers on product pages will appear here for moderation.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-900 font-bold uppercase">
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
              <tbody className="divide-y divide-gray-100">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-gray-50/50">
                    <td className="p-3.5 font-bold text-gray-950">
                      {rev.customerName}
                      {rev.customerCity && (
                        <span className="block text-[10px] text-gray-500 font-normal">
                          {rev.customerCity}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 font-medium text-gray-800">{getProductName(rev.productId)}</td>
                    <td className="p-3.5">
                      <div className="flex text-amber-500">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= rev.rating ? 'fill-current' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-gray-700 max-w-xs">{rev.comment}</td>
                    <td className="p-3.5 text-gray-500 text-[11px]">
                      {new Date(rev.createdAt).toLocaleDateString('en-PK')}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          rev.isApproved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                          className={`p-1.5 rounded ${
                            rev.isApproved
                              ? 'text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
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
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
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
