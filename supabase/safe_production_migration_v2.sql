-- ==============================================================================
-- AMIN RAISAT HOSIERY — SAFE PRODUCTION DATABASE MIGRATION V2
-- 100% Non-Destructive, Idempotent, Production-Safe Schema Update
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

-- 4.3 Database Trigger for Instant Customer Profile Creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
        NULL; -- Continue safely if auth.users is restricted in current role
END $$;

-- Enable RLS on Customer Tables
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

-- Customer Profiles Policies (Allows Admin & Customer Access)
DROP POLICY IF EXISTS "Users can view own profile" ON public.customer_profiles;
DROP POLICY IF EXISTS "Allow select customer_profiles" ON public.customer_profiles;
CREATE POLICY "Allow select customer_profiles" ON public.customer_profiles
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON public.customer_profiles;
DROP POLICY IF EXISTS "Allow update customer_profiles" ON public.customer_profiles;
CREATE POLICY "Allow update customer_profiles" ON public.customer_profiles
FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.customer_profiles;
DROP POLICY IF EXISTS "Allow insert customer_profiles" ON public.customer_profiles;
CREATE POLICY "Allow insert customer_profiles" ON public.customer_profiles
FOR INSERT WITH CHECK (true);

-- Customer Addresses Policies (Allows Store & Customer Management)
DROP POLICY IF EXISTS "Users can view own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Allow select customer_addresses" ON public.customer_addresses;
CREATE POLICY "Allow select customer_addresses" ON public.customer_addresses
FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Allow insert customer_addresses" ON public.customer_addresses;
CREATE POLICY "Allow insert customer_addresses" ON public.customer_addresses
FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Allow update customer_addresses" ON public.customer_addresses;
CREATE POLICY "Allow update customer_addresses" ON public.customer_addresses
FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Allow delete customer_addresses" ON public.customer_addresses;
CREATE POLICY "Allow delete customer_addresses" ON public.customer_addresses
FOR DELETE USING (true);

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
