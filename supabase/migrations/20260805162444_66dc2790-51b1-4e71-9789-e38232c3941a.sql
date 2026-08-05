
-- Create gallery_images table
CREATE TABLE public.gallery_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Clinic',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

-- Grant access
GRANT SELECT ON public.gallery_images TO authenticated, anon;
GRANT ALL ON public.gallery_images TO authenticated; -- Role-based access handled by policies
GRANT ALL ON public.gallery_images TO service_role;

-- Policies
CREATE POLICY "Anyone can view gallery images" ON public.gallery_images
    FOR SELECT USING (true);

CREATE POLICY "Admins and assistants can manage gallery images" ON public.gallery_images
    FOR ALL TO authenticated
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'assistant'));

-- Initial data
INSERT INTO public.gallery_images (title, description, category, image_url, display_order)
VALUES 
('Notre Accueil', 'Un espace chaleureux pour vous recevoir dans les meilleures conditions.', 'Cabinet', 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80&w=2000', 1),
('Salles de Soins', 'Équipements de pointe pour des soins d''excellence.', 'Équipement', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2000', 2),
('Espace Détente', 'Patientez sereinement dans notre salon moderne.', 'Cabinet', 'https://images.unsplash.com/photo-1629909615184-74f49af3b97a?auto=format&fit=crop&q=80&w=2000', 3),
('Stérilisation', 'Hygiène et sécurité sont nos priorités absolues.', 'Hygiène', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=2000', 4),
('Scanner 3D', 'Précision diagnostique grâce à l''imagerie numérique.', 'Technologie', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=2000', 5),
('Notre Équipe', 'Une équipe passionnée à votre écoute au quotidien.', 'Équipe', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=2000', 6);
