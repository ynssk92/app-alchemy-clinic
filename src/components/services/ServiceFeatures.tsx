import { CheckCircle2 } from "lucide-react";

interface ServiceFeaturesProps {
  items: string[];
}

export const ServiceFeatures = ({ items }: ServiceFeaturesProps) => {
  if (!items.length) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/40 px-4 py-3 transition-all duration-[250ms] hover:-translate-y-0.5 hover:border-primary/35 hover:bg-card hover:shadow-soft"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden />
          <span className="text-[15px] font-semibold leading-snug text-foreground">{item}</span>
        </li>
      ))}
    </ul>
  );
};

export default ServiceFeatures;
