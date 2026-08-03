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
      <section className="relative -mx-4 overflow-hidden px-4">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="pointer-events-none absolute -top-24 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 right-0 -z-10 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />

        <div className="relative mx-auto max-w-[1280px] py-20 md:py-[140px]">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              {page?.eyebrow && (
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                  <Zap className="h-3.5 w-3.5" /> {page.eyebrow}
                </span>
              )}
              <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl">
                {page?.heading || "Équipements médicaux de pointe"}
              </h1>
              {page?.subheading && (
                <p className="mt-5 text-lg text-muted-foreground">{page.subheading}</p>
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
                    <Icon className="h-4 w-4 text-primary" />
                    {s.title}
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
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
