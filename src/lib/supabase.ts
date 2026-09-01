import { createClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const rawKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const isValidHttpUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const supabaseUrl = isValidHttpUrl(rawUrl)
  ? rawUrl!
  : 'https://placeholder-project.supabase.co';

const supabaseKey =
  rawKey && rawKey.length > 20 && !rawKey.includes('PASTE_')
    ? rawKey
    : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

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

// BROWSER CLIENT: Uses publishable/anon key for public reads and customer authentication
// NEVER use this for admin mutations
export const supabaseBrowser = createClient(supabaseUrl, supabaseKey);

// Export structured client modules
export * from './supabase/client';
export * from './supabase/server';
