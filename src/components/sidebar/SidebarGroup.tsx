import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
  return (
    <div className={collapsed ? "" : "space-y-1"}>
      <div
        className={cn(
          "px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-200",
          collapsed ? "h-0 opacity-0 overflow-hidden mb-0" : "h-4 opacity-100",
        )}
        aria-hidden={collapsed}
      >
        {t(title)}
      </div>
      <div
        className={cn(
          collapsed ? "flex flex-col items-center gap-3" : "space-y-1",
        )}
        role="group"
        aria-label={title}
      >
        {children}
      </div>
      {collapsed && (
        <div className="mx-auto mt-3 h-px w-8 bg-[#E5E7EB]" aria-hidden="true" />
      )}
    </div>
  );
};
