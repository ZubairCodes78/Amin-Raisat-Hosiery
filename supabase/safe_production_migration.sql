-- ==============================================================================
-- [ARCHIVED / LEGACY MIGRATION]
-- NOTE: Please use 'supabase/safe_production_migration_v2.sql' for production.
-- This file is retained for migration history reference only.
-- ==============================================================================

-- 1. Enable UUID Extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. HERO SLIDES — ADD DEVICE_TYPE SUPPORT (DESKTOP / MOBILE)
-- ==============================================================================
DO $$
BEGIN
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

-- Safely Seed / Update 2 Desktop Hero Slides and 2 Mobile Hero Slides
-- Desktop Slides
INSERT INTO public.hero_slides (id, device_type, desktop_image, mobile_image, title, subtitle, link, button_text, display_order, is_active)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'desktop', '/images/slider 1.png', '/images/slider 1.png', 'Slider 1', '100% Fine Combed Cotton Vests & Innerwear', '/shop', 'Shop Collection', 1, true),
    ('d0000000-0000-0000-0000-000000000002', 'desktop', '/images/slider 2.png', '/images/slider 2.png', 'Slider 2', 'Engineered for Lasting Comfort Across Pakistan', '/shop', 'Explore Vests', 2, true)
ON CONFLICT (id) DO UPDATE SET
    device_type = EXCLUDED.device_type,
    desktop_image = EXCLUDED.desktop_image,
    display_order = EXCLUDED.display_order,
    is_active = true;

-- Mobile Slides
INSERT INTO public.hero_slides (id, device_type, desktop_image, mobile_image, title, subtitle, link, button_text, display_order, is_active)
VALUES
    ('d0000000-0000-0000-0000-000000000011', 'mobile', '/images/mobile slider 1.png', '/images/mobile slider 1.png', 'Mobile Slider 1', '100% Fine Combed Cotton Vests & Innerwear', '/shop', 'Shop Collection', 1, true),
    ('d0000000-0000-0000-0000-000000000012', 'mobile', '/images/mobile slider 2.png', '/images/mobile slider 2.png', 'Mobile Slider 2', 'Engineered for Lasting Comfort Across Pakistan', '/shop', 'Explore Vests', 2, true)
ON CONFLICT (id) DO UPDATE SET
    device_type = EXCLUDED.device_type,
    mobile_image = EXCLUDED.mobile_image,
    desktop_image = EXCLUDED.desktop_image,
    display_order = EXCLUDED.display_order,
    is_active = true;

-- ==============================================================================
-- 3. SHIPPING SETTINGS — UPDATE TO 3+ PIECES FREE DELIVERY & MINIMUM 3
-- ==============================================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM public.shipping_settings WHERE id = 'a0000000-0000-0000-0000-000000000001') THEN
        UPDATE public.shipping_settings
        SET 
            min_order_qty = 3,
            free_delivery_threshold = 3,
            base_delivery_charge = 200.00,
            updated_at = NOW()
        WHERE id = 'a0000000-0000-0000-0000-000000000001';
    ELSE
        INSERT INTO public.shipping_settings (id, min_order_qty, max_order_qty, base_delivery_charge, free_delivery_threshold)
        VALUES ('a0000000-0000-0000-0000-000000000001', 3, 12, 200.00, 3);
    END IF;
END $$;

-- Update site announcement in site_settings
UPDATE public.site_settings
SET 
    announcement_text = '100% Pure Combed Cotton Innerwear — Free Delivery on Orders of 3+ Pieces Across Pakistan!',
    updated_at = NOW()
WHERE id = 'b0000000-0000-0000-0000-000000000001';

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
    address_type TEXT NOT NULL DEFAULT 'shipping', -- 'shipping' | 'billing'
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL DEFAULT 'Punjab',
    postal_code TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.customer_profiles TO anon, authenticated;
GRANT ALL ON TABLE public.customer_addresses TO anon, authenticated;

-- ==============================================================================
-- 5. SEPARATE QUALITY LISTINGS SEED (PRESERVING CATALOG INTEGRITY)
-- ==============================================================================
-- Product 1: High Quality Vest
INSERT INTO public.products (
    id, category_id, subcategory_id, name, slug, subtitle, description, features, quality_comparison, care_instructions, shipping_info, is_published
)
VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'Men''s Pure Cotton Vest — High Quality (Taped Seams)',
    'mens-vest-high-quality',
    '100% Combed Cotton Breathable Innerwear with Reinforced Neck & Shoulder Seam Tape',
    'Engineered for long-lasting durability in Pakistani climate, the Amin Raisat Hosiery High-Quality Men’s Vest is crafted from 100% fine combed cotton. Features protective reinforcement tape along the neck and shoulder seams to maintain its shape wash after wash without collar sagging.',
    '["100% Premium Combed Cotton for skin-friendly softness and breathability", "Reinforced Neck & Shoulder Tape for anti-sag shape retention", "Sweat-absorbent weave tailored for all-day freshness in warm climates", "Form-retaining rib weave that resists stretching", "Tagless inner neckline for smooth, itch-free wear"]'::jsonb,
    '{"highQuality": {"neck": "Reinforced woven tape around neckline for anti-sag shape retention.", "shoulders": "Protective reinforcement tape along shoulder seams.", "stitching": "Precision industrial interlock 4-thread stitching.", "feel": "Silky-smooth premium combed cotton finish with enhanced softness."}}'::jsonb,
    '["Machine wash gentle or hand wash in cold/lukewarm water", "Wash with similar light colors", "Do not use chlorine bleach", "Medium heat iron if required", "Line dry in shade for longest fabric life"]'::jsonb,
    'Fast delivery across all cities of Pakistan. Minimum order 3 pieces. Orders of 3 or more pieces qualify for 100% Free Delivery. Cash on Delivery (COD) & Bank Transfer available.',
    true
)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description;

-- Product 2: Standard Quality Vest
INSERT INTO public.products (
    id, category_id, subcategory_id, name, slug, subtitle, description, features, quality_comparison, care_instructions, shipping_info, is_published
)
VALUES (
    'f0000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'Men''s Pure Cotton Vest — Standard Quality (Folded Seams)',
    'mens-vest-standard-quality',
    '100% Pure Combed Cotton Daily Wear Innerwear with Clean Folded Stitched Finish',
    'Dependable everyday pure cotton inner vest crafted for breathability and comfort. Built with clean double-needle machine-stitched folded seams for dependable daily wear at an affordable price.',
    '["100% Pure Combed Cotton for gentle breathability", "Clean folded neckline machine-stitched seam", "Sweat-absorbent weave tailored for Pakistani climate", "Durable lockstitch seam construction", "Tagless comfort collar for irritation-free wear"]'::jsonb,
    '{"standardQuality": {"neck": "Folded & machine-stitched seam (no tape).", "shoulders": "Clean double-needle stitched finish.", "stitching": "Durable everyday lockstitch seam construction.", "feel": "Classic breathable pure cotton feel suited for dependable daily wear."}}'::jsonb,
    '["Machine wash gentle or hand wash in cold/lukewarm water", "Wash with similar light colors", "Do not use chlorine bleach", "Medium heat iron if required", "Line dry in shade for longest fabric life"]'::jsonb,
    'Fast delivery across all cities of Pakistan. Minimum order 3 pieces. Orders of 3 or more pieces qualify for 100% Free Delivery. Cash on Delivery (COD) & Bank Transfer available.',
    true
)
ON CONFLICT (slug) DO UPDATE SET 
    name = EXCLUDED.name,
    subtitle = EXCLUDED.subtitle,
    description = EXCLUDED.description;

-- Variants for Product 1 (High Quality)
INSERT INTO public.product_variants (product_id, quality, sleeve, size, price, stock, sku, is_available)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Sleeveless', 'S', 480.00, 45, 'ARH-HQ-SL-S', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Sleeveless', 'M', 480.00, 60, 'ARH-HQ-SL-M', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Sleeveless', 'L', 480.00, 55, 'ARH-HQ-SL-L', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Sleeveless', 'XL', 500.00, 40, 'ARH-HQ-SL-XL', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Sleeveless', 'XXL', 520.00, 30, 'ARH-HQ-SL-XXL', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Full Sleeve', 'S', 540.00, 35, 'ARH-HQ-FS-S', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Full Sleeve', 'M', 540.00, 50, 'ARH-HQ-FS-M', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Full Sleeve', 'L', 540.00, 50, 'ARH-HQ-FS-L', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Full Sleeve', 'XL', 560.00, 35, 'ARH-HQ-FS-XL', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Full Sleeve', 'XXL', 580.00, 25, 'ARH-HQ-FS-XXL', true)
ON CONFLICT (product_id, quality, sleeve, size) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;

-- Variants for Product 2 (Standard Quality)
INSERT INTO public.product_variants (product_id, quality, sleeve, size, price, stock, sku, is_available)
VALUES
    ('f0000000-0000-0000-0000-000000000002', 'Standard Quality', 'Sleeveless', 'S', 380.00, 50, 'ARH-SQ-SL-S', true),
    ('f0000000-0000-0000-0000-000000000002', 'Standard Quality', 'Sleeveless', 'M', 380.00, 65, 'ARH-SQ-SL-M', true),
    ('f0000000-0000-0000-0000-000000000002', 'Standard Quality', 'Sleeveless', 'L', 380.00, 60, 'ARH-SQ-SL-L', true),
    ('f0000000-0000-0000-0000-000000000002', 'Standard Quality', 'Sleeveless', 'XL', 400.00, 45, 'ARH-SQ-SL-XL', true),
    ('f0000000-0000-0000-0000-000000000002', 'Standard Quality', 'Sleeveless', 'XXL', 420.00, 30, 'ARH-SQ-SL-XXL', true)
ON CONFLICT (product_id, quality, sleeve, size) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;

-- Media for Product 1 (High Quality)
INSERT INTO public.product_media (product_id, media_type, url, alt_text, title, display_order, variant_quality, variant_sleeve)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'photo', '/images/products/sleevless high.jpeg', 'Men''s Vest - High Quality Sleeveless / Sando', 'High Quality Sleeveless Front', 1, 'High Quality', 'Sleeveless'),
    ('f0000000-0000-0000-0000-000000000001', 'photo', '/images/products/full sleeve high.jpeg', 'Men''s Vest - High Quality Full Sleeve', 'High Quality Full Sleeve', 2, 'High Quality', 'Full Sleeve')
ON CONFLICT DO NOTHING;

-- Media for Product 2 (Standard Quality)
INSERT INTO public.product_media (product_id, media_type, url, alt_text, title, display_order, variant_quality, variant_sleeve)
VALUES
    ('f0000000-0000-0000-0000-000000000002', 'photo', '/images/products/sleevless low.jpeg', 'Men''s Vest - Standard Quality Sleeveless / Sando', 'Standard Quality Sleeveless', 1, 'Standard Quality', 'Sleeveless')
ON CONFLICT DO NOTHING;
