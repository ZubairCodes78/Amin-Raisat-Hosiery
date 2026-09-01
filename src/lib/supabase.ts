// Supabase client and server configuration for Amin Raisat Hosiery
export * from './supabase/client';
export * from './supabase/server';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const rawKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const isValidHttpUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = (): boolean => {
  return (
    isValidHttpUrl(rawUrl) &&
    !rawUrl!.includes('placeholder') &&
    !!rawKey &&
    !rawKey.includes('placeholder') &&
    !rawKey.includes('PASTE_') &&
    rawKey.length > 20
  );
};

