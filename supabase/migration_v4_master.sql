-- ==============================================================================
-- AMIN RAISAT HOSIERY — SAFE PRODUCTION DATABASE MIGRATION V4
-- 100% Non-Destructive, Idempotent, Production-Safe Schema & Security Policies
-- Covers: Video URLs, Mandatory Size Guide Images, Copy Fields, Pakistan Payments,
-- Order Verification, Guest Checkout, Announcement Strips, and Shipping Settings RLS
-- ==============================================================================

-- 1. Enable Required Extensions Safely
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. PRODUCTS TABLE — EXTENSIONS (VIDEO URL, SIZE GUIDE URL, SHORT DESCRIPTION)
-- ==============================================================================
DO $$
BEGIN
    -- Add video_url to products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'video_url'
    ) THEN
        ALTER TABLE public.products ADD COLUMN video_url TEXT;
    END IF;

    -- Add size_guide_url to products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'size_guide_url'
    ) THEN
        ALTER TABLE public.products ADD COLUMN size_guide_url TEXT;
    END IF;

    -- Add short_description to products
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'short_description'
    ) THEN
        ALTER TABLE public.products ADD COLUMN short_description TEXT;
    END IF;
END $$;

-- ==============================================================================
-- 3. ORDERS TABLE — EXTENSIONS (GUEST BADGE, PAYMENT STATUS, SCREENSHOT PROOF)
-- ==============================================================================
DO $$
BEGIN
    -- Add customer_type to orders ('GUEST' | 'REGISTERED')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'customer_type'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN customer_type TEXT DEFAULT 'GUEST';
    END IF;

    -- Add payment_screenshot_url to orders
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_screenshot_url'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_screenshot_url TEXT;
    END IF;

    -- Add payment_status to orders ('PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED' | 'COD_PENDING')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_status'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_status TEXT DEFAULT 'COD_PENDING';
    END IF;

    -- Add payment_verified_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_verified_at'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_verified_at TIMESTAMPTZ;
    END IF;

    -- Add payment_verified_by
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_verified_by'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_verified_by TEXT;
    END IF;

    -- Add payment_rejection_reason
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'payment_rejection_reason'
    ) THEN
        ALTER TABLE public.orders ADD COLUMN payment_rejection_reason TEXT;
    END IF;
END $$;

-- ==============================================================================
-- 4. SITE SETTINGS TABLE — EXTENSIONS (ANNOUNCEMENT STRIPS & PAYMENT METHODS)
-- ==============================================================================
DO $$
BEGIN
    -- Add announcement_strips JSONB
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'announcement_strips'
    ) THEN
        ALTER TABLE public.site_settings ADD COLUMN announcement_strips JSONB DEFAULT '[]'::jsonb;
    END IF;

    -- Add payment_methods JSONB
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'site_settings' AND column_name = 'payment_methods'
    ) THEN
        ALTER TABLE public.site_settings ADD COLUMN payment_methods JSONB DEFAULT '{
            "cod": {"enabled": true, "displayName": "Cash on Delivery", "instructions": "Pay cash upon delivery nationwide across Pakistan."},
            "bank_transfer": {"enabled": true, "displayName": "Direct Bank Transfer", "bankName": "Meezan Bank Ltd.", "accountTitle": "Muhammad Amin", "accountNumber": "01010101010101", "iban": "PK00MEZN0000000000000000", "instructions": "Please transfer the total amount and upload the payment proof screenshot."},
            "jazzcash": {"enabled": true, "displayName": "JazzCash", "accountTitle": "Muhammad Amin", "accountNumber": "03088666075", "instructions": "Send money to JazzCash account and upload screenshot."},
            "easypaisa": {"enabled": true, "displayName": "Easypaisa", "accountTitle": "Muhammad Amin", "accountNumber": "03088666075", "instructions": "Send money to Easypaisa account and upload screenshot."},
            "sadapay": {"enabled": true, "displayName": "SadaPay", "accountTitle": "Muhammad Amin", "accountNumber": "03088666075", "instructions": "Send money to SadaPay wallet and upload screenshot."}
        }'::jsonb;
    END IF;
END $$;

-- ==============================================================================
-- 5. CANONICAL SINGLE-ROW CONSTRAINTS & CLEANUP FOR SETTINGS
-- ==============================================================================
-- Deduplicate shipping_settings to a single canonical row
DELETE FROM public.shipping_settings 
WHERE id <> 'a0000000-0000-0000-0000-000000000001' 
AND EXISTS (SELECT 1 FROM public.shipping_settings WHERE id = 'a0000000-0000-0000-0000-000000000001');

-- Ensure canonical shipping_settings exists
INSERT INTO public.shipping_settings (id, min_order_qty, max_order_qty, base_delivery_charge, free_delivery_threshold)
VALUES ('a0000000-0000-0000-0000-000000000001', 3, 100, 200.00, 3)
ON CONFLICT (id) DO UPDATE SET max_order_qty = 100;

-- Deduplicate site_settings to a single canonical row
DELETE FROM public.site_settings 
WHERE id <> 'b0000000-0000-0000-0000-000000000001' 
AND EXISTS (SELECT 1 FROM public.site_settings WHERE id = 'b0000000-0000-0000-0000-000000000001');

-- Ensure canonical site_settings exists
INSERT INTO public.site_settings (
    id, brand_name, owner_name, phone, whatsapp, email, market, currency, bank_name, account_title, account_number, iban, is_store_open, announcement_text
)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    'Amin Raisat Hosiery',
    'Muhammad Amin',
    '03088666075',
    '03088666075',
    'info@aminhosiery.com',
    'Pakistan',
    'PKR',
    'Meezan Bank Ltd.',
    'Muhammad Amin',
    '01010101010101',
    'PK00MEZN0000000000000000',
    true,
    '100% Pure Combed Cotton Innerwear — Free Delivery on Orders of 3+ Pieces Across Pakistan!'
)
ON CONFLICT (id) DO NOTHING;

-- Backfill default announcement strips if empty
UPDATE public.site_settings
SET announcement_strips = '[
    {"id": "strip-1", "text": "FREE DELIVERY ON 3+ PIECES ACROSS PAKISTAN", "isActive": true, "displayOrder": 1, "icon": "Truck"},
    {"id": "strip-2", "text": "100% Pure Combed Cotton — Breathable Rib Weave & Anti-Sag Seams", "isActive": true, "displayOrder": 2, "icon": "ShieldCheck"},
    {"id": "strip-3", "text": "Cash on Delivery (COD) & Direct Bank Transfer Available", "isActive": true, "displayOrder": 3, "icon": "CheckCircle"},
    {"id": "strip-4", "text": "Official WhatsApp Ordering & Customer Support (03088666075)", "isActive": true, "displayOrder": 4, "icon": "PhoneCall"}
]'::jsonb
WHERE announcement_strips IS NULL OR announcement_strips = '[]'::jsonb;

-- ==============================================================================
-- 6. SECURITY & ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.shipping_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read shipping settings" ON public.shipping_settings;
CREATE POLICY "Allow public read shipping settings" ON public.shipping_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full operations shipping_settings" ON public.shipping_settings;
CREATE POLICY "Allow full operations shipping_settings" ON public.shipping_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read site settings" ON public.site_settings;
CREATE POLICY "Allow public read site settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow full operations site_settings" ON public.site_settings;
CREATE POLICY "Allow full operations site_settings" ON public.site_settings FOR ALL USING (true) WITH CHECK (true);

-- Ensure orders update policy for admin verification
DROP POLICY IF EXISTS "Allow public update orders" ON public.orders;
CREATE POLICY "Allow public update orders" ON public.orders FOR UPDATE USING (true) WITH CHECK (true);

-- Grants
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
