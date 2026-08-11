import { Activity, Gem, Microscope, Smile, Sparkles, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ServiceTabItem {
  id: string;
  label: string;
}

interface ServiceTabsProps {
  items: ServiceTabItem[];
  activeId: string;
  onChange: (id: string) => void;
}

const ICONS = [Sparkles, Stethoscope, Smile, Microscope, Gem, Activity];

export const ServiceTabs = ({ items, activeId, onChange }: ServiceTabsProps) => (
  <div
    role="tablist"
    aria-label="Catégories de soins"
    className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3"
  >
    {items.map((item, i) => {
      const active = item.id === activeId;
      const Icon = ICONS[i % ICONS.length];
      return (
        <button
          key={item.id}
          role="tab"
          type="button"
          aria-selected={active}
          onClick={() => onChange(item.id)}
          className={cn(
            "group inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold",
            "transition-all duration-[250ms] ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
            "sm:px-5 sm:text-[15px]",
            active
              ? "border-transparent bg-gradient-primary text-primary-foreground shadow-[0_10px_30px_-12px_hsl(var(--primary)/0.65)]"
              : "border-border bg-card text-foreground/80 hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground hover:shadow-soft"
          )}
        >
          <Icon
            className={cn("h-4 w-4", active ? "text-primary-foreground" : "text-primary")}
            aria-hidden
          />
          <span className="whitespace-nowrap">{item.label}</span>
        </button>
      );
    })}
  </div>
);

export default ServiceTabs;
