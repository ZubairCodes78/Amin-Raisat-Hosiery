'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

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
      setError('Incorrect password. Please verify and try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101114] text-[#F1F0EC] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#17191D] border border-[#30343A] rounded-3xl p-8 sm:p-10 shadow-elevation space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="relative w-20 h-20 sm:w-22 sm:h-22 mx-auto overflow-hidden flex items-center justify-center bg-[#1D2025] rounded-2xl border border-[#30343A] p-2">
            <Image
              src="/images/Favicon Logo.jpeg"
              alt="Amin Raisat Hosiery"
              fill
              className="object-contain rounded-xl"
              priority
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#F1F0EC]">Owner Admin Portal</h1>
            <p className="text-xs sm:text-sm text-[#C9A96A] font-semibold mt-0.5">
              Amin Raisat Hosiery
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-[#D96B6B]/10 border border-[#D96B6B]/30 text-[#D96B6B] rounded-xl text-xs font-semibold text-center animate-in fade-in">
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#D8D8D4]">
              Admin Security Password
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
                className="w-full pl-10 pr-4 py-3 bg-[#1D2025] border border-[#343840] rounded-xl text-xs font-semibold text-[#F1F0EC] focus:border-[#C9A96A] focus:outline-none transition-all placeholder:text-[#85888E]"
                autoFocus
                required
              />
              <Lock className="w-4 h-4 text-[#C9A96A] absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-6 rounded-xl bg-[#C9A96A] hover:bg-[#D8BD88] text-[#101114] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            <span>{isLoading ? 'Authenticating...' : 'Access Admin Dashboard'}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-[11px] text-[#85888E]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3FB982]" />
          <span>Encrypted Store Management Session</span>
        </div>
      </div>
    </div>
  );
}
