import { Award, ShieldCheck, Smile } from "lucide-react";

const BADGES = [
  { icon: Award, label: "Spécialistes certifiés" },
  { icon: ShieldCheck, label: "Équipement moderne" },
  { icon: Smile, label: "Consultation le jour même" },
];

export const TrustBadges = () => (
  <div className="flex flex-wrap items-center gap-2.5">
    {BADGES.map(({ icon: Icon, label }) => (
      <span
        key={label}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-colors duration-[250ms] hover:border-primary/40 hover:text-foreground"
      >
        <Icon className="h-4 w-4 text-primary" aria-hidden />
        {label}
      </span>
    ))}
  </div>
);

export default TrustBadges;
