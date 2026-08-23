-- ==============================================================================
-- AMIN RAISAT HOSIERY — SAFE PRODUCTION DATABASE MIGRATION V2 (SECURITY HARDENED)
-- 100% Non-Destructive, Idempotent, Production-Safe Schema & Security Policies
-- ==============================================================================

-- 1. Enable Required Extensions Safely
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. HERO SLIDES — DESKTOP & MOBILE SEPARATION
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_type TEXT NOT NULL DEFAULT 'desktop' CHECK (device_type IN ('desktop', 'mobile')),
    desktop_image TEXT NOT NULL,
    mobile_image TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    link TEXT DEFAULT '/shop',
    button_text TEXT DEFAULT 'Shop Now',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add device_type column if table already exists from v1
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'hero_slides' AND column_name = 'device_type'
    ) THEN
        ALTER TABLE public.hero_slides ADD COLUMN device_type TEXT NOT NULL DEFAULT 'desktop' CHECK (device_type IN ('desktop', 'mobile'));
    END IF;
END $$;

-- Safely insert Desktop Slide 1 if missing
INSERT INTO public.hero_slides (id, device_type, desktop_image, mobile_image, title, subtitle, link, button_text, display_order, is_active)
SELECT 
    'd0000000-0000-0000-0000-000000000001'::uuid, 
    'desktop', 
    '/images/slider 1.png', 
    '/images/mobile slider 1.png', 
    'Desktop Slider 1', 
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
    '/images/mobile slider 2.png', 
    'Desktop Slider 2', 
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
    '/images/slider 1.png', 
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

-- 4.3 Hardened Trigger for Instant Customer Profile Creation (Fixed search_path)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public, auth, pg_temp
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.customer_profiles (id, full_name, email, phone, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1), 'Customer'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = CASE 
      WHEN EXCLUDED.full_name IS NOT NULL AND EXCLUDED.full_name <> 'Customer' THEN EXCLUDED.full_name 
      ELSE public.customer_profiles.full_name 
    END,
    email = COALESCE(EXCLUDED.email, public.customer_profiles.email),
    phone = COALESCE(EXCLUDED.phone, public.customer_profiles.phone),
    updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Secure execution privileges on handle_new_user (Internal trigger only)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Secure rls_auto_enable helper function if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'rls_auto_enable'
    ) THEN
        EXECUTE 'ALTER FUNCTION public.rls_auto_enable() SET search_path = public, pg_temp;';
        EXECUTE 'REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;';
    END IF;
END $$;

-- 4.4 Retroactive Profile Creation for Existing Auth Users
DO $$
BEGIN
    INSERT INTO public.customer_profiles (id, full_name, email, phone, created_at, updated_at)
    SELECT 
        u.id,
        COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email, '@', 1), 'Customer'),
        u.email,
        COALESCE(u.raw_user_meta_data->>'phone', NULL),
        COALESCE(u.created_at, NOW()),
        NOW()
    FROM auth.users u
    LEFT JOIN public.customer_profiles p ON u.id = p.id
    WHERE p.id IS NULL
    ON CONFLICT (id) DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;

-- ==============================================================================
-- 5. HARDENED ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- 5.1 Enable RLS on All Public Tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- 5.2 Customer Profiles: Strict Ownership Isolation
DROP POLICY IF EXISTS "Allow select customer_profiles" ON public.customer_profiles;
DROP POLICY IF EXISTS "Allow update customer_profiles" ON public.customer_profiles;
DROP POLICY IF EXISTS "Allow insert customer_profiles" ON public.customer_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.customer_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.customer_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.customer_profiles;

CREATE POLICY "Users can view own profile" ON public.customer_profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.customer_profiles
FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.customer_profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- 5.3 Customer Addresses: Strict Ownership Isolation
DROP POLICY IF EXISTS "Allow select customer_addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Allow insert customer_addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Allow update customer_addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Allow delete customer_addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can view own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can insert own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can update own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can delete own addresses" ON public.customer_addresses;

CREATE POLICY "Users can view own addresses" ON public.customer_addresses
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own addresses" ON public.customer_addresses
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" ON public.customer_addresses
FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" ON public.customer_addresses
FOR DELETE USING (auth.uid() = user_id);

-- 5.4 Orders: Checkout Insert & Customer/Tracking Select (NO Public Update/Delete)
DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public select orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
DROP POLICY IF EXISTS "Allow public delete orders" ON public.orders;

CREATE POLICY "Allow public insert orders" ON public.orders
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select orders" ON public.orders
FOR SELECT USING (true);

-- 5.5 Order Items: Checkout Insert & Tracking Select (NO Public Update/Delete)
DROP POLICY IF EXISTS "Allow public insert order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public select order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow public delete order_items" ON public.order_items;

CREATE POLICY "Allow public insert order_items" ON public.order_items
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select order_items" ON public.order_items
FOR SELECT USING (true);

-- 5.6 Store Catalog Read Policies (Public Read Only, NO Public Write)
DROP POLICY IF EXISTS "Allow full operations categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full operations subcategories" ON public.subcategories;
DROP POLICY IF EXISTS "Allow public read subcategories" ON public.subcategories;
CREATE POLICY "Allow public read subcategories" ON public.subcategories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full operations products" ON public.products;
DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full operations product_variants" ON public.product_variants;
DROP POLICY IF EXISTS "Allow public read variants" ON public.product_variants;
CREATE POLICY "Allow public read variants" ON public.product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full operations product_media" ON public.product_media;
DROP POLICY IF EXISTS "Allow public read product media" ON public.product_media;
CREATE POLICY "Allow public read product media" ON public.product_media FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full operations hero_slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Allow public read hero slides" ON public.hero_slides;
CREATE POLICY "Allow public read hero slides" ON public.hero_slides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full operations shipping_settings" ON public.shipping_settings;
DROP POLICY IF EXISTS "Allow public read shipping settings" ON public.shipping_settings;
CREATE POLICY "Allow public read shipping settings" ON public.shipping_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full operations site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow public read site settings" ON public.site_settings;
CREATE POLICY "Allow public read site settings" ON public.site_settings FOR SELECT USING (true);

-- 5.7 Reviews: Approved Read & Submission Insert (NO Public Update/Delete)
DROP POLICY IF EXISTS "Allow full operations reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public read approved reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public insert reviews" ON public.reviews;

CREATE POLICY "Allow public read approved reviews" ON public.reviews
FOR SELECT USING (is_approved = true);

CREATE POLICY "Allow public insert reviews" ON public.reviews
FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- 6. STORAGE BUCKETS & ACCESS POLICIES
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
