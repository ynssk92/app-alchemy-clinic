import { LucideIcon } from "lucide-react";

interface TrustBadgeProps {
  icon: LucideIcon;
  label: string;
}

export const TrustBadge = ({ icon: Icon, label }: TrustBadgeProps) => (
  <div className="group flex items-center gap-2.5 rounded-2xl border border-border/70 bg-card/80 px-3 py-2.5 transition-all duration-250 hover:-translate-y-0.5 hover:shadow-medium">
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stat-green/10 text-stat-green transition-transform duration-250 group-hover:rotate-6">
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
    </span>
    <span className="text-xs font-medium leading-snug text-foreground">{label}</span>
  </div>
);

export default TrustBadge;
