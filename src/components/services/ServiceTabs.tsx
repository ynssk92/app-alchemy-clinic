import { 
  Activity, 
  Gem, 
  Microscope, 
  Smile, 
  Sparkles, 
  Stethoscope,
  Component,
  Zap,
  Star
} from "lucide-react";
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

const EMOJIS = ["✨", "🦷", "😁", "🔬", "💎", "🌟"];

export const ServiceTabs = ({ items, activeId, onChange }: ServiceTabsProps) => (
  <div
    role="tablist"
    aria-label="Catégories de soins"
    className="flex flex-wrap items-center justify-center gap-3 sm:gap-4"
  >
    {items.map((item, i) => {
      const active = item.id === activeId;
      const emoji = EMOJIS[i % EMOJIS.length];
      return (
        <button
          key={item.id}
          role="tab"
          type="button"
          aria-selected={active}
          onClick={() => onChange(item.id)}
          className={cn(
            "group inline-flex items-center gap-2.5 rounded-full border px-5 py-3 text-sm font-semibold shadow-soft",
            "transition-all duration-[250ms] ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
            "sm:px-6 sm:py-3.5 sm:text-[15px]",
            active
              ? "border-transparent bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-[0_12px_24px_-8px_rgba(37,99,235,0.4)]"
              : "border-slate-200 bg-white text-slate-600 hover:-translate-y-1 hover:border-blue-300 hover:text-blue-600 hover:shadow-medium"
          )}
        >
          <span className="text-base sm:text-lg">{emoji}</span>
          <span className="whitespace-nowrap">{item.label}</span>
        </button>
      );
    })}
  </div>
);

export default ServiceTabs;
