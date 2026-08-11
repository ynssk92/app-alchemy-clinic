import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ExpertiseCardProps {
  icon: LucideIcon;
  title: string;
  text: string;
  features?: string[];
  className?: string;
  style?: React.CSSProperties;
  featured?: boolean;
}

export const ExpertiseCard = ({ 
  icon: Icon, 
  title, 
  text, 
  features, 
  className, 
  style,
  featured = false 
}: ExpertiseCardProps) => {
  if (featured) {
    return (
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={cn(
          "group relative overflow-hidden rounded-[20px] border border-slate-100 bg-white p-8 md:p-10 lg:col-span-2 shadow-soft transition-all duration-300 hover:shadow-medium hover:border-primary/20",
          className
        )}
      >
        <div className="flex flex-col gap-8 md:flex-row md:items-center lg:gap-12">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/5 text-primary md:h-24 md:w-24">
            <Icon className="h-10 w-10 md:h-12 md:w-12" strokeWidth={1.2} />
            <div className="absolute inset-0 rounded-2xl bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          
          <div className="flex-1">
            <span className="mb-2 inline-block text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
              Featured expertise
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-[#1a2b4b] md:text-3xl">{title}</h3>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-500">{text}</p>
            
            {features && features.length > 0 && (
              <ul className="mt-6 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                {features.slice(0, 3).map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-400">
                    <div className="h-1 w-1 rounded-full bg-primary/40" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
            
            <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-primary transition-colors group-hover:text-primary/80">
              Discover this expertise
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={cn(
        "group flex flex-col rounded-[20px] border border-slate-100 bg-white p-8 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-medium",
        className
      )}
    >
      <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/5 text-primary transition-colors group-hover:bg-primary/10">
        <Icon className="h-7 w-7" strokeWidth={1.5} />
      </div>

      <h3 className="text-xl font-bold tracking-tight text-[#1a2b4b]">{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-slate-500">{text}</p>

      <div className="mt-auto pt-8">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary/90 transition-all group-hover:gap-2 group-hover:text-primary">
          Learn more
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </motion.article>
  );
};

export default ExpertiseCard;
