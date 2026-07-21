import { PageShell } from "@/components/PageShell";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Comment prendre rendez-vous ?", a: "Vous pouvez réserver en ligne via notre plateforme ou nous appeler directement à la clinique." },
  { q: "Quels moyens de paiement acceptez-vous ?", a: "Nous acceptons les cartes bancaires, les espèces et proposons des facilités de paiement." },
  { q: "Êtes-vous conventionnés avec les assurances ?", a: "Oui, nous travaillons avec la plupart des mutuelles et assurances santé." },
  { q: "Proposez-vous des soins d'urgence ?", a: "Oui, des créneaux sont réservés chaque jour pour les urgences dentaires." },
  { q: "À partir de quel âge accueillez-vous les enfants ?", a: "Dès la première dent, généralement autour de l'âge de 1 an, pour un premier contrôle." },
  { q: "Combien de temps dure une consultation ?", a: "Une consultation standard dure entre 30 et 45 minutes selon le motif." },
];

const Faq = () => (
  <PageShell
    title="FAQ — La Dune Clinique Dentaire"
    description="Réponses aux questions les plus fréquentes sur nos soins, rendez-vous et tarifs."
    path="/faq"
    eyebrow="Questions fréquentes"
    heading="FAQ"
    subheading="Tout ce que vous devez savoir avant votre visite."
  >
    <Accordion type="single" collapsible className="max-w-3xl mx-auto">
      {faqs.map((f, i) => (
        <AccordionItem key={i} value={`item-${i}`}>
          <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
          <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </PageShell>
);

export default Faq;
