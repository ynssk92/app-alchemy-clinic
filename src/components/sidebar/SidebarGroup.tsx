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
  const titleParts = t(title).split(" ");
  const hasNumberPrefix = titleParts.length > 1 && /^\d+$/.test(titleParts[0]);
  const numberPrefix = hasNumberPrefix ? titleParts[0] : "";
  const mainTitle = hasNumberPrefix ? titleParts.slice(1).join(" ") : t(title);

  return (
    <div className={collapsed ? "" : "space-y-1"}>
      <div
        className={cn(
          "px-3 mb-1 font-semibold uppercase tracking-wider text-muted-foreground transition-opacity duration-200",
          collapsed ? "h-0 opacity-0 overflow-hidden mb-0" : "opacity-100",
        )}
        aria-hidden={collapsed}
      >
        {numberPrefix && (
          <div className="text-[14px] leading-tight mb-0.5">{numberPrefix}</div>
        )}
        <div className="text-[10px]">{mainTitle}</div>
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
