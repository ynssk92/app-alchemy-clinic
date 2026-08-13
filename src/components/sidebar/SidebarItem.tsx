import { LucideIcon, ChevronDown } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";
import { SidebarTooltip } from "./SidebarTooltip";

export type SidebarChild = { to: string; label: string; end?: boolean };

export type SidebarItemProps = {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
  children?: SidebarChild[];
};

/**
 * Collapsed rail button: 48x48, radius 14px, 20px icon, centered, slate-400
 * default, slate-700 hover with scale-105, primary + glow when active.
 */
export const collapsedItemClasses = ({ isActive }: { isActive: boolean }) =>
  cn(
    "group relative flex items-center justify-center mx-auto",
    "w-12 h-12 rounded-[14px] cursor-pointer",
    "transition-[transform,background-color,color,box-shadow] duration-200 ease-out",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
    "motion-safe:hover:scale-[1.05]",
    isActive
      ? "bg-[#E8EEFF] text-[#243B8F] shadow-sm"
      : "text-[#334155] hover:bg-[#EEF2FF] hover:text-[#243B8F]",
  );

export const SidebarItem = ({ to, icon: Icon, label, end, children }: SidebarItemProps) => {
  const { collapsed, setMobileOpen, device } = useSidebar();
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const matches = (target: string, exact?: boolean) =>
    exact ? pathname === target : pathname === target || pathname.startsWith(target + "/");

  const activeChildTo = useMemo(() => {
    if (!children?.length) return null;
    let best: { to: string; len: number } | null = null;
    for (const c of children) {
      if (!matches(c.to, c.end)) continue;
      if (!best || c.to.length > best.len) best = { to: c.to, len: c.to.length };
    }
    return best?.to ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, pathname]);

  const isChildActive = activeChildTo !== null;
  const [open, setOpen] = useState(isChildActive);

  const closeMobile = () => device === "mobile" && setMobileOpen(false);

  // ---------- COLLAPSED RAIL ----------
  if (collapsed) {
    return (
      <SidebarTooltip label={t(label)}>
        <NavLink
          to={to}
          end={end}
          onClick={closeMobile}
          aria-label={label}
          className={collapsedItemClasses}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute -left-0.5 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-[#243B8F] shadow-sm"
                />
              )}
              <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
            </>
          )}
        </NavLink>
      </SidebarTooltip>
    );
  }

  // ---------- EXPANDED (groups) ----------
  if (children && children.length) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cn(
            "group relative w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
            isChildActive
              ? "bg-[#E8EEFF] text-[#243B8F] font-semibold"
              : "text-[#475569] hover:bg-[#EEF2FF] hover:text-[#243B8F]",
          )}
        >
          {isChildActive && (
            <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#243B8F]" />
          )}
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1 truncate text-left">{t(label)}</span>
          <ChevronDown
            className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")}
            aria-hidden="true"
          />
        </button>
        <div
          className={cn(
            "grid transition-[grid-template-rows] duration-200 ease-out",
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <div className="mt-1 ml-4 space-y-0.5 border-l border-border pl-3">
              {children.map((c) => {
                const isActive = activeChildTo === c.to;
                return (
                  <NavLink
                    key={c.to}
                    to={c.to}
                    end={c.end}
                    onClick={closeMobile}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "font-semibold text-[#243B8F]"
                        : "text-[#475569] hover:text-[#243B8F]",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors",
                        isActive ? "bg-[#243B8F]" : "bg-slate-300",
                      )}
                    />
                    {t(c.label)}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={to}
      end={end}
      onClick={closeMobile}
      aria-label={label}
      className={({ isActive }) =>
        cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200",
          isActive
            ? "bg-[#E8EEFF] text-[#243B8F] font-semibold"
            : "text-[#475569] hover:bg-[#EEF2FF] hover:text-[#243B8F]",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-r bg-[#243B8F]"
            />
          )}
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{t(label)}</span>
        </>
      )}
    </NavLink>
  );
};
