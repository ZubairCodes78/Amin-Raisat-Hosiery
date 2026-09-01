import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const isValidHttpUrl = (url?: string): boolean => {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const supabaseUrl = isValidHttpUrl(rawUrl)
  ? rawUrl!
  : 'https://placeholder-project.supabase.co';

export function getRuntimeKeyInfo(): {
  serviceRoleKeyPresent: boolean;
  keyType: 'server-secret' | 'publishable' | 'anon' | 'missing';
} {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (serviceKey && serviceKey.length > 20 && !serviceKey.includes('PASTE_')) {
    return { serviceRoleKeyPresent: true, keyType: 'server-secret' };
  }
  if (publishableKey && publishableKey.length > 20 && !publishableKey.includes('PASTE_')) {
    return { serviceRoleKeyPresent: false, keyType: 'publishable' };
  }
  return { serviceRoleKeyPresent: false, keyType: 'missing' };
}

/**
 * Creates a standard server client for public read queries.
 */
export function createServerClient(): SupabaseClient {
  const rawKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

  return createClient(supabaseUrl, rawKey, {
    auth: { persistSession: false },
  });
}

export const supabaseServer = createServerClient();

/**
 * Creates an authoritative Admin client strictly using SUPABASE_SERVICE_ROLE_KEY.
 * REMOVES fallbacks to publishable/anon keys for admin mutations.
 */
export function createAdminClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceKey || serviceKey.length < 20 || serviceKey.includes('PASTE_')) {
    throw new Error(
      'Server Admin Database Configuration Error: SUPABASE_SERVICE_ROLE_KEY is required for admin database operations. Please add SUPABASE_SERVICE_ROLE_KEY to environment variables.'
    );
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}
