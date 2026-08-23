'use client';

import React, { useState } from 'react';
import { ProductReview } from '@/types';
import { useStore } from '@/context/StoreContext';
import { Star, MessageSquare, Check, X } from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
  productName: string;
  reviews?: ProductReview[];
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productName, reviews = [] }) => {
  const { submitReview } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : null;

  // Star breakdown calculation
  const starCounts = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
    return { stars, count, percentage };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    await submitReview({
      productId,
      customerName: customerName.trim(),
      customerCity: customerCity.trim() || undefined,
      rating,
      comment: comment.trim(),
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setIsModalOpen(false);
      setCustomerName('');
      setCustomerCity('');
      setComment('');
    }, 2000);
  };

  return (
    <div className="space-y-6 pt-10 border-t border-dark-border select-none">
      {/* Header Summary & Rating Breakdown */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div>
          <h3 className="text-lg font-bold text-gray-100">Customer Reviews</h3>
          {totalReviews > 0 ? (
            <div className="space-y-3 mt-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold text-gold-400">{averageRating}</span>
                <div>
                  <div className="flex text-gold-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(Number(averageRating)) ? 'fill-current' : 'text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 font-normal">Based on {totalReviews} reviews</span>
                </div>
              </div>

              {/* Star Rating Breakdown Bars */}
              <div className="space-y-1.5 w-64 text-xs text-gray-400">
                {starCounts.map((s) => (
                  <div key={s.stars} className="flex items-center gap-2">
                    <span className="w-12 text-[11px] font-medium">{s.stars} stars</span>
                    <div className="flex-1 h-2 bg-dark-surface rounded-full overflow-hidden border border-dark-border">
                      <div
                        className="h-full bg-gold-500 rounded-full"
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                    <span className="w-6 text-[10px] text-gray-500 text-right">{s.count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-1 font-normal">
              No reviews yet. Share your experience with {productName} below!
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-dark-card hover:bg-dark-hover text-gold-400 border border-dark-border hover:border-gold-500 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto shadow-xs"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Reviews List */}
      {totalReviews === 0 ? (
        <div className="p-8 bg-dark-surface rounded-2xl border border-dark-border text-center space-y-2">
          <p className="text-xs font-bold text-gray-200">Authentic Customer Feedback</p>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            We value genuine reviews from real Pakistani customers. Once you receive your order, leave your feedback here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-5 bg-dark-surface rounded-2xl border border-dark-border space-y-2 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-gray-100">{rev.customerName}</span>
                  {rev.customerCity && (
                    <span className="text-xs text-gray-400 ml-1.5">({rev.customerCity})</span>
                  )}
                </div>
                <div className="flex text-gold-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${star <= rev.rating ? 'fill-current' : 'text-gray-600'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">{rev.comment}</p>
              <div className="text-[10px] text-gray-500">
                {new Date(rev.createdAt).toLocaleDateString('en-PK', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Submission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dark-surface rounded-2xl p-6 max-w-md w-full shadow-elevation border border-dark-border space-y-4">
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <h4 className="font-bold text-gray-100 text-sm">Write a Review for {productName}</h4>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSubmitted ? (
              <div className="p-6 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 rounded-xl text-center space-y-2">
                <Check className="w-6 h-6 mx-auto text-emerald-400" />
                <p className="text-xs font-bold">Thank you for your feedback!</p>
                <p className="text-[11px]">Your review has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-gold-500 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${star <= rating ? 'fill-current' : 'text-gray-600'}`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ali Raza"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">City (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Lahore, Karachi, Faisalabad"
                    value={customerCity}
                    onChange={(e) => setCustomerCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Your Review *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Share your thoughts on the fabric quality, stitching, and fit..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="py-2.5 px-4 bg-dark-card text-gray-300 rounded-xl font-semibold hover:bg-dark-hover border border-dark-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 bg-gold-500 text-black rounded-xl font-bold hover:bg-gold-400 shadow-glow-gold"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
