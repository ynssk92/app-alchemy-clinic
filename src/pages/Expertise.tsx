import { PageShell } from "@/components/PageShell";
import { ExpertiseCard } from "@/components/ExpertiseCard";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Sparkles } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { resolveIcon } from "@/lib/pageContent";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Expertise = () => {
  const { page, blocks, loading } = usePageContent("expertise");
  const features = blocks.filter((b) => b.kind === "feature");
  
  // Logic to identify a featured item (e.g., first one or marked by sort_order/slug)
  const featuredItem = features.length > 0 ? features[0] : null;
  const regularItems = features.length > 1 ? features.slice(1) : [];

  return (
    <PageShell
      title={page?.seo_title || "Expertise — La Dune Clinique Dentaire"}
      description={page?.seo_description || "Technologies de pointe et savoir-faire clinique au service de votre sourire."}
      path="/expertise"
      heading={page?.heading || "Expertise Médicale Avancée"}
      hideHero
    >
      <div className="min-h-screen bg-[#f8fafc]">
        <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:pb-32 sm:pt-24 lg:pt-32">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
          
          <div className="mx-auto max-w-[1280px]">
            {/* Redesigned Section Header */}
            <div className="relative mb-16 text-center sm:mb-24">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 inline-flex items-center gap-2"
              >
                <div className="h-px w-8 bg-primary/30" />
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
                  {page?.eyebrow || "NOS EXPERTISES"}
                </span>
                <div className="h-px w-8 bg-primary/30" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mx-auto max-w-3xl text-[2.5rem] font-bold leading-[1.1] tracking-tight text-[#1a2b4b] sm:text-[3.5rem] lg:text-[4rem]"
              >
                {page?.heading || "Soins de pointe. Expertise prouvée."}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground/90 sm:text-xl"
              >
                {page?.subheading || "Découvrez l'expertise, la technologie et les traitements qui nous permettent de prodiguer des soins précis, confortables et personnalisés."}
              </motion.p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-4">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <Skeleton 
                    key={i} 
                    className={i === 0 ? "h-[320px] lg:col-span-2 rounded-[24px]" : "h-[320px] rounded-[20px]"} 
                  />
                ))
              ) : (
                <>
                  {/* Featured Item */}
                  {featuredItem && (
                    <ExpertiseCard
                      icon={resolveIcon(featuredItem.icon)}
                      title={featuredItem.title || ""}
                      text={featuredItem.body || ""}
                      features={featuredItem.items}
                      featured
                    />
                  )}

                  {/* Regular Items */}
                  {regularItems.map((f) => (
                    <ExpertiseCard
                      key={f.id}
                      icon={resolveIcon(f.icon)}
                      title={f.title || ""}
                      text={f.body || ""}
                    />
                  ))}
                </>
              )}
            </div>

            {/* CTA Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-24 text-center sm:mt-32"
            >
              <div className="inline-flex flex-col items-center gap-6 rounded-[32px] border border-border bg-card p-8 shadow-soft sm:px-16 sm:py-12">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/5 text-primary">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#1a2b4b] sm:text-3xl">Besoin de soins personnalisés ?</h2>
                  <p className="mt-2 text-muted-foreground">Discutez avec notre équipe pour trouver le traitement qui vous convient.</p>
                </div>
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <Link to="/booking">
                    <Button size="lg" className="h-14 px-8 text-base shadow-soft hover:shadow-medium">
                      Prendre rendez-vous <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/equipe" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                    Rencontrez nos médecins
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageShell>
  );
};

export default Expertise;
