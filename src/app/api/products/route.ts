import { NextResponse } from 'next/server';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SITE_SETTINGS } from '@/data/initialData';

export async function GET() {
  return NextResponse.json({
    products: INITIAL_PRODUCTS,
    categories: INITIAL_CATEGORIES,
    settings: INITIAL_SITE_SETTINGS,
  });
}
