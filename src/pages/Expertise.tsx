import { useMemo } from "react";
import { PageShell } from "@/components/PageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, ArrowRight, CalendarPlus, User } from "lucide-react";
import { usePageContent } from "@/hooks/usePageContent";
import { resolveImage, resolveIcon } from "@/lib/pageContent";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

const Expertise = () => {
  const { page, blocks, loading } = usePageContent("expertise");

  const expertiseItems = useMemo(
    () => blocks.filter((b) => b.kind === "feature"),
    [blocks]
  );

  return (
    <PageShell
      title={page?.seo_title || "Expertise — La Dune Clinique Dentaire"}
      description={
        page?.seo_description ||
        "Technologies de pointe et savoir-faire clinique au service de votre sourire."
      }
      path="/expertise"
      heading={page?.heading || "Advanced technology"}
      hideHero
    >
      <section className="relative overflow-hidden px-4 py-16 sm:py-20 lg:py-24">
        {/* Background Decorative Elements */}
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-muted/50 via-background to-background" />
        <div className="pointer-events-none absolute -left-32 top-10 -z-10 h-[400px] w-[400px] rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 bottom-0 -z-10 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />

        <div className="mx-auto w-full max-w-[1280px]">
          {/* Header */}
          <header className="mx-auto max-w-3xl text-center mb-16 lg:mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary mb-6">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                {page?.eyebrow || "ADVANCED TECHNOLOGY"}
              </span>
              <h1 className="text-[34px] font-extrabold leading-[1.1] tracking-tight text-[#1a2b4b] sm:text-[44px] lg:text-[54px] mb-5">
                {page?.heading || "State-of-the-art medical equipment"}
              </h1>
              <p className="mx-auto max-w-2xl text-[17px] leading-relaxed text-slate-500">
                {page?.subheading ||
                  "We invest in the best technologies and continuous training to offer exceptional, precise, and comfortable care."}
              </p>
            </motion.div>
          </header>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 w-full rounded-[20px]" />
              ))}
            </div>
          ) : expertiseItems.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-muted">
              <p className="text-muted-foreground">
                No expertise items published at the moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 lg:mb-24">
              {expertiseItems.map((item, index) => {
                const Icon = resolveIcon(item.icon);
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="h-full flex flex-col p-6 sm:p-8 bg-white border border-slate-100 rounded-[20px] shadow-sm hover:shadow-md transition-shadow duration-300">
                      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
                        <Icon className="h-6 w-6" />
                      </div>
                      
                      {resolveImage(item.image_url) && (
                        <div className="mb-6 aspect-video w-full overflow-hidden rounded-xl">
                          <img 
                            src={resolveImage(item.image_url)} 
                            alt={item.title || ""} 
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                      )}

                      <h3 className="text-xl font-bold text-[#1a2b4b] mb-3">
                        {item.title}
                      </h3>
                      
                      <p className="text-sm leading-relaxed text-slate-500 mb-6 flex-grow">
                        {item.body}
                      </p>

                      {item.items && item.items.length > 0 && (
                        <ul className="mb-6 space-y-2 text-xs text-slate-400">
                          {item.items.map((point, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <span className="h-1 w-1 rounded-full bg-primary/40" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      )}

                      <div className="mt-auto">
                        <Button
                          variant="ghost"
                          className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent font-semibold text-sm group"
                          asChild
                        >
                          <Link to="/booking">
                            Learn more
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[32px] bg-[#1a2b4b] p-8 sm:p-12 lg:p-16 text-center text-white relative overflow-hidden shadow-2xl"
          >
            {/* Background effects */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-accent/20 rounded-full blur-[80px]" />
            
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">
                Need personalized care?
              </h2>
              <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
                Talk to our team and find the right treatment for you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  size="lg"
                  className="w-full sm:w-auto px-8 h-14 bg-gradient-primary text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                  asChild
                >
                  <Link to="/booking">
                    <CalendarPlus className="mr-2 h-5 w-5" />
                    Book an appointment →
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 h-14 border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all hover:-translate-y-0.5"
                  asChild
                >
                  <Link to="/equipe">
                    <User className="mr-2 h-5 w-5" />
                    Meet our doctors
                  </Link>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </PageShell>
  );
};

export default Expertise;

