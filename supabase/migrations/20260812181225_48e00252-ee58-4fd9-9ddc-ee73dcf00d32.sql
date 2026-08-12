-- Migration to add CMS fields for landing page management

-- 1. Create enum for content status if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_status') THEN
        CREATE TYPE public.content_status AS ENUM ('draft', 'published');
    END IF;
END
$$;

-- 2. Add CMS fields to site_pages
ALTER TABLE public.site_pages ADD COLUMN IF NOT EXISTS hero_config JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.site_pages ADD COLUMN IF NOT EXISTS footer_config JSONB DEFAULT '{}'::jsonb;

-- 3. Add CMS fields to page_blocks
ALTER TABLE public.page_blocks ADD COLUMN IF NOT EXISTS status public.content_status DEFAULT 'published';
ALTER TABLE public.page_blocks ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Add CMS fields to faqs
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS status public.content_status DEFAULT 'published';
ALTER TABLE public.faqs ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Add CMS fields to gallery_images
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS status public.content_status DEFAULT 'published';
ALTER TABLE public.gallery_images ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 6. Add CMS fields to testimonials if it doesn't have them
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'testimonials' AND table_schema = 'public') THEN
        ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS status public.content_status DEFAULT 'published';
        ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5;
        ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
        ALTER TABLE public.testimonials ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
    END IF;
END
$$;

-- 7. Update RLS policies
-- Note: Simplified policies for this environment. 
-- In a real app, you'd check auth.uid() and roles.

-- For page_blocks
DROP POLICY IF EXISTS "Public can view published blocks" ON public.page_blocks;
CREATE POLICY "Public can view published blocks" 
ON public.page_blocks FOR SELECT 
TO public
USING (status = 'published' AND published = true);

-- For faqs
DROP POLICY IF EXISTS "Public can view published faqs" ON public.faqs;
CREATE POLICY "Public can view published faqs" 
ON public.faqs FOR SELECT 
TO public
USING (status = 'published' AND published = true);

-- For gallery_images
DROP POLICY IF EXISTS "Public can view published gallery images" ON public.gallery_images;
CREATE POLICY "Public can view published gallery images" 
ON public.gallery_images FOR SELECT 
TO public
USING (status = 'published');

-- 8. Seed initial hero data
UPDATE public.site_pages 
SET hero_config = '{
  "badge": "LA DUNE CLINIQUE DENTAIRE",
  "heading": "Exceptional dental care.",
  "highlight": "A confident smile.",
  "description": "Advanced dental expertise, modern technology and personalized care, all in one place.",
  "primaryCTA": "Book an Appointment",
  "primaryURL": "/booking",
  "secondaryCTA": "Discover Our Care",
  "secondaryURL": "/soins",
  "floatingTitle": "Modern Technology",
  "floatingSubtitle": "Clinic Expertise",
  "overlayOpacity": 40
}'::jsonb
WHERE slug = 'home';
