-- Migration for Dental Clinic Services Management Module
-- Reusing existing tables 'services' and 'service_categories'

-- 1. Ensure RLS is enabled
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

-- 2. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_categories TO authenticated;
GRANT ALL ON public.service_categories TO service_role;

-- 3. RLS Policies for services
-- Drop existing if any to avoid conflicts
DROP POLICY IF EXISTS "Users can view their clinic's services" ON public.services;
DROP POLICY IF EXISTS "Admins and assistants can manage services" ON public.services;

-- Users can see services
CREATE POLICY "Users can view their clinic's services"
ON public.services FOR SELECT
TO authenticated
USING (true);

-- Admins and assistants can manage services
CREATE POLICY "Admins and assistants can manage services"
ON public.services FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant')
);

-- 4. RLS Policies for service_categories
DROP POLICY IF EXISTS "Users can view their clinic's service categories" ON public.service_categories;
DROP POLICY IF EXISTS "Admins and assistants can manage service categories" ON public.service_categories;

CREATE POLICY "Users can view their clinic's service categories"
ON public.service_categories FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins and assistants can manage service categories"
ON public.service_categories FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant')
);

-- 5. Seed default categories if none exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.service_categories) THEN
        INSERT INTO public.service_categories (name, color) VALUES
        ('Consultation', '#3454D1'),
        ('Diagnostic', '#6366F1'),
        ('Hygiene', '#10B981'),
        ('Prevention', '#059669'),
        ('Dental Care', '#3B82F6'),
        ('Endodontics', '#8B5CF6'),
        ('Prosthodontics', '#F59E0B'),
        ('Implantology', '#EF4444'),
        ('Orthodontics', '#EC4899'),
        ('Pediatric Dentistry', '#F97316'),
        ('Cosmetic Dentistry', '#14B8A6'),
        ('Oral Surgery', '#64748B'),
        ('Emergency', '#DC2626');
    END IF;
END $$;
