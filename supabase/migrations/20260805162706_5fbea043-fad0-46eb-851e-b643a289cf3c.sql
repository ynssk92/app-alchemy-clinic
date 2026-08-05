
-- Create gallery_events table
CREATE TABLE public.gallery_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id UUID REFERENCES public.gallery_images(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL, -- 'click', 'open', 'next', 'previous'
    session_id UUID,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_events ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT INSERT ON public.gallery_events TO authenticated, anon;
GRANT SELECT ON public.gallery_events TO authenticated; -- Admins/Staff can read
GRANT ALL ON public.gallery_events TO service_role;

-- Policies
CREATE POLICY "Anyone can insert events" ON public.gallery_events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins and staff can view events" ON public.gallery_events
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));
