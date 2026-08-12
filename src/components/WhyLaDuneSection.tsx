import { motion } from "framer-motion";
import type { PageBlock } from "@/hooks/usePageContent";
import { resolveImage } from "@/lib/pageContent";

interface WhyLaDuneSectionProps {
  blocks?: PageBlock[];
}

export const WhyLaDuneSection = ({ blocks }: WhyLaDuneSectionProps) => {
  const cmsBlock = blocks?.[0];

  return (
    <section className="py-24 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              {cmsBlock?.subtitle || "Why Choose Us"}
            </span>
            <h2 className="mt-4 text-[40px] md:text-[52px] font-bold tracking-tight text-slate-900 leading-[1.1]">
              {cmsBlock?.title || "Why choose La Dune?"}
            </h2>
            <p className="mt-8 text-lg text-slate-500 leading-relaxed mb-10">
              {cmsBlock?.body || "We combine professional excellence with a deeply human approach, ensuring that your journey to a better smile is as comfortable as it is effective."}
            </p>
            
            <div className="space-y-8">
              {(cmsBlock?.items || [
                "Personalized treatment plans for every patient",
                "Highly experienced multidisciplinary team",
                "Painless and minimally invasive techniques",
                "Advanced digital dentistry workflow"
              ]).map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                  <span className="text-base font-bold text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="aspect-[16/10] rounded-[40px] overflow-hidden shadow-2xl relative">
              <img 
                src={resolveImage(cmsBlock?.image_url) || "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?q=80&w=2000&auto=format&fit=crop"} 
                alt="Clinic Interior" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-primary/5 mix-blend-multiply" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
