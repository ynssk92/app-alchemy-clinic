import { CheckCircle2 } from "lucide-react";

interface ServiceFeaturesProps {
  items: string[];
}

export const ServiceFeatures = ({ items }: ServiceFeaturesProps) => {
  if (!items.length) return null;
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2 sm:gap-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex min-w-0 items-start gap-2.5 rounded-xl border border-border/70 bg-muted/40 px-3 py-2.5 transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-soft sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary sm:h-5 sm:w-5" aria-hidden />
          <span className="break-words text-sm font-semibold leading-snug text-foreground sm:text-[15px]">{item}</span>
        </li>
      ))}
    </ul>
  );
};

export default ServiceFeatures;
