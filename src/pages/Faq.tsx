import { useEffect, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { supabase } from "@/integrations/supabase/client";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle, ChevronDown } from "lucide-react";

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
      hideHero
    >
      <div className="relative -mx-4 overflow-hidden bg-[#F8FAFC] px-4 py-[100px]">
        {/* subtle blue radial gradients */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-[#2563EB]/5 blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#06B6D4]/5 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-[1400px]">
          {/* Header Section */}
          <div className="mx-auto mb-[60px] max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#2563EB]/20 bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#2563EB] shadow-sm">
              <HelpCircle className="h-3.5 w-3.5" />
              FREQUENTLY ASKED QUESTIONS
            </span>
            <h1 className="mt-6 text-[44px] font-bold leading-[1.1] tracking-tight text-[#1a2b4b] md:text-[56px]">
              How can we help?
            </h1>
            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-primary/20" />
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
              Find answers to the most common questions before your visit. Our team is always here to support your dental journey.
            </p>
          </div>

          {/* Content Area */}
          <div className="mx-auto max-w-[900px]">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-[72px] w-full rounded-2xl bg-white/50" />
                ))}
              </div>
            ) : faqs.length === 0 ? (
              <p className="text-center py-12 text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-200">
                Aucune question pour le moment.
              </p>
            ) : (
              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((f) => (
                  <AccordionItem 
                    key={f.id} 
                    value={f.id}
                    className="group border-none bg-white rounded-[16px] overflow-hidden shadow-soft transition-all duration-300 hover:shadow-medium border border-slate-100/50 hover:border-primary/10"
                  >
                    <AccordionTrigger 
                      className="px-6 py-5 text-left font-bold text-[#1a2b4b] text-[16px] md:text-[17px] hover:no-underline hover:text-primary transition-colors [&[data-state=open]>div>div]:bg-primary [&[data-state=open]>div>div]:text-white"
                    >
                      <div className="flex w-full items-center justify-between gap-4">
                        <span className="flex-1">{f.question}</span>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center transition-all duration-300 group-data-[state=open]:rotate-180">
                          <ChevronDown className="h-4 w-4" />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-0 text-[15px] md:text-[16px] leading-[1.7] text-slate-500/90 whitespace-pre-line animate-accordion-down">
                      <div className="pt-2 border-t border-slate-50">
                        {f.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            {/* Support CTA */}
            <div className="mt-16 text-center">
              <p className="text-slate-400 text-sm font-medium">
                Still have questions?{" "}
                <a href="/contact" className="text-primary font-bold hover:underline">
                  Contact our support team →
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default Faq;
