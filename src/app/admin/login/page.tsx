'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';

const ADMIN_AUTH_KEY = 'arh_admin_auth_token_v1';
const REQUIRED_ADMIN_PASS = 'Amin7866@';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password === REQUIRED_ADMIN_PASS) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'authenticated');
      router.push('/admin');
    } else {
      setError('Incorrect password. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-dark-surface border border-dark-border rounded-3xl p-8 sm:p-10 shadow-elevation space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto overflow-hidden flex items-center justify-center">
            <Image
              src="/images/Favicon Logo.jpeg"
              alt="Amin Raisat Hosiery"
              fill
              className="object-contain rounded-2xl"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-100">Owner Admin Login</h1>
            <p className="font-serif italic text-xs sm:text-sm text-gold-400 mt-0.5">
              Amin Raisat Hosiery
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-rose-950/60 border border-rose-800/60 text-rose-300 rounded-xl text-xs font-semibold text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-300">
              Admin Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                className="w-full pl-10 pr-4 py-3 bg-dark-card border border-dark-border rounded-xl text-sm text-gray-100 focus:outline-none focus:border-gold-500 transition-all placeholder:text-gray-500"
                autoFocus
                required
              />
              <Lock className="w-4 h-4 text-gold-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-gold-500 hover:bg-gold-400 text-black font-bold text-xs shadow-glow-gold transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            <span>{isLoading ? 'Verifying...' : 'Login to Dashboard'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-gray-500">
            Protected Store Owner Management Portal
          </p>
        </div>
      </div>
    </div>
  );
}
