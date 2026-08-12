import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import type { PageBlock } from "@/hooks/usePageContent";

interface FinalCTAProps {
  block?: PageBlock;
}

export const FinalCTA = ({ block }: FinalCTAProps) => {
  return (
    <section className="py-24 md:py-32 bg-primary relative overflow-hidden">
      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -left-24 -top-24 w-96 h-96 rounded-full border-[40px] border-white" />
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full border-[40px] border-white" />
      </div>

      <div className="container mx-auto px-4 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-[40px] md:text-[64px] font-bold tracking-tight text-white leading-[1.1]">
            {block?.title || "Your smile deserves exceptional care."}
          </h2>
          <p className="mt-8 text-xl text-white/80 leading-relaxed">
            {block?.body || "Take the next step toward a healthier, more confident smile with our team of dental specialists."}
          </p>
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button asChild size="lg" className="h-14 rounded-full px-10 text-lg bg-white text-primary hover:bg-slate-50 shadow-xl shadow-black/20">
              <Link to="/booking">
                {block?.items?.[0] || "Book an Appointment"}
              </Link>
            </Button>
            <Button asChild variant="ghost" className="h-14 rounded-full px-10 text-lg text-white hover:bg-white/10">
              <Link to="/contact">
                {block?.items?.[1] || "Contact the Clinic"}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
