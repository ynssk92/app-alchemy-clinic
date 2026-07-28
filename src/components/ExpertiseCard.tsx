import { ArrowRight, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ExpertiseCardProps {
  icon: LucideIcon;
  title: string;
  text: string;
  features: string[];
  className?: string;
  style?: React.CSSProperties;
}

export const ExpertiseCard = ({ icon: Icon, title, text, features, className, style }: ExpertiseCardProps) => {
  return (
    <article
      style={style}
      className={cn(
        "group relative flex min-h-[300px] flex-col rounded-3xl border border-border bg-card p-8",
        "shadow-soft transition-all duration-[250ms] ease-out",
        "hover:-translate-y-2 hover:scale-[1.03] hover:border-primary/60 hover:shadow-large",
        className,
      )}
    >
      {/* gradient glow behind icon */}
      <div className="pointer-events-none absolute left-6 top-4 h-24 w-24 rounded-full bg-gradient-primary opacity-0 blur-2xl transition-opacity duration-[250ms] group-hover:opacity-40" />

      <div className="relative mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-primary shadow-medium transition-transform duration-[250ms] group-hover:rotate-6 group-hover:scale-105">
        <Icon className="h-[34px] w-[34px] text-primary-foreground" strokeWidth={1.75} />
      </div>

      <h3 className="text-[22px] font-bold leading-snug text-foreground">{title}</h3>
      <p className="mt-2 line-clamp-2 text-base text-muted-foreground">{text}</p>

      <ul className="mt-5 space-y-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-3 w-3 text-primary" strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          En savoir plus
          <ArrowRight className="h-4 w-4 transition-transform duration-[250ms] group-hover:translate-x-1" />
        </span>
      </div>
    </article>
  );
};

export default ExpertiseCard;
