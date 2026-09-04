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

      if (Array.isArray(products)) {
        const formatted = products.map((p: any) => {
          const mediaList = Array.isArray(p.product_media) ? p.product_media : [];
          const videoMedia = mediaList.find((m: any) => m.media_type === 'video');
          const sizeGuideMedia = mediaList.find((m: any) => m.media_type === 'size_guide');
          return {
            ...p,
            shortDescription: p.short_description || p.subtitle || '',
            videoUrl: p.video_url || videoMedia?.url || undefined,
            sizeGuideUrl: p.size_guide_url || sizeGuideMedia?.url || undefined,
          };
        });

        return NextResponse.json({
          products: formatted,
          categories: categories || INITIAL_CATEGORIES,
          settings: INITIAL_SITE_SETTINGS,
        });
      }
    } catch (err) {
      console.warn('API Products live fetch error', err);
    }
  }

  return NextResponse.json({
    products: [],
    categories: INITIAL_CATEGORIES,
    settings: INITIAL_SITE_SETTINGS,
  });
}

