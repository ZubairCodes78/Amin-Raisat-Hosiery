-- ==============================================================================
-- Amin Raisat Hosiery — Safe Production Database Migration (V2)
-- File: supabase/safe_production_migration_v2.sql
-- 
-- KEY SAFETY PRINCIPLES:
-- 1. 100% Non-destructive: NO DROP TABLE, NO TRUNCATE, NO DELETE.
-- 2. Fully Idempotent: Can be executed 1, 2, or 100 times safely without error.
-- 3. Preserves all existing production products (including ID f0000000-0000-0000-0000-000000000001).
-- 4. Preserves all customer orders, existing product variants, images, and reviews.
-- 5. Safe conditional inserts using "WHERE NOT EXISTS" to prevent constraint collisions.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. HERO SLIDES — ADD DEVICE_TYPE SUPPORT & SEED MOBILE SLIDES SAFELY
-- ==============================================================================
DO $$
BEGIN
    -- Add device_type column if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'hero_slides' 
          AND column_name = 'device_type'
    ) THEN
        ALTER TABLE public.hero_slides 
        ADD COLUMN device_type TEXT NOT NULL DEFAULT 'desktop';
    END IF;
END $$;

-- Ensure all existing hero slides have a valid device_type
UPDATE public.hero_slides 
SET device_type = 'desktop' 
WHERE device_type IS NULL;

-- Safely insert Desktop Slide 1 if missing
INSERT INTO public.hero_slides (id, device_type, desktop_image, mobile_image, title, subtitle, link, button_text, display_order, is_active)
SELECT 
    'd0000000-0000-0000-0000-000000000001'::uuid, 
    'desktop', 
    '/images/slider 1.png', 
    '/images/slider 1.png', 
    'Slider 1', 
    '100% Fine Combed Cotton Vests & Innerwear', 
    '/shop', 
    'Shop Collection', 
    1, 
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.hero_slides WHERE id = 'd0000000-0000-0000-0000-000000000001'::uuid
);

-- Safely insert Desktop Slide 2 if missing
INSERT INTO public.hero_slides (id, device_type, desktop_image, mobile_image, title, subtitle, link, button_text, display_order, is_active)
SELECT 
    'd0000000-0000-0000-0000-000000000002'::uuid, 
    'desktop', 
    '/images/slider 2.png', 
    '/images/slider 2.png', 
    'Slider 2', 
    'Engineered for Lasting Comfort Across Pakistan', 
    '/shop', 
    'Explore Vests', 
    2, 
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.hero_slides WHERE id = 'd0000000-0000-0000-0000-000000000002'::uuid
);

-- Safely insert Mobile Slide 1 if missing
INSERT INTO public.hero_slides (id, device_type, desktop_image, mobile_image, title, subtitle, link, button_text, display_order, is_active)
SELECT 
    'd0000000-0000-0000-0000-000000000011'::uuid, 
    'mobile', 
    '/images/mobile slider 1.png', 
    '/images/mobile slider 1.png', 
    'Mobile Slider 1', 
    '100% Fine Combed Cotton Vests & Innerwear', 
    '/shop', 
    'Shop Collection', 
    1, 
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.hero_slides WHERE id = 'd0000000-0000-0000-0000-000000000011'::uuid
);

-- Safely insert Mobile Slide 2 if missing
INSERT INTO public.hero_slides (id, device_type, desktop_image, mobile_image, title, subtitle, link, button_text, display_order, is_active)
SELECT 
    'd0000000-0000-0000-0000-000000000012'::uuid, 
    'mobile', 
    '/images/mobile slider 2.png', 
    '/images/mobile slider 2.png', 
    'Mobile Slider 2', 
    'Engineered for Lasting Comfort Across Pakistan', 
    '/shop', 
    'Explore Vests', 
    2, 
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.hero_slides WHERE id = 'd0000000-0000-0000-0000-000000000012'::uuid
);

-- ==============================================================================
-- 3. SHIPPING SETTINGS — SAFE UPDATE TO 3+ PIECES FREE DELIVERY
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.shipping_settings LIMIT 1) THEN
        UPDATE public.shipping_settings
        SET 
            min_order_qty = 3,
            free_delivery_threshold = 3,
            base_delivery_charge = 200.00,
            updated_at = NOW();
    ELSE
        INSERT INTO public.shipping_settings (id, min_order_qty, max_order_qty, base_delivery_charge, free_delivery_threshold)
        VALUES ('a0000000-0000-0000-0000-000000000001'::uuid, 3, 12, 200.00, 3);
    END IF;
END $$;

-- Update site announcement in site_settings if row exists
UPDATE public.site_settings
SET 
    announcement_text = '100% Pure Combed Cotton Innerwear — Free Delivery on Orders of 3+ Pieces Across Pakistan!',
    updated_at = NOW();

-- ==============================================================================
-- 4. CUSTOMER AUTHENTICATION & PROFILES TABLES
-- ==============================================================================

-- 4.1 Customer Profiles Table
CREATE TABLE IF NOT EXISTS public.customer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 Customer Saved Addresses Table
CREATE TABLE IF NOT EXISTS public.customer_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address_type TEXT NOT NULL DEFAULT 'shipping',
    full_name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL DEFAULT 'Punjab',
    postal_code TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_customer_addresses_user_id ON public.customer_addresses(user_id);

-- Enable RLS on Customer Tables
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Customer Profiles Policies (Users can manage own profile)
DROP POLICY IF EXISTS "Users can view own profile" ON public.customer_profiles;
CREATE POLICY "Users can view own profile" ON public.customer_profiles
FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.customer_profiles;
CREATE POLICY "Users can update own profile" ON public.customer_profiles
FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.customer_profiles;
CREATE POLICY "Users can insert own profile" ON public.customer_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Customer Addresses Policies (Users can manage own addresses)
DROP POLICY IF EXISTS "Users can view own addresses" ON public.customer_addresses;
CREATE POLICY "Users can view own addresses" ON public.customer_addresses
FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own addresses" ON public.customer_addresses;
CREATE POLICY "Users can insert own addresses" ON public.customer_addresses
FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own addresses" ON public.customer_addresses;
CREATE POLICY "Users can update own addresses" ON public.customer_addresses
FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own addresses" ON public.customer_addresses;
CREATE POLICY "Users can delete own addresses" ON public.customer_addresses
FOR DELETE USING (auth.uid() = user_id);

-- Grants for Customer Tables
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.customer_profiles TO anon, authenticated;
GRANT ALL ON TABLE public.customer_addresses TO anon, authenticated;

-- ==============================================================================
-- 5. STORAGE BUCKETS & ACCESS POLICIES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
SELECT 'product-media', 'product-media', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'product-media');

INSERT INTO storage.buckets (id, name, public)
SELECT 'hero-slides', 'hero-slides', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'hero-slides');

-- Storage Policies
DROP POLICY IF EXISTS "Public can view product media" ON storage.objects;
CREATE POLICY "Public can view product media" ON storage.objects 
FOR SELECT USING (bucket_id IN ('product-media', 'hero-slides'));

DROP POLICY IF EXISTS "Public can upload product media" ON storage.objects;
CREATE POLICY "Public can upload product media" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id IN ('product-media', 'hero-slides'));

DROP POLICY IF EXISTS "Public can update/delete product media" ON storage.objects;
CREATE POLICY "Public can update/delete product media" ON storage.objects 
FOR ALL USING (bucket_id IN ('product-media', 'hero-slides'));

-- ==============================================================================
-- 6. PRODUCT CATALOG — SAFE ADDITION OF SEPARATE STANDARD QUALITY LISTING
-- (DOES NOT OVERWRITE OR CONFLICT WITH EXISTING PRODUCT f0000000-0000-0000-0000-000000000001)
-- ==============================================================================

-- Safely add Product 2 (Standard Quality) only if it does not already exist
INSERT INTO public.products (
    id, category_id, subcategory_id, name, slug, subtitle, description, features, quality_comparison, care_instructions, shipping_info, is_published
)
SELECT
    'f0000000-0000-0000-0000-000000000002'::uuid,
    (SELECT id FROM public.categories WHERE slug = 'men' LIMIT 1),
    (SELECT id FROM public.subcategories WHERE slug = 'vests' LIMIT 1),
    'Men''s Pure Cotton Vest — Standard Quality (Folded Seams)',
    'mens-vest-standard-quality',
    '100% Pure Combed Cotton Daily Wear Innerwear with Clean Folded Stitched Finish',
    'Dependable everyday pure cotton inner vest crafted for breathability and comfort. Built with clean double-needle machine-stitched folded seams for dependable daily wear at an affordable price.',
    '["100% Pure Combed Cotton for gentle breathability", "Clean folded neckline machine-stitched seam", "Sweat-absorbent weave tailored for Pakistani climate", "Durable lockstitch seam construction", "Tagless comfort collar for irritation-free wear"]'::jsonb,
    '{"standardQuality": {"neck": "Folded & machine-stitched seam (no tape).", "shoulders": "Clean double-needle stitched finish.", "stitching": "Durable everyday lockstitch seam construction.", "feel": "Classic breathable pure cotton feel suited for dependable daily wear."}}'::jsonb,
    '["Machine wash gentle or hand wash in cold/lukewarm water", "Wash with similar light colors", "Do not use chlorine bleach", "Medium heat iron if required", "Line dry in shade for longest fabric life"]'::jsonb,
    'Fast delivery across all cities of Pakistan. Minimum order 3 pieces. Orders of 3 or more pieces qualify for 100% Free Delivery. Cash on Delivery (COD) & Bank Transfer available.',
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.products 
    WHERE id = 'f0000000-0000-0000-0000-000000000002'::uuid 
       OR slug = 'mens-vest-standard-quality'
);

-- Safely add variants for Product 2 if product exists and variants do not
DO $$
DECLARE
    p2_id UUID;
BEGIN
    SELECT id INTO p2_id FROM public.products WHERE slug = 'mens-vest-standard-quality' LIMIT 1;
    
    IF p2_id IS NOT NULL THEN
        INSERT INTO public.product_variants (product_id, quality, sleeve, size, price, stock, sku, is_available)
        SELECT p2_id, 'Standard Quality', 'Sleeveless', 'S', 380.00, 50, 'ARH-SQ-SL-S', true
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = p2_id AND size = 'S' AND sleeve = 'Sleeveless');

        INSERT INTO public.product_variants (product_id, quality, sleeve, size, price, stock, sku, is_available)
        SELECT p2_id, 'Standard Quality', 'Sleeveless', 'M', 380.00, 65, 'ARH-SQ-SL-M', true
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = p2_id AND size = 'M' AND sleeve = 'Sleeveless');

        INSERT INTO public.product_variants (product_id, quality, sleeve, size, price, stock, sku, is_available)
        SELECT p2_id, 'Standard Quality', 'Sleeveless', 'L', 380.00, 60, 'ARH-SQ-SL-L', true
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = p2_id AND size = 'L' AND sleeve = 'Sleeveless');

        INSERT INTO public.product_variants (product_id, quality, sleeve, size, price, stock, sku, is_available)
        SELECT p2_id, 'Standard Quality', 'Sleeveless', 'XL', 400.00, 45, 'ARH-SQ-SL-XL', true
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = p2_id AND size = 'XL' AND sleeve = 'Sleeveless');

        INSERT INTO public.product_variants (product_id, quality, sleeve, size, price, stock, sku, is_available)
        SELECT p2_id, 'Standard Quality', 'Sleeveless', 'XXL', 420.00, 30, 'ARH-SQ-SL-XXL', true
        WHERE NOT EXISTS (SELECT 1 FROM public.product_variants WHERE product_id = p2_id AND size = 'XXL' AND sleeve = 'Sleeveless');

        -- Add media for Product 2 if missing
        INSERT INTO public.product_media (product_id, media_type, url, alt_text, title, display_order, variant_quality, variant_sleeve)
        SELECT p2_id, 'photo', '/images/products/sleevless low.jpeg', 'Men''s Vest - Standard Quality Sleeveless / Sando', 'Standard Quality Sleeveless', 1, 'Standard Quality', 'Sleeveless'
        WHERE NOT EXISTS (SELECT 1 FROM public.product_media WHERE product_id = p2_id AND url = '/images/products/sleevless low.jpeg');
    END IF;
END $$;

-- ==============================================================================
-- 7. VERIFICATION / AUDIT QUERIES
-- (Run these checks to confirm database integrity)
-- ==============================================================================
DO $$
DECLARE
    prod_count INT;
    order_count INT;
    hero_count INT;
    ship_thresh INT;
BEGIN
    SELECT COUNT(*) INTO prod_count FROM public.products;
    SELECT COUNT(*) INTO order_count FROM public.orders;
    SELECT COUNT(*) INTO hero_count FROM public.hero_slides;
    SELECT free_delivery_threshold INTO ship_thresh FROM public.shipping_settings LIMIT 1;
    
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'AMIN RAISAT HOSIERY — MIGRATION V2 COMPLETED SUCCESSFULLY';
    RAISE NOTICE 'Products in Catalog: %', prod_count;
    RAISE NOTICE 'Existing Orders Preserved: %', order_count;
    RAISE NOTICE 'Hero Slides (Desktop + Mobile): %', hero_count;
    RAISE NOTICE 'Free Delivery Threshold: % pieces', ship_thresh;
    RAISE NOTICE '==================================================';
END $$;
