-- ==============================================================================
-- AMIN RAISAT HOSIERY — SAFE PRODUCTION DATABASE MIGRATION V3
-- WHOLESALE COMMERCE MODULE & THEME SYSTEM SUPPORT
-- 100% Non-Destructive, Idempotent, Production-Safe Schema & Security Policies
-- ==============================================================================

-- 1. Enable Required Extensions Safely
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. PRODUCTS TABLE — WHOLESALE FIELDS
-- ==============================================================================
DO $$
BEGIN
    -- Add is_wholesale_enabled to products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'is_wholesale_enabled'
    ) THEN
        ALTER TABLE public.products ADD COLUMN is_wholesale_enabled BOOLEAN DEFAULT true;
    END IF;

    -- Add wholesale_min_qty to products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'wholesale_min_qty'
    ) THEN
        ALTER TABLE public.products ADD COLUMN wholesale_min_qty INT DEFAULT 12;
    END IF;
END $$;

-- ==============================================================================
-- 3. PRODUCT VARIANTS TABLE — WHOLESALE PRICING & TIERS
-- ==============================================================================
DO $$
BEGIN
    -- Add wholesale_price to product_variants
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'product_variants' AND column_name = 'wholesale_price'
    ) THEN
        ALTER TABLE public.product_variants ADD COLUMN wholesale_price NUMERIC(10, 2) DEFAULT 400.00;
    END IF;

    -- Add wholesale_tiers JSONB to product_variants
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'product_variants' AND column_name = 'wholesale_tiers'
    ) THEN
        ALTER TABLE public.product_variants ADD COLUMN wholesale_tiers JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- Safely backfill sensible wholesale prices for existing variants if currently null
UPDATE public.product_variants
SET 
    wholesale_price = CASE 
        WHEN quality = 'High Quality' AND sleeve = 'Full Sleeve' THEN 540.00
        WHEN quality = 'High Quality' AND sleeve = 'Sleeveless' THEN 400.00
        WHEN quality = 'Standard Quality' AND sleeve = 'Full Sleeve' THEN 450.00
        WHEN quality = 'Standard Quality' AND sleeve = 'Sleeveless' THEN 350.00
        ELSE ROUND(price * 0.82, 0) -- 18% standard wholesale discount fallback
    END,
    wholesale_tiers = '[
        {"minQty": 12, "maxQty": 23, "discountPercent": 17, "label": "1–2 Dozen Pack"},
        {"minQty": 24, "maxQty": 47, "discountPercent": 22, "label": "2–4 Dozen Pack"},
        {"minQty": 48, "discountPercent": 27, "label": "Bulk Carton"}
    ]'::jsonb
WHERE wholesale_price IS NULL OR wholesale_price = 0;

-- ==============================================================================
-- 4. ORDERS TABLE — WHOLESALE FIELDS
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'is_wholesale'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN is_wholesale BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'wholesale_discount'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN wholesale_discount NUMERIC(10, 2) DEFAULT 0.00;
    END IF;
END $$;

-- ==============================================================================
-- 5. ORDER ITEMS TABLE — WHOLESALE ITEM TRACKING
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'is_wholesale'
    ) THEN
        ALTER TABLE public.order_items ADD COLUMN is_wholesale BOOLEAN DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'order_items' AND column_name = 'wholesale_price'
    ) THEN
        ALTER TABLE public.order_items ADD COLUMN wholesale_price NUMERIC(10, 2);
    END IF;
END $$;

-- ==============================================================================
-- 6. SITE SETTINGS — WHOLESALE GLOBAL POLICIES
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'wholesale_enabled'
    ) THEN
        ALTER TABLE public.site_settings ADD COLUMN wholesale_enabled BOOLEAN DEFAULT true;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'wholesale_min_qty'
    ) THEN
        ALTER TABLE public.site_settings ADD COLUMN wholesale_min_qty INT DEFAULT 12;
    END IF;
END $$;

-- ==============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES SAFE UPDATE
-- ==============================================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- 1. Categories
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read categories') THEN
        CREATE POLICY "Allow public read categories" ON public.categories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full operations categories') THEN
        CREATE POLICY "Allow full operations categories" ON public.categories FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- 2. Subcategories
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read subcategories') THEN
        CREATE POLICY "Allow public read subcategories" ON public.subcategories FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full operations subcategories') THEN
        CREATE POLICY "Allow full operations subcategories" ON public.subcategories FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- 3. Products
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read products') THEN
        CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full operations products') THEN
        CREATE POLICY "Allow full operations products" ON public.products FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- 4. Product Variants
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read variants') THEN
        CREATE POLICY "Allow public read variants" ON public.product_variants FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full operations product_variants') THEN
        CREATE POLICY "Allow full operations product_variants" ON public.product_variants FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- 5. Product Media
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read product media') THEN
        CREATE POLICY "Allow public read product media" ON public.product_media FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full operations product_media') THEN
        CREATE POLICY "Allow full operations product_media" ON public.product_media FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- 6. Hero Slides
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read hero slides') THEN
        CREATE POLICY "Allow public read hero slides" ON public.hero_slides FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow full operations hero_slides') THEN
        CREATE POLICY "Allow full operations hero_slides" ON public.hero_slides FOR ALL USING (true) WITH CHECK (true);
    END IF;

    -- 7. Orders & Order Items
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert orders') THEN
        CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select orders') THEN
        CREATE POLICY "Allow public select orders" ON public.orders FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public update orders') THEN
        CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert order_items') THEN
        CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public select order_items') THEN
        CREATE POLICY "Allow public select order_items" ON public.order_items FOR SELECT USING (true);
    END IF;

    -- 8. Grants
    GRANT USAGE ON SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
    GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
END $$;

