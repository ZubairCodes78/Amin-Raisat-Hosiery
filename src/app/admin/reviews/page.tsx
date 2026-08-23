'use client';

import React, { useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { Star, Trash2, CheckCircle, XCircle, MessageSquare, Check } from 'lucide-react';
import { ConfirmModal } from '@/components/admin/ConfirmModal';

export default function AdminReviewsPage() {
  const { reviews, products, approveReview, deleteReview } = useStore();
  const [toast, setToast] = useState('');

  // Delete Confirm Modal
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; reviewId: string; author: string }>({
    isOpen: false,
    reviewId: '',
    author: '',
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const getProductName = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    return prod ? prod.name : 'General Catalog Item';
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal.reviewId) return;
    try {
      await deleteReview(deleteModal.reviewId);
      showToast(`Review by "${deleteModal.author}" deleted.`);
    } catch (err) {
      showToast('Error deleting review.');
    } finally {
      setDeleteModal({ isOpen: false, reviewId: '', author: '' });
    }
  };

  return (
    <div className="space-y-6 text-[#F1F0EC] max-w-7xl">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-[#17191D] text-[#F1F0EC] border border-[#3FB982]/40 rounded-xl shadow-elevation flex items-center gap-2.5 text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-[#3FB982]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Customer Review"
        message={`Are you sure you want to permanently delete the review submitted by "${deleteModal.author}"?`}
        confirmLabel="Delete Review"
        cancelLabel="Cancel"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, reviewId: '', author: '' })}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#17191D] p-6 rounded-2xl border border-[#30343A] shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#F1F0EC]">Customer Reviews &amp; Social Proof</h1>
            <span className="text-xs font-bold bg-[#1D2025] text-[#C9A96A] border border-[#30343A] px-2.5 py-0.5 rounded-lg">
              {reviews.length} Reviews
            </span>
          </div>
          <p className="text-xs text-[#85888E] mt-1">
            Moderate authentic customer reviews and ratings submitted on product pages. Only approved reviews display publicly.
          </p>
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="bg-[#17191D] rounded-2xl p-12 text-center border border-[#30343A] space-y-3 shadow-card">
          <MessageSquare className="w-10 h-10 text-[#85888E] mx-auto" />
          <h3 className="text-base font-bold text-[#F1F0EC]">No Customer Reviews Yet</h3>
          <p className="text-xs text-[#85888E] max-w-sm mx-auto">
            Reviews submitted by customers on product pages will appear here for moderation.
          </p>
        </div>
      ) : (
        <div className="bg-[#17191D] rounded-2xl border border-[#30343A] shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#1D2025] text-[#C9A96A] font-bold uppercase text-[10px] border-b border-[#30343A]">
                <tr>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Product</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Comment</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#272A2F] text-[#B4B5BA] font-medium">
                {reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-[#1D2025]/60 transition-colors">
                    <td className="p-3.5 font-bold text-[#F1F0EC]">
                      {rev.customerName}
                      {rev.customerCity && (
                        <span className="block text-[10px] text-[#85888E] font-normal">
                          {rev.customerCity}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-[#F1F0EC]">{getProductName(rev.productId)}</td>
                    <td className="p-3.5">
                      <div className="flex text-[#C9A96A]">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-current' : 'text-[#30343A]'}`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 text-[#F1F0EC] max-w-xs">{rev.comment}</td>
                    <td className="p-3.5 text-[#85888E] text-[11px]">
                      {new Date(rev.createdAt).toLocaleDateString('en-PK')}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          rev.isApproved
                            ? 'bg-[#3FB982]/15 text-[#3FB982] border border-[#3FB982]/30'
                            : 'bg-[#D6A84F]/15 text-[#D6A84F] border border-[#D6A84F]/30'
                        }`}
                      >
                        {rev.isApproved ? 'Live on Store' : 'Pending Moderation'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={async () => {
                            await approveReview(rev.id, !rev.isApproved);
                            showToast(rev.isApproved ? 'Review hidden from storefront' : 'Review approved and published live');
                          }}
                          className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
                            rev.isApproved
                              ? 'text-[#D6A84F] border-[#D6A84F]/30 hover:bg-[#D6A84F]/10'
                              : 'text-[#3FB982] border-[#3FB982]/30 hover:bg-[#3FB982]/10'
                          }`}
                          title={rev.isApproved ? 'Unpublish from store' : 'Approve for public store'}
                        >
                          {rev.isApproved ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          <span className="hidden sm:inline">{rev.isApproved ? 'Unpublish' : 'Approve'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setDeleteModal({
                              isOpen: true,
                              reviewId: rev.id,
                              author: rev.customerName,
                            });
                          }}
                          className="p-1.5 text-[#D96B6B] hover:bg-[#D96B6B]/10 border border-[#D96B6B]/30 rounded-xl"
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
