
-- 1. Create the table for translation overrides
CREATE TABLE IF NOT EXISTS public.translation_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lang TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(lang, key)
);

-- 2. Grant access
GRANT SELECT, INSERT, UPDATE, DELETE ON public.translation_overrides TO authenticated;
GRANT ALL ON public.translation_overrides TO service_role;

-- 3. Enable RLS
ALTER TABLE public.translation_overrides ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies
-- Only admins can modify translations. Anyone authenticated can read them for the app to function.
CREATE POLICY "Anyone authenticated can read translations"
ON public.translation_overrides
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Only admins can insert translations"
ON public.translation_overrides
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update translations"
ON public.translation_overrides
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete translations"
ON public.translation_overrides
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_translation_overrides_updated_at
    BEFORE UPDATE ON public.translation_overrides
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
