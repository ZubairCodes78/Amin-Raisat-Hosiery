'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle2, X } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/account';

  const { signIn, resetPassword, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');

  // If already signed in, redirect
  React.useEffect(() => {
    if (user) {
      router.push(redirectTarget);
    }
  }, [user, router, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await signIn(cleanEmail, password);
      if (error) {
        setErrorMsg(error);
      } else {
        router.push(redirectTarget);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');

    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address.');
      return;
    }

    try {
      setForgotLoading(true);
      const res = await resetPassword(forgotEmail.trim());
      if (res.error) {
        setForgotError(res.error);
      } else {
        setForgotMessage(res.message || 'Password reset link has been dispatched to your email.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-7 bg-[#17191D] p-8 sm:p-10 rounded-2xl border border-[#30343A] shadow-elevation text-[#F1F0EC]">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <Link href="/" className="inline-block py-1">
          <div className="relative w-52 h-14 mx-auto overflow-hidden">
            <Image
              src="/images/header logo.png"
              alt="Amin Raisat Hosiery"
              fill
              sizes="220px"
              className="object-contain"
              priority
            />
          </div>
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#F1F0EC] tracking-tight">
          Customer Sign In
        </h1>
        <p className="text-xs text-[#85888E]">
          Sign in to access your saved addresses and track your garment orders.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-[#D96B6B]/15 border border-[#D96B6B]/30 text-[#D96B6B] rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#B4B5BA] mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-[#1D2025] border border-[#30343A] rounded-xl text-[#F1F0EC] placeholder-[#85888E] focus:outline-none focus:border-[#C9A96A] transition-colors"
            />
            <Mail className="w-4 h-4 text-[#85888E] absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-[#B4B5BA]">
              Password
            </label>
            <button
              type="button"
              onClick={() => {
                setForgotEmail(email);
                setIsForgotModalOpen(true);
                setForgotError('');
                setForgotMessage('');
              }}
              className="text-[11px] text-[#C9A96A] hover:text-[#D8BD88] transition-colors font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 text-xs bg-[#1D2025] border border-[#30343A] rounded-xl text-[#F1F0EC] placeholder-[#85888E] focus:outline-none focus:border-[#C9A96A] transition-colors"
            />
            <Lock className="w-4 h-4 text-[#85888E] absolute left-3.5 top-3" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-[#85888E] hover:text-[#F1F0EC] absolute right-2.5 top-2.5"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-[#C9A96A] hover:bg-[#D8BD88] disabled:opacity-50 text-[#101114] font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
        >
          <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>

      <div className="border-t border-[#30343A] pt-4 text-center space-y-2">
        <p className="text-xs text-[#85888E]">
          Don&apos;t have an account yet?{' '}
          <Link
            href={`/signup${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
            className="font-bold text-[#C9A96A] hover:underline"
          >
            Create an Account
          </Link>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#101114]/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#17191D] rounded-2xl p-6 sm:p-7 max-w-sm w-full shadow-elevation border border-[#30343A] space-y-4 text-[#F1F0EC]">
            <div className="flex items-center justify-between border-b border-[#30343A] pb-3">
              <h3 className="font-bold text-sm text-[#F1F0EC]">Reset Your Password</h3>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="p-1 text-[#85888E] hover:text-[#F1F0EC] rounded-lg hover:bg-[#202329]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#85888E]">
              Enter your registered email address and we will send you a secure password reset link.
            </p>

            {forgotError && (
              <div className="p-3 bg-[#D96B6B]/15 border border-[#D96B6B]/30 text-[#D96B6B] rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotMessage && (
              <div className="p-3 bg-[#3FB982]/15 border border-[#3FB982]/30 text-[#3FB982] rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{forgotMessage}</span>
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#B4B5BA] font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2 bg-[#1D2025] border border-[#30343A] text-[#F1F0EC] rounded-xl focus:outline-none focus:border-[#C9A96A]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(false)}
                  className="px-4 py-2 bg-[#202329] text-[#85888E] hover:text-[#F1F0EC] rounded-xl font-semibold border border-[#30343A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="px-4 py-2 bg-[#C9A96A] text-[#101114] rounded-xl font-bold hover:bg-[#D8BD88]"
                >
                  {forgotLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-[#101114] text-[#F1F0EC]">
      <Suspense fallback={<div className="text-[#85888E] text-xs">Loading sign-in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
