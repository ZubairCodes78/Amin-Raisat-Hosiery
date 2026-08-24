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
-- Ensure all tables allow public reads for published products & wholesale pricing
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    -- Public read for products
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read products') THEN
        CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
    END IF;

    -- Public read for variants
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read variants') THEN
        CREATE POLICY "Allow public read variants" ON public.product_variants FOR SELECT USING (true);
    END IF;

    -- Public insert orders
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert orders') THEN
        CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);
    END IF;

    -- Public insert order_items
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert order_items') THEN
        CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
    END IF;
END $$;
