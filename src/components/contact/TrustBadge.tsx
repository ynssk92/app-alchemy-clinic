import { LucideIcon } from "lucide-react";

interface TrustBadgeProps {
  icon: LucideIcon;
  label: string;
}

export const TrustBadge = ({ icon: Icon, label }: TrustBadgeProps) => (
  <div className="group flex items-center gap-3 rounded-2xl border border-border/70 bg-card/80 px-4 py-3 backdrop-blur-sm transition-all duration-250 hover:-translate-y-0.5 hover:shadow-medium">
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-250 group-hover:rotate-6">
      <Icon className="h-4 w-4" />
    </span>
    <span className="text-sm font-medium text-foreground leading-snug">{label}</span>
  </div>
);

export default TrustBadge;
