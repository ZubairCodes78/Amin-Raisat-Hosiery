import { NextResponse } from 'next/server';
import { getRuntimeKeyInfo, supabaseUrl } from '@/lib/supabase/server';

/**
 * Diagnostic endpoint to verify production environment configuration.
 * This endpoint checks for the presence of required environment variables
 * without exposing secret values.
 * 
 * SECURITY: This endpoint should be removed after debugging is complete.
 */
export async function GET() {
  const keyInfo = getRuntimeKeyInfo();
  
  // Check which environment variables are present (without exposing values)
  const envChecks = {
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_API_KEY: !!process.env.SUPABASE_API_KEY,
  };

  // Extract project reference from URL for verification
  const urlMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
  const projectRef = urlMatch ? urlMatch[1] : null;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
    supabaseUrl: supabaseUrl,
    projectRef: projectRef,
    expectedProjectRef: 'pqjpgexmupcuuqfzchhc',
    projectRefMatch: projectRef === 'pqjpgexmupcuuqfzchhc',
    serviceRoleKeyPresent: keyInfo.serviceRoleKeyPresent,
    keyType: keyInfo.keyType,
    envVariablesPresent: envChecks,
    criticalIssue: !keyInfo.serviceRoleKeyPresent ? 'SUPABASE_SERVICE_ROLE_KEY is missing from environment' : null,
  });
}
