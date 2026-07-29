import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";

interface FaqItem { id: string; question: string; answer: string }

const Faq = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("faqs")
        .select("id, question, answer")
        .eq("published", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (!active) return;
      setFaqs((data as FaqItem[]) || []);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  return (
    <PageShell
      title="FAQ — La Dune Clinique Dentaire"
      description="Réponses aux questions les plus fréquentes sur nos soins, rendez-vous et tarifs."
      path="/faq"
      eyebrow="Questions fréquentes"
      heading="FAQ"
      subheading="Tout ce que vous devez savoir avant votre visite."
    >
      <div className="max-w-3xl mx-auto">
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : faqs.length === 0 ? (
          <p className="text-center text-muted-foreground">Aucune question pour le moment.</p>
        ) : (
          <Accordion type="single" collapsible>
            {faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id}>
                <AccordionTrigger className="text-left font-semibold">{f.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground whitespace-pre-line">{f.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </PageShell>
  );
};

export default Faq;
