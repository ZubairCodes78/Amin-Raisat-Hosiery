-- Migration v5: Review Eligibility & Customer-Order Relationship
-- Run in Supabase Dashboard -> SQL Editor

DO $$
BEGIN
    -- 1. Add user_id column to reviews if not present
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    END IF;

    -- 2. Add order_id column to reviews if not present
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'reviews' AND column_name = 'order_id'
    ) THEN
        ALTER TABLE public.reviews ADD COLUMN order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Create index to prevent duplicate reviews per user per product
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_user_product 
ON public.reviews (user_id, product_id) 
WHERE user_id IS NOT NULL;

-- 4. Enable RLS and verify policies
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read approved reviews" ON public.reviews;
CREATE POLICY "Allow public read approved reviews" 
ON public.reviews FOR SELECT 
USING (is_approved = true OR is_approved IS NULL);

DROP POLICY IF EXISTS "Allow authenticated insert reviews" ON public.reviews;
CREATE POLICY "Allow authenticated insert reviews" 
ON public.reviews FOR INSERT 
WITH CHECK (true);
