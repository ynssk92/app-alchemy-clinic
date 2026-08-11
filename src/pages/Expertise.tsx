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
  
  // Logic to identify a featured item
  const featuredItem = features.length > 0 ? features[0] : null;
  const regularItems = features.length > 1 ? features.slice(1) : [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <PageShell
      title={page?.seo_title || "Expertise — La Dune Clinique Dentaire"}
      description={page?.seo_description || "Technologies de pointe et savoir-faire clinique au service de votre sourire."}
      path="/expertise"
      heading={page?.heading || "Expertise Médicale Avancée"}
      hideHero
    >
      <div className="min-h-screen bg-[#f8fafc]">
        <section className="relative overflow-hidden px-6 pb-24 pt-16 sm:pb-32 sm:pt-24 lg:pt-32">
          {/* Subtle background decoration */}
          <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />
          
          <div className="mx-auto max-w-[1280px]">
            {/* Redesigned Section Header */}
            <div className="relative mb-20 text-center sm:mb-28">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 inline-flex items-center gap-3"
              >
                <div className="h-[1px] w-6 bg-primary/20" />
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
                  {page?.eyebrow || "OUR EXPERTISE"}
                </span>
                <div className="h-[1px] w-6 bg-primary/20" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mx-auto max-w-4xl text-[2.75rem] font-bold leading-[1.1] tracking-tight text-[#1a2b4b] sm:text-[3.75rem] lg:text-[4.5rem]"
              >
                {page?.heading || "Advanced Care. Proven Expertise."}
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-500 sm:text-xl"
              >
                {page?.subheading || "Discover the expertise, technology and treatments that help us deliver precise, comfortable and personalized care."}
              </motion.p>
            </div>

            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4"
            >
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <Skeleton 
                    key={i} 
                    className={i === 0 ? "h-[320px] md:col-span-2 rounded-[20px]" : "h-[320px] rounded-[20px]"} 
                  />
                ))
              ) : (
                <>
                  {/* Featured Item */}
                  {featuredItem && (
                    <motion.div variants={item} className="md:col-span-2">
                      <ExpertiseCard
                        icon={resolveIcon(featuredItem.icon)}
                        title={featuredItem.title || ""}
                        text={featuredItem.body || ""}
                        features={featuredItem.items}
                        featured
                      />
                    </motion.div>
                  )}

                  {/* Regular Items */}
                  {regularItems.map((f) => (
                    <motion.div key={f.id} variants={item}>
                      <ExpertiseCard
                        icon={resolveIcon(f.icon)}
                        title={f.title || ""}
                        text={f.body || ""}
                      />
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>

            {/* CTA Section */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-28 text-center sm:mt-36"
            >
              <div className="inline-flex flex-col items-center gap-8 rounded-[40px] border border-slate-100 bg-white p-10 shadow-soft sm:px-20 sm:py-16">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight text-[#1a2b4b] sm:text-4xl">Need personalized care?</h2>
                  <p className="mx-auto max-w-md text-lg text-slate-500">Talk to our team and find the right treatment for you.</p>
                </div>
                <div className="flex flex-col items-center gap-6 sm:flex-row">
                  <Link to="/booking">
                    <Button size="lg" className="h-14 rounded-xl px-10 text-base font-bold shadow-soft transition-all hover:shadow-medium active:scale-[0.98]">
                      Book an appointment <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to="/equipe" className="text-sm font-bold text-slate-400 hover:text-primary transition-colors">
                    Meet our doctors
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
