CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.faqs TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published FAQs are viewable by everyone"
  ON public.faqs FOR SELECT
  USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert FAQs"
  ON public.faqs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update FAQs"
  ON public.faqs FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete FAQs"
  ON public.faqs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER faqs_set_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.faqs (question, answer, sort_order) VALUES
('Comment prendre rendez-vous ?','Vous pouvez réserver en ligne via notre plateforme ou nous appeler directement à la clinique.',1),
('Quels moyens de paiement acceptez-vous ?','Nous acceptons les cartes bancaires, les espèces et proposons des facilités de paiement.',2),
('Êtes-vous conventionnés avec les assurances ?','Oui, nous travaillons avec la plupart des mutuelles et assurances santé.',3),
('Proposez-vous des soins d''urgence ?','Oui, des créneaux sont réservés chaque jour pour les urgences dentaires.',4),
('À partir de quel âge accueillez-vous les enfants ?','Dès la première dent, généralement autour de l''âge de 1 an, pour un premier contrôle.',5),
('Combien de temps dure une consultation ?','Une consultation standard dure entre 30 et 45 minutes selon le motif.',6);