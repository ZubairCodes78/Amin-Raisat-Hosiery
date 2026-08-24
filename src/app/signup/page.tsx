'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Lock, Mail, User, Phone, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/account';

  const { signUp, user } = useAuth();
  const { isDark } = useTheme();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
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

    const cleanFullName = formData.fullName.trim();
    const cleanEmail = formData.email.trim();
    const cleanPhone = formData.phone.trim();

    if (!cleanFullName) {
      setErrorMsg('Please enter your full name.');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-type your password.');
      return;
    }

    try {
      setLoading(true);
      const { error } = await signUp(
        cleanEmail,
        formData.password,
        cleanFullName,
        cleanPhone
      );

      if (error) {
        setErrorMsg(error);
      } else {
        setSuccessMsg('Account created successfully! Continuing...');
        setTimeout(() => {
          router.push(redirectTarget);
        }, 700);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const logoSrc = isDark ? '/images/header logo.png' : '/images/light logo.jpeg';

  return (
    <div className="max-w-md w-full space-y-7 bg-white dark:bg-[#17191D] p-8 sm:p-10 rounded-2xl border border-light-border dark:border-[#30343A] shadow-sm dark:shadow-elevation text-charcoal-900 dark:text-[#F1F0EC]">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <Link href="/" className="inline-block py-1">
          <div className="relative w-52 h-14 mx-auto overflow-hidden">
            <Image
              src={logoSrc}
              alt="Amin Raisat Hosiery"
              fill
              sizes="220px"
              className="object-contain"
              priority
            />
          </div>
        </Link>
        <h1 className="text-xl sm:text-2xl font-extrabold text-charcoal-900 dark:text-[#F1F0EC] tracking-tight">
          Create Customer Account
        </h1>
        <p className="text-xs text-charcoal-500 dark:text-[#85888E]">
          Save delivery addresses, earn free delivery perks, and track orders.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 dark:bg-[#D96B6B]/15 border border-rose-200 dark:border-[#D96B6B]/30 text-rose-700 dark:text-[#D96B6B] rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-[#3FB982]/15 border border-emerald-200 dark:border-[#3FB982]/30 text-emerald-700 dark:text-[#3FB982] rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B4B5BA] mb-1">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              autoComplete="name"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="e.g. Muhammad Usman"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] rounded-xl text-charcoal-900 dark:text-[#F1F0EC] placeholder-charcoal-400 dark:placeholder-[#85888E] focus:outline-none focus:border-[#C9A96A] transition-colors"
            />
            <User className="w-4 h-4 text-charcoal-400 dark:text-[#85888E] absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B4B5BA] mb-1">
            Phone / WhatsApp Number (Optional)
          </label>
          <div className="relative">
            <input
              type="tel"
              autoComplete="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="03001234567"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] rounded-xl text-charcoal-900 dark:text-[#F1F0EC] placeholder-charcoal-400 dark:placeholder-[#85888E] focus:outline-none focus:border-[#C9A96A] transition-colors"
            />
            <Phone className="w-4 h-4 text-charcoal-400 dark:text-[#85888E] absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B4B5BA] mb-1">
            Email Address <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="name@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] rounded-xl text-charcoal-900 dark:text-[#F1F0EC] placeholder-charcoal-400 dark:placeholder-[#85888E] focus:outline-none focus:border-[#C9A96A] transition-colors"
            />
            <Mail className="w-4 h-4 text-charcoal-400 dark:text-[#85888E] absolute left-3.5 top-3" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B4B5BA] mb-1">
            Create Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimum 6 characters"
              className="w-full pl-10 pr-10 py-2.5 text-xs bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] rounded-xl text-charcoal-900 dark:text-[#F1F0EC] placeholder-charcoal-400 dark:placeholder-[#85888E] focus:outline-none focus:border-[#C9A96A] transition-colors"
            />
            <Lock className="w-4 h-4 text-charcoal-400 dark:text-[#85888E] absolute left-3.5 top-3" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 text-charcoal-400 dark:text-[#85888E] hover:text-charcoal-900 dark:hover:text-[#F1F0EC] absolute right-2.5 top-2.5"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-charcoal-700 dark:text-[#B4B5BA] mb-1">
            Confirm Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Repeat your password"
              className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-white dark:bg-[#1D2025] border border-light-border dark:border-[#30343A] rounded-xl text-charcoal-900 dark:text-[#F1F0EC] placeholder-charcoal-400 dark:placeholder-[#85888E] focus:outline-none focus:border-[#C9A96A] transition-colors"
            />
            <Lock className="w-4 h-4 text-charcoal-400 dark:text-[#85888E] absolute left-3.5 top-3" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-champagne-500 hover:bg-champagne-400 disabled:opacity-50 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-xs active:scale-[0.99] mt-2"
        >
          <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          <ArrowRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </form>

      <div className="border-t border-light-border dark:border-[#30343A] pt-4 text-center space-y-2">
        <p className="text-xs text-charcoal-500 dark:text-[#85888E]">
          Already have an account?{' '}
          <Link
            href={`/login${redirectTarget ? `?redirect=${encodeURIComponent(redirectTarget)}` : ''}`}
            className="font-bold text-[#A07D38] dark:text-[#C9A96A] hover:underline"
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
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 bg-light-bg dark:bg-[#101114] text-charcoal-900 dark:text-[#F1F0EC] transition-colors duration-200">
      <Suspense fallback={<div className="text-charcoal-500 dark:text-[#85888E] text-xs">Loading registration...</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
