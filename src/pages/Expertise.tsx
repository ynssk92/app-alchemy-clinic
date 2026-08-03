import { PageShell } from "@/components/PageShell";
import { ExpertiseCard } from "@/components/ExpertiseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { resolveIcon } from "@/lib/pageContent";

const Expertise = () => {
  const { page, blocks, loading } = usePageContent("expertise");
  const features = blocks.filter((b) => b.kind === "feature");
  const stats = blocks.filter((b) => b.kind === "stat");

  return (
    <PageShell
      title={page?.seo_title || "Expertise — La Dune Clinique Dentaire"}
      description={page?.seo_description || "Technologies de pointe et savoir-faire clinique au service de votre sourire."}
      path="/expertise"
      heading={page?.heading || "Une expertise à la pointe"}
      hideHero
    >
      <section className="relative -mx-4 -mt-8 overflow-hidden px-4 md:-mt-10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="pointer-events-none absolute -top-16 left-0 -z-10 h-48 w-48 rounded-full bg-primary/10 blur-2xl sm:-top-20 sm:left-1/4 sm:h-64 sm:w-64 sm:blur-3xl lg:-top-24 lg:h-72 lg:w-72" />
        <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-52 w-52 rounded-full bg-secondary/10 blur-2xl sm:h-72 sm:w-72 sm:blur-3xl lg:h-80 lg:w-80" />

        <div className="relative mx-auto max-w-[1280px] py-10 sm:py-14 lg:py-20">
          <div className="flex flex-col gap-8 sm:gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <div className="max-w-2xl">
              {page?.eyebrow && (
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary sm:px-4 sm:text-xs">
                  <Zap className="h-3.5 w-3.5 shrink-0" /> {page.eyebrow}
                </span>
              )}
              <h1 className="mt-4 text-[1.9rem] font-bold leading-[1.12] tracking-tight text-foreground xs:text-4xl sm:mt-6 sm:text-5xl lg:text-[3.25rem]">
                {page?.heading || "Équipements médicaux de pointe"}
              </h1>
              {page?.subheading && (
                <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">{page.subheading}</p>
              )}
            </div>

            <ul className="flex flex-col gap-3 lg:min-w-[240px]">
              {stats.map((s) => {
                const Icon = resolveIcon(s.icon);
                return (
                  <li
                    key={s.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3 text-sm font-medium text-foreground shadow-soft backdrop-blur"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-primary" />
                    {s.title}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 sm:gap-8 md:grid-cols-2 lg:mt-14 xl:grid-cols-4">

            {loading
              ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-[300px] w-full rounded-3xl" />)
              : features.map((f) => (
                  <ExpertiseCard
                    key={f.id}
                    icon={resolveIcon(f.icon)}
                    title={f.title || ""}
                    text={f.body || ""}
                    features={f.items}
                  />
                ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Expertise;
