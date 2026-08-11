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
      <section className="relative overflow-hidden bg-[#F8FAFC] py-20 sm:py-24 lg:py-[140px]">
        {/* Luxury Background Decorations */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/50 via-white to-white" />
        <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-[500px] w-[500px] rounded-full bg-blue-100/30 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-50/40 blur-[120px]" />

        <div className="mx-auto w-full max-w-[1280px] px-6">
          {/* Header Section */}
          <header className="mx-auto max-w-4xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-5 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[#2563EB] shadow-soft transition-transform hover:scale-105">
              <span className="text-sm">🦷</span> Premium Dental Services
            </span>
            <h1 className="mt-8 text-[34px] font-bold leading-[1.08] tracking-tight text-[#1E293B] sm:text-[48px] lg:text-[54px]">
              Complete{" "}
              <span className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">
                Dental Care
              </span>
              ,
              <br className="hidden sm:block" /> Designed Around You
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-[17px] leading-relaxed text-[#64748B]">
              {page?.subheading ||
                "Experience a new standard of dental excellence. We combine cutting-edge technology with personalized care to create healthy, beautiful smiles in a luxury environment."}
            </p>
          </header>

          {loading ? (
            <div className="mt-16 space-y-8">
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-32 rounded-full" />
                ))}
              </div>
              <Skeleton className="h-[600px] w-full rounded-[32px] shadow-large" />
            </div>
          ) : !current ? (
            <p className="mt-16 text-center text-[#64748B] font-medium italic">Aucun soin publié pour le moment.</p>
          ) : (
            <div className="mt-16 sm:mt-20">
              {/* Category Navigation */}
              <div className="mb-12 sm:mb-16">
                <ServiceTabs
                  items={categories.map((c) => ({ id: c.id, label: c.title || "Soin" }))}
                  activeId={current.id}
                  onChange={setActive}
                />
              </div>

              {/* Service Display */}
              <div key={current.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                <ServiceCard
                  name={current.subtitle || current.title || "Soin dentaire"}
                  description={current.body}
                  features={current.items}
                  imageSrc={resolveImage(current.image_url) || undefined}
                />
              </div>
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
};

export default Soins;
