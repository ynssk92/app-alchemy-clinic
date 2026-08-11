import { useEffect, useMemo, useState } from "react";
import { PageShell } from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { resolveImage } from "@/lib/pageContent";
import { ServiceTabs } from "@/components/services/ServiceTabs";
import { ServiceCard } from "@/components/services/ServiceCard";

const Soins = () => {
  const { page, blocks, loading } = usePageContent("soins");
  const categories = useMemo(() => blocks.filter((b) => b.kind === "category"), [blocks]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!active && categories.length) setActive(categories[0].id);
  }, [categories, active]);

  const current = categories.find((c) => c.id === active) || categories[0];

  return (
    <PageShell
      title={page?.seo_title || "Nos Soins — La Dune Clinique Dentaire"}
      description={page?.seo_description || "Découvrez la gamme complète de soins dentaires proposés à La Dune Clinique Dentaire."}
      path="/soins"
      hideHero
      heading={page?.heading || "Nos Soins"}
    >
      <section className="relative -mx-4 overflow-hidden px-4 py-20 sm:py-24 lg:py-[140px]">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-muted/60 via-background to-background" />
        <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-[420px] w-[420px] rounded-full bg-accent/10 blur-3xl" />

        <div className="mx-auto w-full max-w-[1280px]">
          {/* Header */}
          <header className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              Soins dentaires premium
            </span>
            <h1 className="mt-6 text-[34px] font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-[44px] lg:text-[54px]">
              Des{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">soins dentaires</span>
              <br className="hidden sm:block" /> complets, pensés pour vous
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
              {page?.subheading ||
                "Une prise en charge sur mesure, des technologies de pointe et une équipe dédiée à votre confort — du diagnostic au sourire final."}
            </p>
          </header>

          {loading ? (
            <div className="mt-12 space-y-6">
              <Skeleton className="mx-auto h-11 w-full max-w-xl rounded-full" />
              <Skeleton className="h-[520px] w-full rounded-[32px]" />
            </div>
          ) : !current ? (
            <p className="mt-12 text-center text-muted-foreground">Aucun soin publié pour le moment.</p>
          ) : (
            <>
              <div className="mt-10 sm:mt-12">
                <ServiceTabs
                  items={categories.map((c) => ({ id: c.id, label: c.title || "Soin" }))}
                  activeId={current.id}
                  onChange={setActive}
                />
              </div>

              <div key={current.id} className="mt-10 animate-fade-in sm:mt-12">
                <ServiceCard
                  name={current.subtitle || current.title || "Soin dentaire"}
                  description={current.body}
                  features={current.items}
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

export default Soins;
