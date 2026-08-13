import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSidebar } from "./SidebarContext";
import { cn } from "@/lib/utils";

export const SidebarToggle = ({ className }: { className?: string }) => {
  const { collapsed, toggle } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      aria-expanded={!collapsed}
      className={cn(
        "inline-flex items-center justify-center rounded-[14px] transition-[transform,background-color,color] duration-200 ease-out cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 motion-safe:hover:scale-105",
        collapsed
          ? "w-12 h-12 text-[#334155] hover:bg-[#EEF2FF] hover:text-[#243B8F]"
          : "w-9 h-9 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {collapsed ? (
        <PanelLeftOpen className="h-5 w-5" strokeWidth={2} />
      ) : (
        <PanelLeftClose className="h-4 w-4" />
      )}
    </button>
  );
};
