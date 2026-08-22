-- Update Hero Slides to 2 Slides
-- This script safely updates the hero_slides table to contain only 2 active slides
-- Uses proper UUIDs and safe UPDATE/INSERT approach without ON CONFLICT

-- First, let's see what currently exists
DO $$
DECLARE
    slide_count INTEGER;
    slide_1_id UUID;
    slide_2_id UUID;
    slide_3_id UUID;
BEGIN
    SELECT COUNT(*) INTO slide_count FROM hero_slides WHERE is_active = true;
    SELECT id INTO slide_1_id FROM hero_slides WHERE display_order = 1 LIMIT 1;
    SELECT id INTO slide_2_id FROM hero_slides WHERE display_order = 2 LIMIT 1;
    SELECT id INTO slide_3_id FROM hero_slides WHERE display_order = 3 LIMIT 1;
    
    RAISE NOTICE 'Current active slides: %', slide_count;
    RAISE NOTICE 'Slide 1 ID: %', slide_1_id;
    RAISE NOTICE 'Slide 2 ID: %', slide_2_id;
    RAISE NOTICE 'Slide 3 ID: %', slide_3_id;
END $$;

-- Deactivate any slides with display_order > 2 (the old third slide and any others)
UPDATE hero_slides 
SET is_active = false 
WHERE display_order > 2;

-- Update Slider 1 if it exists, otherwise insert it
DO $$
DECLARE
    slide_1_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM hero_slides WHERE display_order = 1) INTO slide_1_exists;
    
    IF slide_1_exists THEN
        -- Update existing Slider 1
        UPDATE hero_slides 
        SET 
            title = 'Slider 1',
            desktop_image = '/images/slider 1.png',
            mobile_image = '/images/slider 1.png',
            is_active = true,
            updated_at = NOW()
        WHERE display_order = 1;
        RAISE NOTICE 'Updated existing Slider 1';
    ELSE
        -- Insert new Slider 1
        INSERT INTO hero_slides (id, title, desktop_image, mobile_image, display_order, is_active, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'Slider 1',
            '/images/slider 1.png',
            '/images/slider 1.png',
            1,
            true,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Inserted new Slider 1';
    END IF;
END $$;

-- Update Slider 2 if it exists, otherwise insert it
DO $$
DECLARE
    slide_2_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM hero_slides WHERE display_order = 2) INTO slide_2_exists;
    
    IF slide_2_exists THEN
        -- Update existing Slider 2
        UPDATE hero_slides 
        SET 
            title = 'Slider 2',
            desktop_image = '/images/slider 2.png',
            mobile_image = '/images/slider 2.png',
            is_active = true,
            updated_at = NOW()
        WHERE display_order = 2;
        RAISE NOTICE 'Updated existing Slider 2';
    ELSE
        -- Insert new Slider 2
        INSERT INTO hero_slides (id, title, desktop_image, mobile_image, display_order, is_active, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'Slider 2',
            '/images/slider 2.png',
            '/images/slider 2.png',
            2,
            true,
            NOW(),
            NOW()
        );
        RAISE NOTICE 'Inserted new Slider 2';
    END IF;
END $$;

-- Ensure we only have exactly 2 active slides by display_order
-- Delete any slides with display_order > 2 (including deactivated ones)
DELETE FROM hero_slides 
WHERE display_order > 2;

-- Verify the final state
SELECT 
    id,
    title,
    display_order,
    is_active,
    desktop_image,
    created_at
FROM hero_slides 
ORDER BY display_order;
