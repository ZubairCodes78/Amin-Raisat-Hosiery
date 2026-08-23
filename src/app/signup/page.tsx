'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/account';

  const { signUp, user } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // If already signed in, redirect
  React.useEffect(() => {
    if (user) {
      router.push(redirectTarget);
    }
  }, [user, router, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!formData.email.trim()) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await signUp(
        formData.email.trim(),
        formData.password,
        formData.fullName.trim(),
        formData.phone.trim()
      );

      if (error) {
        setErrorMsg(typeof error === 'string' ? error : (error as any)?.message || 'Failed to create account.');
      } else {
        setSuccessMsg('Account created successfully! Continuing to checkout...');
        setTimeout(() => {
          router.push(redirectTarget);
        }, 800);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-dark-surface p-8 sm:p-10 rounded-2xl border border-dark-border shadow-elevation">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <Link href="/" className="inline-block py-1">
          <div className="relative w-48 h-14 mx-auto overflow-hidden">
            <Image
              src="/images/header logo.png"
              alt="Amin Raisat Hosiery"
              fill
              sizes="200px"
              className="object-contain"
            />
          </div>
        </Link>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-100 tracking-tight">
          Create Customer Account
        </h2>
        <p className="text-xs text-gray-400">
          Save your delivery addresses and track your pure cotton garments.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800/60 text-rose-300 rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs flex items-center gap-2.5">
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Full Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Muhammad Usman"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
            />
            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Phone / WhatsApp Number (Optional)
          </label>
          <div className="relative">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="03001234567"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
            />
            <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Email Address <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Create Password <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Confirm Password <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <input
              type="password"
              required
              minLength={6}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Repeat your password"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
            />
            <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 px-4 rounded-xl bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-glow-gold active:scale-[0.99]"
        >
          <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>

      <div className="border-t border-dark-border pt-4 text-center space-y-2">
        <p className="text-xs text-gray-400">
          Already have an account?{' '}
          <Link
            href={`/login${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
            className="font-bold text-gold-400 hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-dark-bg text-gray-100">
      <Suspense fallback={<div className="text-gray-400 text-xs">Loading registration...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
