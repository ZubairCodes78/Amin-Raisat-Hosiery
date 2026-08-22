-- ==============================================================================
-- Amin Raisat Hosiery — Comprehensive Supabase Database Schema & Initial Seed
-- Brand: Amin Raisat Hosiery
-- Owner: Muhammad Amin (Phone & WhatsApp: 03018666075, Email: amingoldriasathosiery@gmail.com)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- 2.1 Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Subcategories Table (Hierarchical Taxonomy)
CREATE TABLE IF NOT EXISTS public.subcategories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_subcat_slug UNIQUE (category_id, slug)
);

-- 2.3 Products Table (Multi-Product Catalog)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    subcategory_id UUID REFERENCES public.subcategories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    subtitle TEXT,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    quality_comparison JSONB DEFAULT '{}'::jsonb,
    care_instructions JSONB DEFAULT '[]'::jsonb,
    shipping_info TEXT,
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Product Variants Table (Quality, Sleeve, Size, Pricing & Inventory)
CREATE TABLE IF NOT EXISTS public.product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    quality TEXT NOT NULL, -- 'High Quality', 'Low Quality', etc.
    sleeve TEXT NOT NULL,  -- 'Sleeveless', 'Full Sleeve', etc.
    size TEXT NOT NULL,    -- 'S', 'M', 'L', 'XL', 'XXL'
    price NUMERIC(10, 2) NOT NULL DEFAULT 480.00,
    sale_price NUMERIC(10, 2),
    stock INT NOT NULL DEFAULT 50,
    sku TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_variant UNIQUE (product_id, quality, sleeve, size)
);

-- 2.5 Product Media Table (Photos & Videos with Variant Binding)
CREATE TABLE IF NOT EXISTS public.product_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    media_type TEXT NOT NULL DEFAULT 'photo', -- 'photo' | 'video'
    url TEXT NOT NULL,
    alt_text TEXT,
    title TEXT,
    display_order INT DEFAULT 0,
    variant_quality TEXT, -- 'High Quality', 'Low Quality', or NULL for all
    variant_sleeve TEXT,  -- 'Sleeveless', 'Full Sleeve', or NULL for all
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 Hero Slides Table (Dynamic Homepage Campaign Banners)
CREATE TABLE IF NOT EXISTS public.hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    desktop_image TEXT NOT NULL,
    mobile_image TEXT,
    title TEXT,
    subtitle TEXT,
    link TEXT DEFAULT '/shop',
    button_text TEXT DEFAULT 'Shop Now',
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.7 Shipping & Business Rule Settings Table
CREATE TABLE IF NOT EXISTS public.shipping_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    min_order_qty INT NOT NULL DEFAULT 2,
    max_order_qty INT NOT NULL DEFAULT 12,
    base_delivery_charge NUMERIC(10, 2) NOT NULL DEFAULT 200.00,
    free_delivery_threshold INT NOT NULL DEFAULT 4,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.8 Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brand_name TEXT NOT NULL DEFAULT 'Amin Raisat Hosiery',
    owner_name TEXT NOT NULL DEFAULT 'Muhammad Amin',
    phone TEXT NOT NULL DEFAULT '03018666075',
    whatsapp TEXT NOT NULL DEFAULT '03018666075',
    email TEXT NOT NULL DEFAULT 'amingoldriasathosiery@gmail.com',
    market TEXT NOT NULL DEFAULT 'Pakistan',
    currency TEXT NOT NULL DEFAULT 'PKR',
    bank_name TEXT DEFAULT 'Meezan Bank Ltd.',
    account_title TEXT DEFAULT 'Muhammad Amin',
    account_number TEXT DEFAULT '01010101010101',
    iban TEXT DEFAULT 'PK00MEZN0000000000000000',
    is_store_open BOOLEAN DEFAULT true,
    announcement_text TEXT DEFAULT '100% Pure Combed Cotton Innerwear — Free Delivery on Orders of 4+ Pieces Across Pakistan!',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.9 Orders Table (Guest Checkout & Customer Management)
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    province TEXT NOT NULL,
    order_notes TEXT,
    subtotal NUMERIC(10, 2) NOT NULL,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL DEFAULT 'cod', -- 'cod' | 'bank_transfer'
    payment_reference TEXT,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.10 Order Items Table (Line Items per Order)
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    quality TEXT NOT NULL,
    sleeve TEXT NOT NULL,
    size TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL,
    total_price NUMERIC(10, 2) NOT NULL,
    image_url TEXT
);

-- 2.11 Customer Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_city TEXT,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. STORAGE BUCKETS CONFIGURATION
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('product-media', 'product-media', true),
    ('hero-slides', 'hero-slides', true)
ON CONFLICT (id) DO UPDATE SET public = true;

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
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
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

-- 4.1 Public Read Policies
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read subcategories" ON public.subcategories;
CREATE POLICY "Allow public read subcategories" ON public.subcategories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read products" ON public.products;
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read variants" ON public.product_variants;
CREATE POLICY "Allow public read variants" ON public.product_variants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read product media" ON public.product_media;
CREATE POLICY "Allow public read product media" ON public.product_media FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read hero slides" ON public.hero_slides;
CREATE POLICY "Allow public read hero slides" ON public.hero_slides FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read shipping settings" ON public.shipping_settings;
CREATE POLICY "Allow public read shipping settings" ON public.shipping_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read site settings" ON public.site_settings;
CREATE POLICY "Allow public read site settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read approved reviews" ON public.reviews;
CREATE POLICY "Allow public read approved reviews" ON public.reviews FOR SELECT USING (true);

-- 4.2 Guest Checkout Insert & Select Policies
DROP POLICY IF EXISTS "Allow public insert orders" ON public.orders;
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select orders" ON public.orders;
CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete orders" ON public.orders;
CREATE POLICY "Allow public delete orders" ON public.orders FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public insert order_items" ON public.order_items;
CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public select order_items" ON public.order_items;
CREATE POLICY "Allow public select order_items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public delete order_items" ON public.order_items;
CREATE POLICY "Allow public delete order_items" ON public.order_items FOR DELETE USING (true);

-- 4.3 Public/Admin Full Operations for Store Management
DROP POLICY IF EXISTS "Allow full operations categories" ON public.categories;
CREATE POLICY "Allow full operations categories" ON public.categories FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow full operations subcategories" ON public.subcategories;
CREATE POLICY "Allow full operations subcategories" ON public.subcategories FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow full operations products" ON public.products;
CREATE POLICY "Allow full operations products" ON public.products FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow full operations product_variants" ON public.product_variants;
CREATE POLICY "Allow full operations product_variants" ON public.product_variants FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow full operations product_media" ON public.product_media;
CREATE POLICY "Allow full operations product_media" ON public.product_media FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow full operations hero_slides" ON public.hero_slides;
CREATE POLICY "Allow full operations hero_slides" ON public.hero_slides FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow full operations shipping_settings" ON public.shipping_settings;
CREATE POLICY "Allow full operations shipping_settings" ON public.shipping_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow full operations site_settings" ON public.site_settings;
CREATE POLICY "Allow full operations site_settings" ON public.site_settings FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow full operations reviews" ON public.reviews;
CREATE POLICY "Allow full operations reviews" ON public.reviews FOR ALL USING (true);

-- 4.4 Schema and Table Role Authorizations
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated;

-- ==============================================================================
-- 5. INITIAL SEED DATA (ALL RFC 4122 COMPLIANT HEXADECIMAL UUIDs)
-- ==============================================================================

-- 5.1 Categories Seed (Prefix: c0000000-...)
INSERT INTO public.categories (id, name, slug, description, is_active, display_order)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Men', 'men', 'Everyday premium cotton innerwear, vests, and essentials engineered for maximum comfort and durability.', true, 1),
    ('c0000000-0000-0000-0000-000000000002', 'Women', 'women', 'Upcoming collection of comfortable, breathable women hosiery essentials.', true, 2),
    ('c0000000-0000-0000-0000-000000000003', 'Kids', 'kids', 'Soft and gentle cotton hosiery for children of all ages.', true, 3)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 5.2 Subcategories Seed (Prefix: e0000000-..., referencing category c0000000-...)
INSERT INTO public.subcategories (id, category_id, name, slug, description, is_active, display_order)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Vests', 'vests', '100% fine combed cotton sleeveless and half-sleeve inner vests.', true, 1),
    ('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Briefs', 'briefs', 'Soft stretch cotton briefs with snug waistband.', true, 2),
    ('e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'T-Shirts', 't-shirts', 'Everyday casual cotton crewneck and v-neck t-shirts.', true, 3),
    ('e0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000001', 'Trousers', 'trousers', 'Comfortable loungewear and cotton knit trousers.', true, 4),
    ('e0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'Camisoles', 'camisoles', 'Soft breathable cotton camisoles and inner vests for women.', true, 1),
    ('e0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'Innerwear', 'innerwear', 'Comfort-fit women hosiery essentials.', true, 2),
    ('e0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', 'Kids'' Vests', 'kids-vests', 'Hypoallergenic pure cotton vests for kids.', true, 1),
    ('e0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000003', 'Kids'' Underwear', 'kids-underwear', 'Gentle cotton briefs and trunks for boys and girls.', true, 2)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 5.3 Initial Product: Men's Pure Cotton Vest (ID: f0000000-0000-0000-0000-000000000001)
INSERT INTO public.products (
    id, category_id, subcategory_id, name, slug, subtitle, description, features, quality_comparison, care_instructions, shipping_info, is_published
)
VALUES (
    'f0000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    'Men''s Pure Cotton Vest',
    'mens-vest',
    '100% Combed Cotton Breathable Innerwear — High Quality & Low Quality options',
    'Engineered for long-lasting comfort in Pakistani climate, the Amin Raisat Hosiery Men’s Vest is crafted from 100% fine combed cotton. Soft against the skin, sweat-absorbent, and designed to maintain its shape wash after wash.',
    '["100% Premium Combed Cotton for skin-friendly softness and breathability", "Dual Construction Options: High Quality (Reinforced Tape) & Low Quality", "Sweat-absorbent weave tailored for all-day freshness and warm climates", "Form-retaining rib weave that resists stretching and collar sagging", "Tagless inner neckline for smooth, itch-free wear under shirts and kurtas"]'::jsonb,
    '{"highQuality": {"neck": "Reinforced woven tape around neckline for anti-sag shape retention.", "shoulders": "Protective reinforcement tape along shoulder seams.", "stitching": "Precision industrial interlock 4-thread stitching.", "feel": "Silky-smooth premium combed cotton finish with enhanced softness."}, "standardQuality": {"neck": "Folded & machine-stitched seam (no tape).", "shoulders": "Clean double-needle stitched finish.", "stitching": "Durable everyday lockstitch seam construction.", "feel": "Classic breathable pure cotton feel suited for dependable daily wear."}}'::jsonb,
    '["Machine wash gentle or hand wash in cold/lukewarm water", "Wash with similar light colors", "Do not use chlorine bleach", "Medium heat iron if required", "Line dry in shade for longest fabric life"]'::jsonb,
    'Fast delivery across all cities of Pakistan. Delivery charges Rs. 200 apply on 2 pieces. Orders of 4 or more pieces qualify for 100% Free Delivery. Cash on Delivery (COD) & Bank Transfer available.',
    true
)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, subtitle = EXCLUDED.subtitle, description = EXCLUDED.description;

-- 5.4 Product Variants Seed (Referencing product_id f0000000-0000-0000-0000-000000000001)
INSERT INTO public.product_variants (product_id, quality, sleeve, size, price, stock, sku, is_available)
VALUES
    -- High Quality - Sleeveless (S, M, L, XL, XXL)
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Sleeveless', 'S', 480.00, 45, 'ARH-HQ-SL-S', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Sleeveless', 'M', 480.00, 60, 'ARH-HQ-SL-M', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Sleeveless', 'L', 480.00, 55, 'ARH-HQ-SL-L', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Sleeveless', 'XL', 500.00, 40, 'ARH-HQ-SL-XL', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Sleeveless', 'XXL', 520.00, 30, 'ARH-HQ-SL-XXL', true),

    -- High Quality - Full Sleeve (S, M, L, XL, XXL)
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Full Sleeve', 'S', 540.00, 35, 'ARH-HQ-FS-S', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Full Sleeve', 'M', 540.00, 50, 'ARH-HQ-FS-M', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Full Sleeve', 'L', 540.00, 50, 'ARH-HQ-FS-L', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Full Sleeve', 'XL', 560.00, 35, 'ARH-HQ-FS-XL', true),
    ('f0000000-0000-0000-0000-000000000001', 'High Quality', 'Full Sleeve', 'XXL', 580.00, 25, 'ARH-HQ-FS-XXL', true),

    -- Low Quality - Sleeveless / Sando Only (S, M, L, XL, XXL)
    ('f0000000-0000-0000-0000-000000000001', 'Low Quality', 'Sleeveless', 'S', 380.00, 50, 'ARH-LQ-SL-S', true),
    ('f0000000-0000-0000-0000-000000000001', 'Low Quality', 'Sleeveless', 'M', 380.00, 65, 'ARH-LQ-SL-M', true),
    ('f0000000-0000-0000-0000-000000000001', 'Low Quality', 'Sleeveless', 'L', 380.00, 60, 'ARH-LQ-SL-L', true),
    ('f0000000-0000-0000-0000-000000000001', 'Low Quality', 'Sleeveless', 'XL', 400.00, 45, 'ARH-LQ-SL-XL', true),
    ('f0000000-0000-0000-0000-000000000001', 'Low Quality', 'Sleeveless', 'XXL', 420.00, 30, 'ARH-LQ-SL-XXL', true)
ON CONFLICT (product_id, quality, sleeve, size) DO UPDATE SET price = EXCLUDED.price, stock = EXCLUDED.stock;

-- 5.5 Product Media Seed (Sleevless High, Full Sleeve High, Sleevless Low)
INSERT INTO public.product_media (product_id, media_type, url, alt_text, title, display_order, variant_quality, variant_sleeve)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'photo', '/images/products/sleevless high.jpeg', 'Men''s Vest - High Quality Sleeveless / Sando', 'High Quality Sleeveless', 1, 'High Quality', 'Sleeveless'),
    ('f0000000-0000-0000-0000-000000000001', 'photo', '/images/products/full sleeve high.jpeg', 'Men''s Vest - High Quality Full Sleeve', 'High Quality Full Sleeve', 2, 'High Quality', 'Full Sleeve'),
    ('f0000000-0000-0000-0000-000000000001', 'photo', '/images/products/sleevless low.jpeg', 'Men''s Vest - Low Quality Sleeveless / Sando', 'Low Quality Sleeveless', 3, 'Low Quality', 'Sleeveless');

-- 5.6 Hero Slides Seed (Prefix: d0000000-...)
INSERT INTO public.hero_slides (id, desktop_image, mobile_image, title, subtitle, link, button_text, display_order, is_active)
VALUES
    ('d0000000-0000-0000-0000-000000000001', '/images/slider 1.png', '/images/slider 1.png', 'Amin Raisat Premium Cotton Innerwear', 'Engineered for softness and durability', '/shop', 'Shop Collection', 1, true),
    ('d0000000-0000-0000-0000-000000000002', '/images/slider 2.png', '/images/slider 2.png', 'Pure Combed Cotton Vests & Essentials', 'Crafted for lasting comfort in Pakistani climate', '/shop', 'Explore Vests', 2, true),
    ('d0000000-0000-0000-0000-000000000003', '/images/slider 3.png', '/images/slider 3.png', 'Quality & Standard Construction', 'Choose between reinforced taped neck and clean folded finish', '/shop', 'Buy Online', 3, true)
ON CONFLICT (id) DO NOTHING;

-- 5.7 Shipping Settings Seed (Prefix: a0000000-...)
INSERT INTO public.shipping_settings (id, min_order_qty, max_order_qty, base_delivery_charge, free_delivery_threshold)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 2, 12, 200.00, 4)
ON CONFLICT (id) DO NOTHING;

-- 5.8 Site Settings Seed (Prefix: b0000000-...)
INSERT INTO public.site_settings (
    id, brand_name, owner_name, phone, whatsapp, email, market, currency, bank_name, account_title, account_number, iban, is_store_open, announcement_text
)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'Amin Raisat Hosiery',
    'Muhammad Amin',
    '03018666075',
    '03018666075',
    'amingoldriasathosiery@gmail.com',
    'Pakistan',
    'PKR',
    'Meezan Bank Ltd.',
    'Muhammad Amin',
    '01010101010101',
    'PK00MEZN0000000000000000',
    true,
    '100% Pure Combed Cotton Innerwear — Free Delivery on Orders of 4+ Pieces Across Pakistan!'
)
ON CONFLICT (id) DO NOTHING;
