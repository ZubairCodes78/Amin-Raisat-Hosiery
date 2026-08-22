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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 shadow-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto overflow-hidden flex items-center justify-center">
            <Image
              src="/images/Logo.png"
              alt="Amin Raisat Hosiery"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-950">Owner Admin Login</h1>
            <p className="font-serif italic text-xs sm:text-sm text-gray-500 mt-0.5">
              Amin Raisat Hosiery
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-800">
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
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:bg-white transition-all placeholder:text-gray-400"
                autoFocus
                required
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-6 rounded-lg bg-gray-950 hover:bg-black text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50 hover:shadow-glow-gold"
          >
            <span>{isLoading ? 'Verifying...' : 'Login to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-gray-400">
            Protected Store Owner Management Portal
          </p>
        </div>
      </div>
    </div>
  );
}
