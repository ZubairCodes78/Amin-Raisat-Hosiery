'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/account';

  const { signIn, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already signed in, redirect
  React.useEffect(() => {
    if (user) {
      router.push(redirectTarget);
    }
  }, [user, router, redirectTarget]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await signIn(email.trim(), password);
      if (error) {
        setErrorMsg(typeof error === 'string' ? error : (error as any)?.message || 'Invalid email or password.');
      } else {
        router.push(redirectTarget);
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
          Customer Sign In
        </h2>
        <p className="text-xs text-gray-400">
          Access your saved shipping addresses and order history.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-950/60 border border-rose-800/60 text-rose-300 rounded-xl text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-dark-card border border-dark-border rounded-xl text-gray-100 focus:outline-none focus:border-gold-500"
            />
            <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-300 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
          <span>{loading ? 'Signing in...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>

      <div className="border-t border-dark-border pt-4 text-center space-y-2">
        <p className="text-xs text-gray-400">
          Don&apos;t have an account yet?{' '}
          <Link
            href={`/signup${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
            className="font-bold text-gold-400 hover:underline"
          >
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-dark-bg text-gray-100">
      <Suspense fallback={<div className="text-gray-400 text-xs">Loading sign-in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
