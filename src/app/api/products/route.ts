import { NextResponse } from 'next/server';
import { supabaseServer, isSupabaseConfigured } from '@/lib/supabase';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SITE_SETTINGS } from '@/data/initialData';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  if (isSupabaseConfigured()) {
    try {
      const [{ data: products }, { data: categories }] = await Promise.all([
        supabaseServer.from('products').select('*, product_variants(*), product_media(*)').eq('is_published', true),
        supabaseServer.from('categories').select('*, subcategories(*)').eq('is_active', true),
      ]);

      if (products && products.length > 0) {
        return NextResponse.json({
          products,
          categories: categories || INITIAL_CATEGORIES,
          settings: INITIAL_SITE_SETTINGS,
        });
      }
    } catch (err) {
      console.warn('API Products live fetch error', err);
    }
  }

  return NextResponse.json({
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    settings: INITIAL_SITE_SETTINGS,
  });
}

