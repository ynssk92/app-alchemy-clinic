import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

export const SidebarFooter = ({ children }: { children: ReactNode }) => {
  const { collapsed } = useSidebar();
  return (
    <div
      className={cn(
        collapsed
          ? "border-t border-slate-800/80 py-3 flex flex-col items-center gap-3"
          : "border-t border-border p-3 space-y-1",
      )}
    >
      {children}
    </div>
  );
};
