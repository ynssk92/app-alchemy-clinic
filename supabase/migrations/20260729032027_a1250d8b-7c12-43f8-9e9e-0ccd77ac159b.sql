CREATE TABLE public.site_pages (
  slug text PRIMARY KEY,
  name text NOT NULL,
  seo_title text NOT NULL,
  seo_description text NOT NULL,
  eyebrow text,
  heading text NOT NULL,
  subheading text,
  intro text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.page_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug text NOT NULL REFERENCES public.site_pages(slug) ON DELETE CASCADE,
  kind text NOT NULL DEFAULT 'card',
  title text,
  subtitle text,
  body text,
  image_url text,
  icon text,
  items text[] NOT NULL DEFAULT '{}',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX page_blocks_page_slug_idx ON public.page_blocks(page_slug, sort_order);

GRANT SELECT ON public.site_pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_pages TO authenticated;
GRANT ALL ON public.site_pages TO service_role;

GRANT SELECT ON public.page_blocks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_blocks TO authenticated;
GRANT ALL ON public.page_blocks TO service_role;

ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site pages are viewable by everyone" ON public.site_pages FOR SELECT USING (true);
CREATE POLICY "Admins can insert site pages" ON public.site_pages FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update site pages" ON public.site_pages FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete site pages" ON public.site_pages FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Published blocks are viewable by everyone" ON public.page_blocks FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert page blocks" ON public.page_blocks FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update page blocks" ON public.page_blocks FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete page blocks" ON public.page_blocks FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_pages_set_updated_at BEFORE UPDATE ON public.site_pages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER page_blocks_set_updated_at BEFORE UPDATE ON public.page_blocks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.site_pages (slug, name, seo_title, seo_description, eyebrow, heading, subheading, intro) VALUES
('about','À Propos','À Propos — La Dune Clinique Dentaire','Découvrez l''histoire, la mission et les valeurs de La Dune Clinique Dentaire.','Qui sommes-nous','À Propos de La Dune','Une clinique dentaire moderne dédiée à votre bien-être bucco-dentaire, alliant expertise, technologie et confort.','Fondée avec la vision d''offrir des soins dentaires d''excellence, La Dune Clinique Dentaire accueille chaque patient dans un environnement chaleureux et professionnel.

Notre équipe pluridisciplinaire s''engage à fournir des traitements personnalisés, en utilisant les dernières avancées technologiques pour garantir précision, confort et résultats durables.'),
('soins','Nos Soins','Nos Soins — La Dune Clinique Dentaire','Découvrez la gamme complète de soins dentaires proposés à La Dune Clinique Dentaire : esthétique, implantologie, orthodontie et plus.','Nos prestations','Une Expertise Complète','Tous vos soins, de l''esthétique à la chirurgie, au même endroit.',NULL),
('expertise','Expertise','Expertise — La Dune Clinique Dentaire','Technologies de pointe et savoir-faire clinique au service de votre sourire.','Technologie avancée','Équipements médicaux de pointe','Nous investissons dans les meilleures technologies et la formation continue pour offrir des soins d''exception, précis et confortables.',NULL);

INSERT INTO public.page_blocks (page_slug, kind, title, body, icon, sort_order) VALUES
('about','mission','Notre mission','Rendre les soins dentaires accessibles, transparents et humains — pour chaque sourire.',NULL,0),
('about','value','Bienveillance','Une écoute attentive à chaque étape.','Heart',1),
('about','value','Excellence','Des standards cliniques rigoureux.','Award',2),
('about','value','Proximité','Un accompagnement humain et durable.','Users',3);

INSERT INTO public.page_blocks (page_slug, kind, title, subtitle, body, image_url, items, sort_order) VALUES
('soins','category','Esthétique du Sourire','Esthétique du Sourire','Révélez votre meilleur sourire grâce à nos techniques avancées de dentisterie cosmétique.','/src/assets/soin-esthetique.jpg', ARRAY['Blanchiment Dentaire','Facettes (Chirurgie Esthétique)','Prothèses (Couronnes & Bridges)'],1),
('soins','category','Implantologie','Implantologie','Retrouvez le confort et la fonctionnalité d''une dentition complète avec des implants sur mesure.','/src/assets/soin-implant.jpg', ARRAY['Implants dentaires unitaires','All-on-4 / All-on-6','Greffe osseuse et sinus lift'],2),
('soins','category','Orthodontie','Orthodontie','Alignez votre sourire discrètement avec nos solutions invisibles ou traditionnelles.','/src/assets/soin-ortho.jpg', ARRAY['Aligneurs transparents (Invisalign)','Bagues métalliques et céramiques','Orthodontie enfant & adulte'],3),
('soins','category','Esthétique du Visage','Esthétique du Visage','Sublimez votre visage avec des soins esthétiques complémentaires à votre sourire.','/src/assets/soin-visage.jpg', ARRAY['Injections d''acide hyaluronique','Toxine botulique','Harmonisation faciale'],4),
('soins','category','Diagnostic & Soins','Diagnostic & Soins','Une prise en charge complète, de la prévention aux traitements conservateurs.','/src/assets/soin-diagnostic.jpg', ARRAY['Bilan et radiographie 3D','Détartrage et prophylaxie','Traitement des caries et endodontie'],5);

INSERT INTO public.page_blocks (page_slug, kind, title, body, icon, items, sort_order) VALUES
('expertise','feature','Imagerie 3D','Scanner cône beam pour un diagnostic précis.','ScanLine', ARRAY['Haute précision','Faible irradiation','Diagnostic rapide'],1),
('expertise','feature','CFAO Numérique','Prothèses conçues et usinées sur place.','Cpu', ARRAY['Empreinte optique','Usinage en clinique','Pose en 1 séance'],2),
('expertise','feature','Microscopie','Endodontie assistée pour un traitement minutieux.','Microscope', ARRAY['Vision x25','Gestes conservateurs','Taux de succès élevé'],3),
('expertise','feature','Laser dentaire','Interventions douces et cicatrisation rapide.','Zap', ARRAY['Sans douleur','Peu de saignement','Récupération rapide'],4);

INSERT INTO public.page_blocks (page_slug, kind, title, icon, sort_order) VALUES
('expertise','stat','15+ technologies','Sparkles',10),
('expertise','stat','Certifié ISO','ShieldCheck',11),
('expertise','stat','Équipements dernière génération','Activity',12);