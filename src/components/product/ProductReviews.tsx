'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductReview } from '@/types';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import {
  Star,
  MessageSquare,
  Check,
  X,
  Lock,
  Clock,
  ShoppingBag,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface ProductReviewsProps {
  productId: string;
  productName: string;
  reviews?: ProductReview[];
}

interface EligibilityState {
  loading: boolean;
  eligible: boolean;
  unauthenticated?: boolean;
  alreadyReviewed?: boolean;
  neverPurchased?: boolean;
  hasPendingOrder?: boolean;
  orderId?: string;
  orderNumber?: string;
  reason?: string;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  productId,
  productName,
  reviews = [],
}) => {
  const { submitReview } = useStore();
  const { user, session, profile } = useAuth();

  const [eligibility, setEligibility] = useState<EligibilityState>({
    loading: true,
    eligible: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Check Review Eligibility
  useEffect(() => {
    let isMounted = true;

    async function checkEligibility() {
      if (!user) {
        if (isMounted) {
          setEligibility({
            loading: false,
            eligible: false,
            unauthenticated: true,
            reason: "Please sign in to review a product you've purchased.",
          });
        }
        return;
      }

      try {
        setEligibility((prev) => ({ ...prev, loading: true }));
        const headers: Record<string, string> = {};
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        const res = await fetch(
          `/api/reviews/eligibility?productId=${encodeURIComponent(productId)}`,
          { headers }
        );
        const data = await res.json().catch(() => ({}));

        if (!isMounted) return;

        if (res.ok) {
          setEligibility({
            loading: false,
            eligible: !!data.eligible,
            unauthenticated: !!data.unauthenticated,
            alreadyReviewed: !!data.alreadyReviewed,
            neverPurchased: !!data.neverPurchased,
            hasPendingOrder: !!data.hasPendingOrder,
            orderId: data.orderId,
            orderNumber: data.orderNumber,
            reason: data.reason,
          });
        } else {
          setEligibility({
            loading: false,
            eligible: false,
            reason: data.error || 'Unable to check review eligibility.',
          });
        }
      } catch (err) {
        if (isMounted) {
          setEligibility({
            loading: false,
            eligible: false,
            reason: 'Unable to check review eligibility.',
          });
        }
      }
    }

    checkEligibility();

    return () => {
      isMounted = false;
    };
  }, [productId, user, session?.access_token]);

  // Pre-fill profile name
  useEffect(() => {
    if (profile?.fullName) {
      setCustomerName(profile.fullName);
    } else if (user?.user_metadata?.full_name) {
      setCustomerName(user.user_metadata.full_name);
    }
  }, [profile, user]);

  // Close review modal on Escape
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isModalOpen]);

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
    setSubmitError('');

    if (!customerName.trim() || !comment.trim()) {
      setSubmitError('Please provide your name and review message.');
      return;
    }

    try {
      setIsSubmitting(true);
      await submitReview(
        {
          productId,
          orderId: eligibility.orderId,
          customerName: customerName.trim(),
          customerCity: customerCity.trim() || undefined,
          rating,
          comment: comment.trim(),
        },
        session?.access_token
      );

      setIsSubmitted(true);
      setEligibility((prev) => ({
        ...prev,
        eligible: false,
        alreadyReviewed: true,
      }));

      setTimeout(() => {
        setIsSubmitted(false);
        setIsModalOpen(false);
        setComment('');
      }, 2000);
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
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
              No reviews yet. Genuine customer experiences will appear here.
            </p>
          )}
        </div>

        {/* Dynamic Eligibility Actions / Status Notice */}
        <div className="self-start sm:self-auto max-w-sm">
          {eligibility.loading ? (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-dark-surface border border-dark-border rounded-xl text-xs text-gray-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
              <span>Checking review status...</span>
            </div>
          ) : !user ? (
            <div className="p-3.5 bg-dark-surface border border-dark-border rounded-xl flex flex-col gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <Lock className="w-4 h-4 text-gold-400 flex-shrink-0" />
                <span>Please sign in to review a product you&apos;ve purchased.</span>
              </div>
              <Link
                href={`/login?redirect=/product/${encodeURIComponent(productId)}#reviews-section`}
                className="w-full text-center py-2 px-3 bg-dark-card hover:bg-dark-hover border border-dark-border hover:border-gold-500 text-gold-400 font-bold rounded-lg text-xs transition-colors"
              >
                Sign In to Review
              </Link>
            </div>
          ) : eligibility.alreadyReviewed ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 rounded-xl text-xs font-semibold">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>You have reviewed this product</span>
            </div>
          ) : eligibility.hasPendingOrder ? (
            <div className="p-3 bg-amber-950/30 border border-amber-800/40 text-amber-300 rounded-xl text-xs flex items-center gap-2.5">
              <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Reviews are available after your order has been delivered.</span>
            </div>
          ) : eligibility.neverPurchased ? (
            <div className="p-3 bg-dark-surface border border-dark-border text-gray-400 rounded-xl text-xs flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>Only customers who have received this product can leave a review.</span>
            </div>
          ) : eligibility.eligible ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-dark-card hover:bg-dark-hover text-gold-400 border border-dark-border hover:border-gold-500 rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Write a Review</span>
            </button>
          ) : (
            <div className="p-3 bg-dark-surface border border-dark-border text-gray-400 rounded-xl text-xs">
              {eligibility.reason || 'Review submission is currently restricted.'}
            </div>
          )}
        </div>
      </div>

      {/* Reviews List */}
      {totalReviews === 0 ? (
        <div className="p-8 bg-dark-surface rounded-2xl border border-dark-border text-center space-y-2">
          <p className="text-xs font-bold text-gray-200">Authentic Customer Feedback</p>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            We value genuine reviews from verified Pakistani customers. Once your order has been delivered, leave your feedback here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 bg-dark-surface rounded-2xl border border-dark-border space-y-2 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-gray-100">{rev.customerName}</span>
                  {rev.customerCity && (
                    <span className="text-xs text-gray-400">({rev.customerCity})</span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded-md">
                    <Check className="w-2.5 h-2.5" />
                    <span>Verified Purchase</span>
                  </span>
                </div>
                <div className="flex text-gold-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= rev.rating ? 'fill-current' : 'text-gray-600'
                      }`}
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

      {/* Review Submission Modal (ONLY for verified eligible delivered customers) */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-dark-surface rounded-2xl p-6 max-w-md w-full shadow-elevation border border-dark-border space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-dark-border pb-3">
              <div>
                <h4 className="font-bold text-gray-100 text-sm">Write a Review for {productName}</h4>
                {eligibility.orderNumber && (
                  <span className="text-[10px] text-gold-400 font-mono">
                    Verified Order #{eligibility.orderNumber}
                  </span>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isSubmitted ? (
              <div className="p-6 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 rounded-xl text-center space-y-2">
                <Check className="w-6 h-6 mx-auto text-emerald-400" />
                <p className="text-xs font-bold">Thank you for your feedback!</p>
                <p className="text-[11px]">Your verified review has been published successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                {submitError && (
                  <div className="p-3 bg-rose-950/40 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{submitError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-gray-300 mb-1">Your Rating *</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 text-gold-500 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= rating ? 'fill-current' : 'text-gray-600'
                          }`}
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
                    placeholder="Share your experience with the combed cotton fabric, stitching, and fit..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-dark-card border border-dark-border text-gray-100 rounded-xl focus:outline-none focus:border-gold-500"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="py-2.5 px-4 bg-dark-card text-gray-300 rounded-xl font-semibold hover:bg-dark-hover border border-dark-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="py-2.5 px-5 bg-gold-500 text-black rounded-xl font-bold hover:bg-gold-400 shadow-glow-gold flex items-center gap-2"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
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
