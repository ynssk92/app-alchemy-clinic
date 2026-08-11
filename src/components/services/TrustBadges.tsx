import { Award, ShieldCheck, Smile } from "lucide-react";

const BADGES = [
  { icon: Award, label: "Spécialistes certifiés" },
  { icon: ShieldCheck, label: "Équipement moderne" },
  { icon: Smile, label: "Consultation le jour même" },
];

export const TrustBadges = () => (
  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
    {BADGES.map(({ icon: Icon, label }) => (
      <span
        key={label}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold text-muted-foreground transition-colors duration-[250ms] hover:border-primary/40 hover:text-foreground sm:gap-2 sm:px-3.5 sm:py-2 sm:text-xs"
      >
        <Icon className="h-3.5 w-3.5 flex-shrink-0 text-primary sm:h-4 sm:w-4" aria-hidden />
        {label}
      </span>
    ))}
  </div>
);

export default TrustBadges;
