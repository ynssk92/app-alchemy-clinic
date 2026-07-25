import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

export const SidebarFooter = ({ children }: { children: ReactNode }) => {
  const { collapsed } = useSidebar();
  return (
    <div
      className={cn(
        "border-t border-border p-3 space-y-1",
        collapsed && "flex flex-col items-center",
      )}
    >
      {children}
    </div>
  );
};
