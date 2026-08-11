import { useMemo, useState, useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { resolveImage } from "@/lib/pageContent";
import { ServiceTabs } from "@/components/services/ServiceTabs";
import { ServiceCard } from "@/components/services/ServiceCard";

const Expertise = () => {
  const { page, blocks, loading } = usePageContent("expertise");
  
  // Reuse the logic from Soins.tsx to identify categories/items
  // Assuming page_blocks for "expertise" also follow a similar kind-based structure or just features
  // In the previous redesign, features were used. Let's see if we can adapt it to the Soins structure.
  const categories = useMemo(() => blocks.filter((b) => b.kind === "feature" || b.kind === "category"), [blocks]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!active && categories.length) setActive(categories[0].id);
  }, [categories, active]);

  const current = categories.find((c) => c.id === active) || categories[0];

  return (
    <PageShell
      title={page?.seo_title || "Expertise — La Dune Clinique Dentaire"}
      description={page?.seo_description || "Technologies de pointe et savoir-faire clinique au service de votre sourire."}
      path="/expertise"
      heading={page?.heading || "Expertise Médicale Avancée"}
      hideHero
    >
      <section className="relative -mx-4 overflow-hidden px-4 py-20 sm:py-24 lg:py-[140px]">
        {/* Decorative background inspired by Soins.tsx */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-muted/60 via-background to-background" />
        <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />

        <div className="mx-auto w-full max-w-[1280px]">
          {/* Header inspired by Soins.tsx */}
          <header className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              {page?.eyebrow || "Innovation & Technologie"}
            </span>
            <h1 className="mt-6 text-[34px] font-extrabold leading-[1.08] tracking-tight text-[#1a2b4b] sm:text-[44px] lg:text-[54px]">
              {page?.heading?.split(".")[0] || "Advanced Care"}
              {page?.heading?.includes(".") && (
                <>
                  . <span className="bg-gradient-primary bg-clip-text text-transparent">{page.heading.split(".")[1]}</span>
                </>
              )}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-slate-500">
              {page?.subheading || "Discover the expertise, technology and treatments that help us deliver precise, comfortable and personalized care."}
            </p>
          </header>

          {loading ? (
            <div className="mt-12 space-y-6">
              <Skeleton className="mx-auto h-11 w-full max-w-xl rounded-full" />
              <Skeleton className="h-[520px] w-full rounded-[32px]" />
            </div>
          ) : !current ? (
            <p className="mt-12 text-center text-muted-foreground">Aucune expertise publiée pour le moment.</p>
          ) : (
            <>
              {categories.length > 1 && (
                <div className="mt-10 sm:mt-12">
                  <ServiceTabs
                    items={categories.map((c) => ({ id: c.id, label: c.title || "Expertise" }))}
                    activeId={current.id}
                    onChange={setActive}
                  />
                </div>
              )}

              <div key={current.id} className="mt-10 animate-fade-in sm:mt-12">
                <ServiceCard
                  name={current.title || "Expertise Médicale"}
                  description={current.body}
                  features={current.items || []}
                  imageSrc={resolveImage(current.image_url) || undefined}
                />
              </div>
            </>
          )}
        </div>
      </section>
    </PageShell>
  );
};

export default Expertise;

