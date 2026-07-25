import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

export const SidebarGroup = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  const { collapsed } = useSidebar();
  return (
    <div className="space-y-1">
      <div
        className={cn(
          "px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-200",
          collapsed ? "h-0 opacity-0 overflow-hidden mb-0" : "h-4 opacity-100",
        )}
        aria-hidden={collapsed}
      >
        {title}
      </div>
      <div className="space-y-1">{children}</div>
    </div>
  );
};
